package com.brettonw.bedrock.bag.entry;

public class HandlerRoller implements Handler {
    private Handler[] handlers;
    private int roll;

    public HandlerRoller (Handler... handlers) {
        this.handlers = handlers;
        roll = 0;
    }

    @Override
    public Object getEntry (String input) {
        Object result = handlers[roll].getEntry (input);
        roll = (roll + 1) % handlers.length;
        return result;
    }
}
