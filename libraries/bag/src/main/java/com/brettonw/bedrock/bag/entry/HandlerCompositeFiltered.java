package com.brettonw.bedrock.bag.entry;

import java.util.function.Predicate;

public class HandlerCompositeFiltered extends HandlerComposite {
    private Predicate<String> filter;

    public HandlerCompositeFiltered (Predicate<String> filter) {
        this (filter, HandlerValue.HANDLER_VALUE);
    }

    public HandlerCompositeFiltered (Predicate<String> filter, Handler handler) {
        super(handler);
        this.filter = filter;
    }

    @Override
    public Object getEntry (String input) {
        return (filter.test (input) ? handler.getEntry (input) : null);
    }
}
