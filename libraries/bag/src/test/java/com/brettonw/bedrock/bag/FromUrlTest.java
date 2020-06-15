package com.brettonw.bedrock.bag;

import com.brettonw.bedrock.bag.formats.MimeType;
import org.junit.jupiter.api.Test;

import java.io.IOException;

public class FromUrlTest {
    @Test
    public void test () {

    }

    @Test
    public void testGet () throws IOException {
        BagObject brettonw = BagObjectFrom.url ("https://bedrock.brettonw.com/api?event=ip-address", () -> null);
        BagTest.report (brettonw.getString ("response/ip-address") != null, true, "Got a valid BagObject");

        // XXX should add an array processor to the test API for when github throttles the API
        BagArray arrayEcho = BagArrayFrom.url ("https://bedrock.brettonw.com/api?event=echo-array", () -> null);
        BagTest.report (arrayEcho.getCount () > 0, true, "Got a valid BagArray");
    }

    @Test
    public void testPost () throws IOException {
        BagObject postResponseBagObject = BagObjectFrom.url ("https://bedrock.brettonw.com/api?event=echo",
                new BagObject ()
                        .put ("login", "brettonw")
                        .put ("First Name", "Bretton")
                        .put ("Last Name", "Wade"),
                MimeType.JSON,
                () -> null
        );
        BagTest.report (postResponseBagObject.getString ("post-data/login"), "brettonw", "Got a valid BagObject - 1");

        postResponseBagObject = BagObjectFrom.url ("https://bedrock.brettonw.com/api?event=echo",
                new BagObject ()
                        .put ("login", "brettonw")
                        .put ("First Name", "Bretton")
                        .put ("Last Name", "Wade"),
                MimeType.JSON
        );
        BagTest.report (postResponseBagObject.getString ("post-data/login"), "brettonw", "Got a valid BagObject - 2");

        BagArray postResponseBagArray = BagArrayFrom.url ("https://bedrock.brettonw.com/api?event=echo-post",
                new BagArray ()
                        .add ("login")
                        .add ("brettonw")
                        .add ("First Name")
                        .add ("Bretton")
                        .add ("Last Name")
                        .add ("Wade"),
                MimeType.JSON
        );
        BagTest.report (postResponseBagArray.getString (1), "brettonw", "Got a valid BagArray - 1");

        postResponseBagArray = BagArrayFrom.url ("https://bedrock.brettonw.com/api?event=echo-post",
                new BagArray ()
                        .add ("login")
                        .add ("brettonw")
                        .add ("First Name")
                        .add ("Bretton")
                        .add ("Last Name")
                        .add ("Wade"),
                MimeType.JSON,
                () -> null
        );
        BagTest.report (postResponseBagArray.getString (1), "brettonw", "Got a valid BagArray - 2");
    }

    @Test
    public void testBogusGet () throws IOException {
        BagObject bogus = BagObjectFrom.url ("http://gojsonogle.com", () -> null);
        BagTest.report (bogus, null, "Not a valid URL");
    }

    @Test
    public void testBogusPost () throws IOException {
        BagObject bogus = BagObjectFrom.url ("http://gojsonogle.com", BagObject.open  ("a", "b"), MimeType.JSON, () -> null);
        BagTest.report (bogus, null, "Not a valid URL");
    }
}
