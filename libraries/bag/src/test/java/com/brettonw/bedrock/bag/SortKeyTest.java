package com.brettonw.bedrock.bag;

import org.junit.jupiter.api.Test;

public class SortKeyTest {

    @Test
    public void testSortKeyDefaultConstructor () {
        SortKey a = new SortKey ();
        a.setKey ("Hello");

        BagTest.report (a.getKey (), "Hello", "Test getKey");

        a.setType (SortType.NUMERIC);
        BagTest.report (a.getType (), SortType.NUMERIC, "Test getType");
        a.setType (SortType.ALPHABETIC);
        BagTest.report (a.getType (), SortType.ALPHABETIC, "Test getType");

        a.setOrder (SortOrder.ASCENDING);
        BagTest.report (a.getOrder (), SortOrder.ASCENDING, "Test getOrder");
        a.setOrder (SortOrder.DESCENDING);
        BagTest.report (a.getOrder (), SortOrder.DESCENDING, "Test getOrder");
    }

    @Test
    public void testSortKeyConstructor () {
        SortKey a = new SortKey ("Hello", SortType.NUMERIC, SortOrder.ASCENDING);

        BagTest.report (a.getKey (), "Hello", "Test getKey");
        BagTest.report (a.getType (), SortType.NUMERIC, "Test getType");
        BagTest.report (a.getOrder (), SortOrder.ASCENDING, "Test getOrder");
    }

    @Test
    public void testSortKeyBagObject () {
        SortKey a = new SortKey (new BagObject ()
                .put (SortKey.KEY, "Hello")
        );

        BagTest.report (a.getKey (), "Hello", "Test getKey");
        BagTest.report (a.getType (), SortKey.DEFAULT_TYPE, "Test getType");
        BagTest.report (a.getOrder (), SortKey.DEFAULT_ORDER, "Test getOrder");

        a = new SortKey (new BagObject ()
                .put (SortKey.KEY, "Hello")
                .put (SortKey.TYPE, SortType.ALPHABETIC)
        );

        BagTest.report (a.getKey (), "Hello", "Test getKey");
        BagTest.report (a.getType (), SortType.ALPHABETIC, "Test getType");
        BagTest.report (a.getOrder (), SortKey.DEFAULT_ORDER, "Test getOrder");

        a = new SortKey (new BagObject ()
                .put (SortKey.KEY, "Hello")
                .put (SortKey.ORDER, SortOrder.DESCENDING)
        );

        BagTest.report (a.getKey (), "Hello", "Test getKey");
        BagTest.report (a.getType (), SortType.ALPHABETIC, "Test getType");
        BagTest.report (a.getOrder (), SortOrder.DESCENDING, "Test getOrder");
    }

    @Test
    public void testSortKeyCompare () {
        SortKey
        a = new SortKey (null, SortType.ALPHABETIC, SortOrder.ASCENDING);
        BagTest.report (a.compare ("10", "10"), 0, "Test compare");
        BagTest.report (a.compare ("10", "2") < 0, true, "Test compare");

        a = new SortKey (null, SortType.ALPHABETIC, SortOrder.DESCENDING);
        BagTest.report (a.compare ("10", "10"), 0, "Test compare");
        BagTest.report (a.compare ("10", "2") > 0, true, "Test compare");

        a = new SortKey (null, SortType.NUMERIC, SortOrder.ASCENDING);
        BagTest.report (a.compare ("10", "10"), 0, "Test compare");
        BagTest.report (a.compare ("10", "2") > 0, true, "Test compare");

        a = new SortKey (null, SortType.NUMERIC, SortOrder.DESCENDING);
        BagTest.report (a.compare ("10", "10"), 0, "Test compare");
        BagTest.report (a.compare ("10", "2") < 0, true, "Test compare");
    }
}
