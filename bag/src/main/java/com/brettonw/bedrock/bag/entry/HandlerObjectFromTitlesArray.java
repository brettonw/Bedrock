package com.brettonw.bedrock.bag.entry;

import com.brettonw.bedrock.bag.BagArray;
import com.brettonw.bedrock.bag.BagObject;

public class HandlerObjectFromTitlesArray implements Handler {
    private BagArray titlesArray;
    private Handler arrayHandler;

    public HandlerObjectFromTitlesArray (BagArray titlesArray, Handler arrayHandler) {
        this.titlesArray = titlesArray;
        this.arrayHandler = arrayHandler;
    }

    @Override
    public Object getEntry (String input) {
        // read the bag array of the input, and check for success
        BagArray bagArray = (BagArray) arrayHandler.getEntry (input);
        if (bagArray != null) {
            // create a bag object from the array of entries using the titles array
            int count = titlesArray.getCount ();
            if (count == bagArray.getCount ()) {
                BagObject bagObject = new BagObject (count);
                for (int i = 0; i <count; ++i) {
                    bagObject.put (titlesArray.getString (i), bagArray.getObject (i));
                }

                // return the result
                return bagObject;
            }
        }
        return null;
    }
}
