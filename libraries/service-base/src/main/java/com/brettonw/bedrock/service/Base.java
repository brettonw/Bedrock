package com.brettonw.bedrock.service;

import com.brettonw.bedrock.bag.*;
import com.brettonw.bedrock.bag.formats.MimeType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static java.util.stream.Collectors.joining;

public class Base extends HttpServlet {
    private static final Logger log = LogManager.getLogger (Base.class);

    public static final String CONTENT_TYPE = "Content-Type";
    public static final String DESCRIPTION = "description";
    public static final String DISPLAY_NAME = "display-name";
    public static final String ERROR = "error";
    public static final String EVENT = "event";
    public static final String EVENTS = "events";
    public static final String EXAMPLE = "example";
    public static final String HELP = "help";
    public static final String MULTIPLE = "multiple";
    public static final String NAME = "name";
    public static final String OK = "ok";
    public static final String PARAMETERS = "parameters";
    public static final String POM_NAME = "pom-name";
    public static final String POM_VERSION = "pom-version";
    public static final String POST_DATA = "post-data";
    public static final String QUERY = "query";
    public static final String REQUIRED = "required";
    public static final String RESPONSE = "response";
    public static final String SERVLET = "servlet";
    public static final String STATUS = "status";
    public static final String STRICT = "strict";
    public static final String VERSION = "version";
    public static final String SCHEMA = "schema";

    private static ServletContext context;

    public static ServletContext getContext () {
        return context;
    }

    public static Object getAttribute (String key) {
        return (context != null) ? context.getAttribute (key) : null;
    }

    public static Object setAttribute (String key, Object value) {
        if (context != null) {
            Object oldValue = context.getAttribute (key);
            context.setAttribute (key, value);
            return oldValue;
        }
        return null;
    }

    private final Map<String, Handler> handlers = new HashMap<> ();

    private String configurationResourcePath = "/WEB-INF/configuration.json";
    private BagObject configuration;
    private BagObject schema;

    protected BagObject getSchema () {

        return schema;
    }

    protected BagObject getConfiguration () {
        // check to see if the servlet has been initialized
        if (context != null) {
            // if we already have the configuration, return it
            if (configuration != null) {
                return configuration;
            }

            // otherwise, try to load the configuration from the specified file resource
            String configurationPath = getContext ().getRealPath (configurationResourcePath);
            log.info ("configuration path: " + configurationPath);
            configuration = BagObjectFrom.inputStream (getContext ().getResourceAsStream (configurationResourcePath), () -> new BagObject ());

            // common values for building the schema
            String help = Key.cat (EVENTS, HELP);

            // try to load the schema and wire up the handlers
            schema = configuration.getBagObject (SCHEMA);
            if (schema != null) {
                // add a 'help' event if one isn't supplied
                if (! schema.has (help)) {
                    schema.put (help, BagObjectFrom.resource (getClass (), "/help.json"));
                }

                // autowire... install the events in the schema - it is treated as authoritative so that
                // only specified events are exposed
                String[] eventNames = schema.getBagObject (EVENTS).keys ();
                for (String eventName : eventNames) {
                    install (eventName);
                }
            } else {
                log.error ("Starting service with no schema.");

                // create a bootstrap schema, add the help descriptor, and put it into the configuration
                schema = BagObjectFrom.resource (getClass (), "/bootstrap.json");
                schema.put (help, BagObjectFrom.resource (getClass (), "/help.json"));
                configuration.put (SCHEMA, schema);

                // bootstrap... loop over all of the methods that match the target signature and install
                // them as bootstraped generics
                Method methods[] = this.getClass ().getMethods ();
                for (Method method : methods) {
                    // if the method signature matches the event handler signature
                    if ((method.getName ().startsWith (Handler.HANDLER_PREFIX)) && (method.getParameterCount () == 1) && (method.getParameterTypes()[0] == Event.class)) {
                        // compute the event name (dash syntax), and install the handler
                        String[] elements = method.getName ().substring (Handler.HANDLER_PREFIX.length ()).split("(?=[A-Z])");
                        String eventName = Arrays.stream (elements).map (e -> e.toLowerCase ()).collect(joining("-"));
                        install (eventName);

                        // add a default schema entry if one isn't in the bootstrap so it passes
                        // basic validation
                        String schemaName = Key.cat (EVENTS, eventName);
                        if (!schema.has (schemaName)) {
                            log.info ("Adding bootstrap schema entry for '" + eventName + "'");
                            schema.put (schemaName, BagObject
                                    .open (DESCRIPTION, "Bootstrap " + method.getName ())
                                    .add (STRICT, false)
                            );
                        }
                    }
                }
            }

            // if the schema didn't supply a name, add one
            schema.put (NAME, getName ());

            // return the built result
            return configuration;
        } else {
            log.error ("Configuration requested before initialization.");
            return null;
        }
    }

