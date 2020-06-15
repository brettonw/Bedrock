package com.brettonw.bedrock.bag;

import com.brettonw.bedrock.bag.formats.MimeType;
import org.junit.jupiter.api.Test;

import java.io.IOException;

public class SourceAdapterHttpTest {
    @Test
    public void testSourceAdapterHttpGet () {
        try {
            SourceAdapter sourceAdapter = new SourceAdapterHttp ("https://bedrock.brettonw.com/api?event=ip-address");
            BagObject responseBagObject = BagObjectFrom.string (sourceAdapter.getStringData (), sourceAdapter.getMimeType ());
            BagTest.report (responseBagObject.getString ("response/ip-address") != null, true, "Got a valid response");
        } catch (IOException exception ){
            BagTest.report (true, false, "An exception is a failure");
        }
    }

    @Test
    public void testSourceAdapterHttpPost () {
        try {
            BagObject bagObject = new BagObject ()
                    .put ("login", "brettonw")
                    .put ("First Name", "Bretton")
                    .put ("Last Name", "Wade");
            SourceAdapter sourceAdapter = new SourceAdapterHttp ("https://bedrock.brettonw.com/api?event=echo-post", bagObject, MimeType.JSON);
            BagObject responseBagObject = BagObjectFrom.string (sourceAdapter.getStringData (), sourceAdapter.getMimeType ());
            BagTest.report (responseBagObject.getString ("login"), "brettonw", "Got a valid response");
        } catch (IOException exception ){
            BagTest.report (true, false, "An exception is a failure");
        }
    }
}
