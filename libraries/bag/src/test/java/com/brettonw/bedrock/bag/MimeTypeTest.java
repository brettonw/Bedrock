package com.brettonw.bedrock.bag;

import com.brettonw.bedrock.bag.formats.MimeType;
import org.junit.jupiter.api.Test;

public class MimeTypeTest {
    @Test
    public void testMimeType () {
        MimeType mimeType = new MimeType ();
    }

    @Test
    public void testExtensions () {
        BagTest.report (MimeType.getFromExtension ("json"), MimeType.JSON, "Get the type associate with 'json'");
        BagTest.report (MimeType.getFromExtension ("properties"), MimeType.PROP, "Get the type associate with 'properties'");
        BagTest.report (MimeType.getFromExtension ("url"), MimeType.URL, "Get the type associate with 'url'");
        BagTest.report (MimeType.getFromExtension ("xxx"), null, "Get the type associate with 'xxx'");
    }
}
