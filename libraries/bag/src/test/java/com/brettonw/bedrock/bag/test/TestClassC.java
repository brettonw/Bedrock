package com.brettonw.bedrock.bag.test;

public class TestClassC extends TestClassB {
    private int d;
    private long e;
    private float f;
    public int g;

    public TestClassC () {
        d = 3;
    }

    public TestClassC (int a, long b, float c, int d, long e, float f) {
        super (a, b, c);
        this.d = d; this.e = e; this.f = f;
        g = d + (int) e;
    }

    public int getD () {
        return d;
    }

    public void setD (int d) {
        this.d = d;
    }

    public void setE (long e) {
        this.e = e;
    }

    public float getF () {
        return f;
    }

    public boolean test (int a, long b, float c, int d, long e, float f) {
        return (this.a == a) && (this.b == b) && (this.c == c) && (this.d == d) && (this.e == e) && (this.f == f) && (this.g == (d + (int) e));
    }
}
