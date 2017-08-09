package com.brettonw.bedrock.bag.entry;

public abstract class HandlerComposite implements Handler {
    protected Handler handler;

    protected HandlerComposite (Handler handler) {
        this.handler = handler;
    }
}
