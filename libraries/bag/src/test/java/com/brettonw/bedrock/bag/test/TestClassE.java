package com.brettonw.bedrock.bag.test;

public class TestClassE {
    private String e;

    public TestClassE (String e) {
        this.e = e;
    }

    @Override
    public boolean equals(Object obj) {
        return ((TestClassE)obj).e.equals (e);
    }
}
