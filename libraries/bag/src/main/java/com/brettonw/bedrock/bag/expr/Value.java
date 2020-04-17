package com.brettonw.bedrock.bag.expr;

import com.brettonw.bedrock.bag.Bag;
import com.brettonw.bedrock.bag.BagObject;

public class Value extends Expr {
    public static final String VALUE = "value";

    private String value;

    public Value (BagObject expr) {
        value = expr.getString (VALUE);
    }

    @Override
    public Object evaluate (Bag bag) {
        return value;
    }

    public static BagObject bag (Object value) {
        return bag (VALUE).put (VALUE, value);
    }
}
