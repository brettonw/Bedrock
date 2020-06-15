package com.brettonw.bedrock.bag;

import org.junit.jupiter.api.Test;

public class KeyTest {
    @Test
    public void test() {
        new Key ();
    }

    @Test
    public void testKey() {
        new Key ();

        // hierarchical values
        BagObject bagObject = BagObject.open  ("com/brettonw/bedrock/name", "test");
        String com = "com";
        String brettonw = "brettonw";
        String bag = "bedrock";
        String name = "name";

        String key = Key.cat (com, brettonw);
        BagTest.report (bagObject.has (Key.cat (key, "test")), false, "Key - test that an incorrect path concatenation returns false");
        BagTest.report (bagObject.has (Key.cat (key, bag, name, "xxx")), false, "Key - test that a longer incorrect path concatenation returns false");
        BagTest.report (bagObject.has (Key.cat (com, brettonw, bag, name)), true, "Key - test that a correct path returns true");
    }

}
