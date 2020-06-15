package com.brettonw.bedrock.bag;

import org.junit.jupiter.api.Test;

public class SelectKeyTest {

    @Test
    public void testSelectKey () {
        SelectKey
        selectKey = new SelectKey ("Abc", "Def");
        BagTest.report (selectKey.getType (), SelectKey.DEFAULT_TYPE, "Test getType and default constructor");
        BagTest.report (selectKey.select ("Hello"), null, "Test select of value not in set");
        BagTest.report (selectKey.select ("Hello", () -> "junk"), "junk", "Test select value not in set with supplier");
        BagTest.report (selectKey.select ("Abc", () -> "junk"), "Abc", "Test select of value in the set with an unused supplier");
        BagTest.report (selectKey.select ("Abc"), "Abc", "Test select of value in the set with default supplier (null)");

        selectKey = new SelectKey (SelectType.INCLUDE, "Abc", "Def");
        BagTest.report (selectKey.getType (), SelectKey.DEFAULT_TYPE, "Test getType and default constructor");
        BagTest.report (selectKey.select ("Hello"), null, "Test select of value not in set");
        BagTest.report (selectKey.select ("Hello", () -> "junk"), "junk", "Test select value not in set with supplier");
        BagTest.report (selectKey.select ("Abc", () -> "junk"), "Abc", "Test select of value in the set with an unused supplier");
        BagTest.report (selectKey.select ("Abc"), "Abc", "Test select of value in the set with default supplier (null)");
    }

    @Test
    public void testDefaultConstructor () {
        SelectKey selectKey = new SelectKey ();
        BagTest.report (selectKey.getType (), SelectKey.DEFAULT_TYPE, "Test getType and default constructor");
        BagTest.report (selectKey.select ("Hello"), null, "Test select on empty set");
        BagTest.report (selectKey.setType (SelectType.EXCLUDE).getType (), SelectType.EXCLUDE, "Test getType and default constructor");
        BagTest.report (selectKey.select (null, () -> "junk"), "junk", "Test of notFound on null select");
    }

    @Test
    public void testBagConstructors () {
        BagArray bagArray = BagArray.open ("Abc").add ("Def");
        BagObject bagObject = BagObject.open  (SelectKey.KEYS_KEY, bagArray);
        SelectKey
        selectKey = new SelectKey (bagObject);
        BagTest.report (selectKey.getType (), SelectType.INCLUDE, "Test getType and default constructor");
        BagTest.report (selectKey.select ("Hello"), null, "Test select of value not in select key");
        BagTest.report (selectKey.select ("Abc"), "Abc", "Test select of value in select key");
        BagTest.report (selectKey.setType (SelectType.EXCLUDE).getType (), SelectType.EXCLUDE, "Test getType and default constructor");

        selectKey = new SelectKey (bagArray);
        BagTest.report (selectKey.getType (), SelectKey.DEFAULT_TYPE, "Test getType and default constructor");
        BagTest.report (selectKey.select ("Hello"), null, "Test select of value not in select key");
        BagTest.report (selectKey.select ("Abc"), "Abc", "Test select of value in select key");
        BagTest.report (selectKey.setType (SelectType.EXCLUDE).getType (), SelectType.EXCLUDE, "Test getType and default constructor");
    }

    @Test
    public void testSelectExclude () {
        BagArray bagArray = BagArray.open ("Abc").add ("Def");
        BagObject bagObject = BagObject.open  (SelectKey.TYPE_KEY, SelectType.EXCLUDE).put (SelectKey.KEYS_KEY, bagArray);
        SelectKey selectKey = new SelectKey (bagObject);
        BagTest.report (selectKey.getType (), SelectType.EXCLUDE, "Test getType");
        BagTest.report (selectKey.select ("Hello"), "Hello", "Test select (exclude) of value not in select key");
        BagTest.report (selectKey.select ("Abc"), null, "Test select (exclude) of value in select key");
    }

    @Test
    public void testSelectExcludeConstructor () {
        SelectKey selectKey = new SelectKey (SelectType.EXCLUDE, "Hello");
        BagTest.report (selectKey.getType (), SelectType.EXCLUDE, "Test getType");
        BagTest.report (selectKey.select ("Hello"), null, "Test select (exclude) of value in select key");
        BagTest.report (selectKey.select ("Bye Bye"), "Bye Bye", "Test select (exclude) of value not in select key");
    }

    @Test
    public void testSetKeys () {
        SelectKey selectKey = new SelectKey (SelectType.EXCLUDE);
        selectKey.setKeys ("Hello").addKeys ("Bing Bong");
        BagTest.report (selectKey.getType (), SelectType.EXCLUDE, "Test getType");
        BagTest.report (selectKey.select ("Hello"), null, "Test select (exclude) of value in select key");
        BagTest.report (selectKey.select ("Bye Bye"), "Bye Bye", "Test select (exclude) of value not in select key");
    }
}
