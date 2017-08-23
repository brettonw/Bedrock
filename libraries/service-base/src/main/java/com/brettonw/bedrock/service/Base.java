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
import java.util.stream.Stream;

import static com.brettonw.bedrock.service.Keys.*;
import static java.util.stream.Collectors.joining;

public class Base extends HttpServlet {
    private static final Logger log = LogManager.getLogger (Base.class);

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
    protected BagObject api;

    protected Base () {
        this ("/api.json");
    }

    protected Base (String apiResourceName) {
        // try to load the schema and wire up the handlers
        if ((api = BagObjectFrom.resource (getClass (), apiResourceName)) != null) {
            // add a 'help' event if one isn't supplied
            String help = Key.cat (EVENTS, HELP);
            if (! api.has (help)) {
                api.put (help, BagObject
                        .open (DESCRIPTION,"Get the API description.")
                        .put (EXAMPLE, new BagObject ())
                );
            }

            // autowire... loop over the elements in the schema, looking for functions that match
            // the signature, "handleEventXxxYyy"
            String[] eventNames = api.getBagObject (EVENTS).keys ();
            for (String eventName : eventNames) {
                install (eventName);
            }

        } else {
            log.error ("Failed to load API");
            api = BagObject.open (DESCRIPTION, "BOOTSTRAP").add (EVENTS, new BagObject ());

            // bootstrap... loop over all of the methods that match the target signature and install
            // them as bootstraped generics
            Method methods[] = this.getClass ().getMethods ();
            for (Method method : methods) {
                // if the method signature matches the event handler signature
                if ((method.getName ().startsWith (Handler.HANDLER_PREFIX)) && (method.getParameterCount () == 1) && (method.getParameterTypes()[0] == Event.class)) {
                    // compute the event name (dash syntax), and check if we have it already
                    String[] elements = method.getName ().substring (Handler.HANDLER_PREFIX.length ()).split("(?=[A-Z])");
                    Stream<String> stream = Arrays.stream (elements).map (e -> e.toLowerCase ());
                    String eventName = stream.collect(joining("-"));
                    log.info ("Found event handler for '" + eventName + "'");
                    install (eventName);

                    // add a default api description so it passes validation
                    api.put (Key.cat (EVENTS, eventName), BagObject
                            .open (DESCRIPTION, "Bootstrap " + method.getName ())
                            .add (STRICT, false)
                    );
                }
            }
        }

        // if the API didn't supply a name, add one
        api.put (NAME, getName ());
    }

    public String getName () {
        String name = null;

        // if the designer supplied a name...
        if ((name == null) && (api != null) && (api.has (NAME))) {
            name = api.getString (NAME);
        }

        // or if the POM has a name
        if (name == null) {
            name = getClass ().getPackage ().getImplementationTitle ();
        }

        // or if the web context supplies a name...
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
        if (api != null) {
            // create the event object around the request parameters, and validate that it is
            // a known event
            String eventName = event.getEventName ();
            if (eventName != null) {
                BagObject eventSpecification = api.getBagObject (Key.cat (EVENTS, eventName));
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
            log.info ("Installed '" + handler.getMethodName () + "'");
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
        event.ok (api);
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