    protected Base () {
    }

    protected Base (String configurationResourcePath) {
        this.configurationResourcePath = configurationResourcePath;
    }

    public String getName () {
        // if the configuration supplies a name,,,
        String name = (configuration != null) ? configuration.getString (NAME) : null;

        // or if the schema supplies a name...
        if ((name == null) && (schema != null)) {
            name = schema.getString (NAME);
        }

        // or if the POM has a name
        if (name == null) {
            name = getClass ().getPackage ().getImplementationTitle ();
        }

        // or if the web context supplies a name... this should be the last resort
        if ((name == null) && (context != null) && (context.getServletContextName () != null)) {
            name = context.getServletContextName ();
        }

        return (name != null) ? name : "[UNNAMED]";
    }

    @Override
    public void init (ServletConfig config) throws ServletException {
        super.init (config);
        context = config.getServletContext ();
        log.debug ("STARTING " + getName ());
        setAttribute (SERVLET, this);

        // configure the application
        getConfiguration ();
    }

    @Override
    public void destroy () {
        super.destroy ();
        log.debug (getName () + " DESTROYING...");
    }

    @Override
    public void doGet (HttpServletRequest request, HttpServletResponse response) throws IOException {
        BagObject query = BagObjectFrom.string (request.getQueryString (), MimeType.URL, () -> new BagObject ());
        handleRequest (query, request, response);
    }

    @Override
    public void doPost (HttpServletRequest request, HttpServletResponse response) throws IOException {
        // get the request data type, then tease out the response type (use a default if it's not present) and the
        // charset (if given, otherwise default to UTF-8, because that's what it will be in Java)
        String mimeType = MimeType.DEFAULT;
        String contentTypeHeader = request.getHeader (CONTENT_TYPE);
        if (contentTypeHeader != null) {
            String[] contentType = contentTypeHeader.replace (" ", "").split (";");
            mimeType = contentType[0];
            log.debug ("'Content-Type' is (" + mimeType + ")");
        } else {
            log.warn ("'Content-Type' is not set by the requestor, using default (" + mimeType + ")");
        }

        // extract the bedrock data that's been posted, we do it this roundabout way because
        // we don't know a priori if it's an object or array
        SourceAdapter sourceAdapter = new SourceAdapterReader(request.getInputStream (), mimeType);
        String requestString = sourceAdapter.getStringData ();
        Bag postData = BagObjectFrom.string (requestString, mimeType);
        if (postData == null) postData = BagArrayFrom.string (requestString);

        // handle the query part normally, but add the post data to it (if any)
        BagObject query = BagObjectFrom.string (request.getQueryString (), MimeType.URL, () -> new BagObject ())
                .put (POST_DATA, postData);
        handleRequest (query, request, response);
    }

    private void handleRequest (BagObject query, HttpServletRequest request, HttpServletResponse response) throws IOException {
        Event event = handleEvent (query, request);
        String UTF_8 = StandardCharsets.UTF_8.name ();
        response.setContentType (MimeType.JSON + "; charset=" + UTF_8);
        response.setCharacterEncoding (UTF_8);
        PrintWriter out = response.getWriter ();
        out.println (event.getResponse ().toString (MimeType.JSON));
        out.close ();
    }

