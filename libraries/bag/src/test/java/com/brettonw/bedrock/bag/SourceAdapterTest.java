package com.brettonw.bedrock.bag;

import org.junit.jupiter.api.Test;

public class SourceAdapterTest {

    @Test
    public void testSourceAdapter () {
        SourceAdapter sourceAdapter = new SourceAdapter ();
        BagTest.report (sourceAdapter.getMimeType (() -> "abc"), "abc", "test getMimeType");
        BagTest.report (sourceAdapter.getStringData (() -> "def"), "def", "test getStringData");

        sourceAdapter.setMimeType ("application/json").setStringData ("xxx");
        BagTest.report (sourceAdapter.getMimeType (), "application/json", "test getMimeType");
        BagTest.report (sourceAdapter.getStringData (), "xxx", "test getStringData");

        sourceAdapter = new SourceAdapter ("yyy", "zzz");
        BagTest.report (sourceAdapter.getMimeType (), "zzz", "test getMimeType");
        BagTest.report (sourceAdapter.getStringData (), "yyy", "test getStringData");

        BagTest.report (sourceAdapter.getMimeType (() -> "abc"), "zzz", "test getMimeType");
        BagTest.report (sourceAdapter.getStringData (() -> "def"), "yyy", "test getStringData");
    }
}
