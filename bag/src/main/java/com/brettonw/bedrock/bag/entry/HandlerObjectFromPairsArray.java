package com.brettonw.bedrock.bag.entry;

import com.brettonw.bedrock.bag.BagArray;
import com.brettonw.bedrock.bag.BagObject;

public class HandlerObjectFromPairsArray implements Handler {
    private Handler arrayHandler;
    protected boolean accumulateEntries;

    public HandlerObjectFromPairsArray (Handler arrayHandler) {
        super ();
        this.arrayHandler = arrayHandler;
        accumulateEntries = false;
    }

    public HandlerObjectFromPairsArray accumulateEntries (boolean accumulateEntries) {
        this.accumulateEntries = accumulateEntries;
        return this;
    }

    @Override
    public Object getEntry (String input) {
        // read the bag array of the input, and check for success
        BagArray bagArray = (BagArray) arrayHandler.getEntry (input);
        if (bagArray != null) {
            // create a bag object from the array of pairs
            BagObject bagObject = new BagObject (bagArray.getCount ());
            bagArray.forEach (object -> {
                BagArray pair = (BagArray) object;
                    if (accumulateEntries) {
                        bagObject.add (pair.getString (0), pair.getString (1));
                    } else {
                        bagObject.put (pair.getString (0), pair.getString (1));
                    }
            });

            // return the result
            return bagObject;
        }
        return null;
    }
}
