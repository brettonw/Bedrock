package com.brettonw.bedrock.bag.test;

import java.util.HashSet;
import java.util.Set;

public class TestClassA {
    public Integer x;
    public boolean y;
    public double z;
    public String abc;
    public TestClassB sub;
    public TestEnumXYZ xyz;
    public Set<String> things;

    private TestClassA () {
        x = 3;
        things = new HashSet<> ();
        things.add ("Hello");
        things.add ("There");
    }

    public TestClassA (int x, boolean y, double z, String abc, TestEnumXYZ xyz) {
        this.x = x; this.y = y; this.z = z;
        this.abc = abc;
        sub = new TestClassB (x + 2, x + 1000, (float) z / 2.0f);
        this.xyz = xyz;

        things = new HashSet<> ();
        things.add ("Goodbye");
        things.add ("Yellow");
        things.add ("Brick");
        things.add ("Road");
    }
}
