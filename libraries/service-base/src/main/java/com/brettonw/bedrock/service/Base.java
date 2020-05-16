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
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
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
    public static final String SECRET = "secret";
    public static final String SALT = "salt";
    public static final String HASH = "hash";

    private static ServletContext context;
    private static boolean locked;

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

    public static String getBedrockVersion () {
        return Base.class.getPackage ().getImplementationVersion ();
    }

    public static String getIpAddress (Event event) {
        HttpServletRequest request = event.getRequest ();
        String ipAddress = request.getRemoteAddr ();

        // try to get the x-forwarded header, the last one...
        String forwarding = request.getHeader ("x-forwarded-for");
        if (forwarding != null) {
            String[] forwards = forwarding.split (",");
            for (String forward : forwards) {
                forward = forward.trim ();
                ipAddress = forward.split (":")[0];
            }
        }

        return ipAddress;
    }

    private final Map<String, Handler> handlers = new HashMap<> ();

    private String configurationResourcePath = "/WEB-INF/configuration.json";
    private BagObject configuration;
    private BagObject schema;

    protected BagObject getSchema () {
        // return a deep copy so the user can't accidentally modify it
        return new BagObject (schema);
    }

    protected BagObject getConfiguration () {
        // if we already have the configuration, return it
        if (configuration != null) {
            return configuration;
        }

        // otherwise, check to see if the servlet has been initialized
        if (context != null) {
            // try to load the configuration from the specified file resource
            String configurationPath = getContext ().getRealPath (configurationResourcePath);
            log.info ("configuration path: " + configurationPath);
            configuration = BagObjectFrom.inputStream (getContext ().getResourceAsStream (configurationResourcePath), () -> new BagObject ());

            // common values for building the schema
            String help = Key.cat (EVENTS, HELP);
            String version = Key.cat (EVENTS, VERSION);

            // try to fetch the schema
            if ((schema = configuration.getBagObject (SCHEMA)) != null) {
                // remove the schema object from the configuration so it is protected
                configuration.remove (SCHEMA);

                // add a 'help' event if one isn't supplied
                if (! schema.has (help)) {
                    schema.put (help, BagObjectFrom.resource (getClass (), "/help.json"));
                }

                // add a 'version' event if one isn't supplied
                if (! schema.has (version)) {
                    schema.put (version, BagObjectFrom.resource (getClass (), "/version.json"));
                }

                // wire up the handlers specified in the schema - it is treated as authoritative so that
                // only specified events are exposed
                String[] eventNames = schema.getBagObject (EVENTS).keys ();
                for (String eventName : eventNames) {
                    install (eventName);
                }
            } else {
                // there is no schema, so report the warning
                log.warn ("Starting service with no schema.");

                // create a bootstrap schema and add the help and version descriptors
                schema = BagObjectFrom.resource (getClass (), "/bootstrap.json");
                schema.put (help, BagObjectFrom.resource (getClass (), "/help.json"));
                schema.put (version, BagObjectFrom.resource (getClass (), "/version.json"));

                // bootstrap/autowire... loop over all of the methods that match the target signature
                // and install them as bootstraped generics
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

            // return the built configuration
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

    public String getVersion () {
        return getClass ().getPackage ().getImplementationVersion ();
    }

    @Override
    public void init (ServletConfig config) throws ServletException {
        super.init (config);
        context = config.getServletContext ();
        locked = false;
        log.info ("STARTING " + getName () + " v." + getVersion () + " with Bedrock v." + getBedrockVersion ());
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

    private void addCorsHeaders (HttpServletResponse response) {
        // check to see if CORS is desired on this api
        if (true) {
            // the base CORS headers
            response.setHeader ("Access-Control-Allow-Origin", "*");
            response.setHeader ("Access-Control-Allow-Headers", "*");
            response.setHeader ("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        }
    }

    @Override
    public void doOptions (HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        addCorsHeaders (response);
        super.doOptions (request, response);
    }

    private void handleRequest (BagObject query, HttpServletRequest request, HttpServletResponse response) throws IOException {
        // handle the event before we add headers and charsets so that exceptions are correctly
        // reported back to the application container
        Event event = handleEvent (query, request);
        String UTF_8 = StandardCharsets.UTF_8.name ();
        response.setContentType (MimeType.JSON + "; charset=" + UTF_8);
        response.setCharacterEncoding (UTF_8);

        // tell the browsers we know what we are returning (JSON is "protected")
        response.setHeader ("X-Content-Type-Options", "nosniff");
        addCorsHeaders (response);

        PrintWriter out = response.getWriter ();
        out.println (event.getResponse ().toString (MimeType.JSON));
        out.close ();
    }

    private void validateParameters (BagObject query, boolean strict, BagObject parameterSpecification, BagArray validationErrors) {
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
    }

    private Event handleEvent (BagObject query, HttpServletRequest request) {
        Event event = new Event (query, request);
        if (! locked) {
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
                        validateParameters (query, strict, parameterSpecification, validationErrors);

                        // validate the post-data parameters (if any)
                        if ((parameterSpecification != null) && query.has (POST_DATA)) {
                            // check to see if there is a parameter specification for the post data
                            BagObject postDataEventSpecification = parameterSpecification.getBagObject (POST_DATA);
                            if (postDataEventSpecification != null) {
                                strict = postDataEventSpecification.getBoolean (STRICT, () -> true);
                                BagObject postDataParameterSpecification = postDataEventSpecification.getBagObject (PARAMETERS);
                                if (postDataParameterSpecification != null) {
                                    // if post data is an array - iterate over all of them
                                    BagArray queryPostDataArray = query.getBagArray (POST_DATA);
                                    if (queryPostDataArray != null) {
                                        for (int i = 0, end = queryPostDataArray.getCount (); i < end; ++i) {
                                            BagObject queryPostData = queryPostDataArray.getBagObject (i);
                                            validateParameters (queryPostData, strict, postDataParameterSpecification, validationErrors);
                                        }
                                    } else {
                                        BagObject queryPostData = query.getBagObject (POST_DATA);
                                        validateParameters (queryPostData, strict, postDataParameterSpecification, validationErrors);
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
        } else {
            event.error ("Instance locked");
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

    public void handleEventLock (Event event) throws java.security.NoSuchAlgorithmException {
        // get the post data
        BagObject query = event.getQuery ();
        String secret = event.getQuery ().getString (Key.cat (POST_DATA, SECRET));

        // get the secret recipe, and either use the salt provided or make one - if we make one, it's
        // because the server configuration doesn't have a secret, and we are going to use the error
        // response to set it up...
        BagObject secretRecipe = configuration.getBagObject (SECRET);
        byte[] salt;
        String saltEncoded = secretRecipe.getString (SALT);
        if ((saltEncoded != null) && (saltEncoded.trim().length () > 0)) {
            salt = Base64.getDecoder ().decode (saltEncoded);
        } else {
            SecureRandom random = new SecureRandom();
            salt = new byte[16];
            random.nextBytes(salt);
            saltEncoded = Base64.getEncoder ().encodeToString (salt);
        }

        // extract the target hash
        byte[] targetHash = null;
        String targetHashEncoded = secretRecipe.getString (HASH);
        if ((targetHashEncoded != null) && (targetHashEncoded.trim().length () > 0)) {
            targetHash = Base64.getDecoder ().decode (targetHashEncoded);
        }

        // hash the secret
        MessageDigest messageDigest = MessageDigest.getInstance ("SHA-512");
        messageDigest.update (salt);
        byte[] hashedSecret = messageDigest.digest (secret.getBytes (StandardCharsets.UTF_8));

        // check if the hashed secret and the target hash match...
        if ((targetHash != null) && Arrays.equals(hashedSecret, targetHash)) {
            locked = true;
            event.ok ();
        } else {
            String hashedSecretEncoded = Base64.getEncoder ().encodeToString (hashedSecret);
            log.error ("secret mismatch: (salt = '" + saltEncoded + "', hash = '" + hashedSecretEncoded + "')");
            event.error ("secret mismatch");
        }
    }

    public void handleEventHelp (Event event) {
        event.ok (schema);
    }

    public void handleEventVersion (Event event) {
        event.ok (BagObject
                .open (POM_VERSION, getVersion ())
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
