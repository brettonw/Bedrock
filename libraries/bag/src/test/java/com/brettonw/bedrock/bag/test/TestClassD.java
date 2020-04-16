package com.brettonw.bedrock.bag.test;

public class TestClassD {
    private String d;

    public TestClassD (String d) {
        this.d = d;
    }

    @Override
    public boolean equals (Object obj) {
        if (obj instanceof TestClassD) {
            return d.equals (((TestClassD) obj).d);
        }
        return false;
    }
}
