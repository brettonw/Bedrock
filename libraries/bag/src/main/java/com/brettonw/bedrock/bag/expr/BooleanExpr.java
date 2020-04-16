package com.brettonw.bedrock.bag.expr;

import com.brettonw.bedrock.bag.Bag;

abstract public class BooleanExpr extends Expr {
    public boolean evaluateIsTrue (Bag bag) {
        return (Boolean) evaluate (bag);
    }
}
