package com.brettonw.bedrock.bag.entry;

import com.brettonw.bedrock.bag.BagArray;

/**
 * in an array of subarrays, collects the subarrays into new subarrays consisting of a number of the original subarrays
 * XXX need a better description than that
 */
public class HandlerCollector implements Handler {
    private int collectCount;
    private Handler arrayHandler;

    public HandlerCollector (int collectCount, Handler arrayHandler) {
        this.collectCount = collectCount;
        this.arrayHandler = arrayHandler;
    }

    @Override
    public Object getEntry (String input) {
        // read the bag array of the input, and check for success
        BagArray bagArray = (BagArray) arrayHandler.getEntry (input);
        if (bagArray != null) {
            int count = bagArray.getCount () / collectCount;
            BagArray result = new BagArray (count);
            // gather up the collections, concatenating them into new array entries
            for (int i = 0; i < count; ++i) {
                BagArray entry = new BagArray ();
                for (int j = 0; j < collectCount; ++j) {
                    int k = (i * collectCount) + j;
                    entry = BagArray.concat (entry, bagArray.getBagArray (k));
                }
                result.add (entry);
            }
            return result;
        }
        return null;
    }
}
