package com.brettonw.bedrock.bag.expr;

import com.brettonw.bedrock.bag.Bag;
import com.brettonw.bedrock.bag.BagObject;

public class Or extends BooleanExpr {
    public static final String OR = "or";

    private BooleanExpr left;
    private BooleanExpr right;

    public Or (BagObject expr) {
        left = (BooleanExpr) Exprs.get (expr.getObject (LEFT));
        right = (BooleanExpr) Exprs.get (expr.getObject (RIGHT));
    }

    @Override
    Object evaluate (Bag bag) {
        return left.evaluateIsTrue (bag) || right.evaluateIsTrue (bag);
    }

    public static BagObject bag (BagObject left, BagObject right) {
        return bag (OR, left, right);
    }
}
