package com.brettonw.bedrock.bag;

public class BadVersionException extends RuntimeException {
    public BadVersionException (String got, @SuppressWarnings ("SameParameterValue") String expected) {
        super ("Incorrect version (got: " + got + ", expected: " + expected + ")");
    }
}
