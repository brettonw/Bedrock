package com.brettonw.bedrock.bag;

import com.brettonw.bedrock.bag.formats.MimeType;
import org.junit.jupiter.api.Test;

import java.io.File;

public class SourceAdapterReaderTest {
    @Test
    public void testSourceAdapterReader () {
        try {
            SourceAdapter sourceAdapter = new SourceAdapterReader(new File("data/bagObject.json"));
            BagTest.report (sourceAdapter.getMimeType (), MimeType.JSON, "test mime type response");
            BagTest.report (sourceAdapter.getStringData () != null, true, "test for valid string data");

            sourceAdapter = new SourceAdapterReader(getClass().getResourceAsStream("/bagObject.json"), MimeType.JSON);
            BagTest.report (sourceAdapter.getMimeType (), MimeType.JSON, "test mime type response");
            BagTest.report (sourceAdapter.getStringData () != null, true, "test for valid string data");

            sourceAdapter = new SourceAdapterReader("{}", MimeType.JSON);
            BagTest.report (sourceAdapter.getMimeType (), MimeType.JSON, "test mime type response");
            BagTest.report (sourceAdapter.getStringData () != null, true, "test for valid string data");

            sourceAdapter = new SourceAdapterReader(getClass(), "/bagObject.json");
            BagTest.report (sourceAdapter.getMimeType (), MimeType.JSON, "test mime type response");
            BagTest.report (sourceAdapter.getStringData () != null, true, "test for valid string data");

        } catch (Exception exception) {
            BagTest.report(true, false, "Any exception is a failure");
        }
    }
}