    private Event handleEvent (BagObject query, HttpServletRequest request) {
        Event event = new Event (query, request);
        if (schema != null) {
            // create the event object around the request parameters, and validate that it is
            // a known event
            String eventName = event.getEventName ();
            if (eventName != null) {
                BagObject eventSpecification = schema.getBagObject (Key.cat (EVENTS, eventName));
                if (eventSpecification != null) {
                    // validate the query parameters
                    BagObject parameterSpecification = eventSpecification.getBagObject (PARAMETERS);
                    boolean strict = eventSpecification.getBoolean (STRICT, () -> true);
                    BagArray validationErrors = new BagArray ();

                    if (strict) {
                        // loop over the query parameters to be sure they are all valid
                        String[] queryParameters = query.keys ();
                        for (int i = 0; i < queryParameters.length; ++i) {
                            String queryParameter = queryParameters[i];
                            if (!queryParameter.equals (EVENT)) {
                                if ((parameterSpecification == null) || (!parameterSpecification.has (queryParameter))) {
                                    validationErrors.add ("Unspecified parameter: '" + queryParameter + "'");
                                }
                            }
                        }
                    }

                    // loop over the parameter specification to be sure all of the required ones are present
                    if (parameterSpecification != null) {
                        String[] expectedParameters = parameterSpecification.keys ();
                        for (int i = 0; i < expectedParameters.length; ++i) {
                            String expectedParameter = expectedParameters[i];
                            if (parameterSpecification.getBoolean (Key.cat (expectedParameter, REQUIRED), () -> false)) {
                                if (!query.has (expectedParameter)) {
                                    validationErrors.add ("Missing required parameter: '" + expectedParameter + "'");
                                }
                            }
                        }
                    }

                    // if the validation passed
                    if (validationErrors.getCount () == 0) {
                        // get the handler, and try to take care of business...
                        Handler handler = handlers.get (eventName);
                        if (handler != null) {
                            // finally, do your business
                            handler.handle (event);
                        } else {
                            event.error ("No handler installed for '" + EVENT + "' (" + eventName + ")");
                        }
                    } else {
                        event.error (validationErrors);
                    }
                } else {
                    event.error ("Unknown '" + EVENT + "' (" + eventName + ")");
                }
            } else {
                event.error ("Missing '" + EVENT + "'");
            }
        } else {
            // XXX what are the circumstances under which this happens? I ask because it shouldn't
            event.error ("Missing API");
        }
        return event;
    }

    public boolean install (String eventName) {
        try {
            Handler handler = new Handler (eventName, this);
            handlers.put (handler.getEventName (), handler);
            log.info ("Installed handler '" + handler.getMethodName () + "' for '" + eventName + "'");
            return true;
        } catch (NoSuchMethodException exception) {
            log.error ("Install '" + EVENT + "' failed for (" + eventName + ")", exception);
            return false;
        }
    }

    // default handlers
    public void handleEventOk (Event event) {
        event.ok ();
    }

    public void handleEventHelp (Event event) {
        event.ok (schema);
    }

    public void handleEventVersion (Event event) {
        event.ok (BagObject
                .open (POM_VERSION, getClass ().getPackage ().getImplementationVersion ())
                .put (DISPLAY_NAME, getName ())
        );
    }

    public void handleEventMultiple (Event event) {
        BagArray eventsArray = event.getQuery ().getBagArray (POST_DATA);
        if (eventsArray != null) {
            int eventCount = eventsArray.getCount ();
            BagArray results = new BagArray (eventCount);
            for (int i = 0; i < eventCount; ++i) {
                Event subEvent = handleEvent (eventsArray.getBagObject (i), event.getRequest ());
                results.add (subEvent.getResponse ());
            }
            event.ok (results);
        } else {
            event.error ("No events found (expected an array in '" + POST_DATA + "')");
        }
    }
}
