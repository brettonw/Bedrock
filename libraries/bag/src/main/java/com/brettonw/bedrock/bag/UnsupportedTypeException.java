package com.brettonw.bedrock.bag;

public class UnsupportedTypeException extends RuntimeException {
    public UnsupportedTypeException (Class type) {
        super ("Unsupported type for storage in low-level bedrock container (" + type.getName () + "), did you mean to use the Serializer?");
    }
}
