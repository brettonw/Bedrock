package com.brettonw.bedrock.bag.expr;

import com.brettonw.bedrock.bag.Bag;
import com.brettonw.bedrock.bag.BagObject;

public class Equality extends BooleanExpr {
    public static final String EQUALITY = "=";

    private Expr left;
    private Expr right;

    public Equality (BagObject expr) {
        left = Exprs.get (expr.getObject (LEFT));
        right = Exprs.get (expr.getObject (RIGHT));
    }

    @Override
    public Object evaluate (Bag bag) {
        Object leftResult = left.evaluate (bag);
        Object rightResult = right.evaluate (bag);
        return (leftResult != null) ? leftResult.equals (rightResult) : (rightResult == null);
    }

    public static BagObject bag (BagObject left, BagObject right) {
        return bag (EQUALITY, left, right);
    }
}
