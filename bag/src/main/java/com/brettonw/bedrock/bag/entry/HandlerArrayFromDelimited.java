package com.brettonw.bedrock.bag.entry;

import com.brettonw.bedrock.bag.BagArray;

public class HandlerArrayFromDelimited extends HandlerComposite {
    private String delimiter;

    public HandlerArrayFromDelimited (String delimiter) {
        this (delimiter, HandlerValue.HANDLER_VALUE);
    }

    public HandlerArrayFromDelimited (String delimiter, Handler handler) {
        super(handler);
        this.delimiter = delimiter;
    }

    @Override
    public Object getEntry (String input) {
        String[] inputEntries = input.split (delimiter);
        final BagArray bagArray = new BagArray (inputEntries.length);
        for (String inputEntry : inputEntries) {
            Object entry = handler.getEntry (inputEntry);
            if (entry != null) {
                bagArray.add (entry);
            }
        }
        return (bagArray.getCount () > 0) ? bagArray : null;
    }
}
