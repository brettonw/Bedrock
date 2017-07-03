package com.brettonw.bedrock.service;

import lombok.Getter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class Handler {
    private static final Logger log = LogManager.getLogger (Handler.class);

    private Object container;
    private Method method;
    @Getter private String eventName;

    public Handler (String eventName, Object container) throws NoSuchMethodException {
        this.container = container;
        this.eventName = eventName;

        // construct the method name, and look it up in the container
        int dash;
        String methodName = "handleEvent-" + eventName;
        while ((dash = methodName.indexOf ('-')) >= 0) {
            int skip = dash + 1, end = skip + 1;
            methodName = methodName.substring (0, dash) + methodName.substring (skip, end).toUpperCase () + methodName.substring (end);
        }
        method = container.getClass ().getMethod (methodName, Event.class);
    }

    public void handle (Event event) {
        log.info (eventName);
        try {
            method.invoke (container, event);
        } catch (IllegalAccessException exception) {
            event.error (exception.toString ());
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
