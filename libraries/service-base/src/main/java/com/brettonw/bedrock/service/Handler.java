package com.brettonw.bedrock.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class Handler {
    private static final Logger log = LogManager.getLogger (Handler.class);

    public static final String HANDLER_PREFIX = "handleEvent";

    private Object container;
    private Method method;
    private String eventName;

    public Handler (String eventName, Object container) throws NoSuchMethodException {
        this.container = container;
        this.eventName = eventName;

        // construct the method name, and look it up in the container
        int dash;
        String methodName = HANDLER_PREFIX + "-" + eventName;
        while ((dash = methodName.indexOf ('-')) >= 0) {
            int skip = dash + 1, end = skip + 1;
            methodName = methodName.substring (0, dash) + methodName.substring (skip, end).toUpperCase () + methodName.substring (end);
        }

        // this might fail for a variety of reasons, including the method is present but not public
        method = container.getClass ().getMethod (methodName, Event.class);
    }

    public String getEventName () {
        return eventName;
    }

    public void handle (Event event) {
        log.info (eventName);
        try {
            method.invoke (container, event);
        } catch (IllegalAccessException exception) {
            // this will never happen. the handler installation fails if the method is not public,
            // so it will never be installed if this would happen, and therefore never have the
            // opportunity to throw this exception. it is included here because the code won't
            // compile withut it.
            // event.error (exception.toString ());
        } catch (InvocationTargetException exception) {
            Throwable cause = exception.getCause ();
            event.error (cause.toString ());
            log.error (method.getName () + " failed", cause);
        }
    }

    public String getMethodName () {
        return method.getName ();
    }
}
