package com.brettonw.bedrock.bag.entry;

public class HandlerValue implements Handler {
    public static final HandlerValue HANDLER_VALUE = new HandlerValue ();

    private HandlerValue () {}

    @Override
    public Object getEntry (String input) {
        return input.trim ();
    }
}
