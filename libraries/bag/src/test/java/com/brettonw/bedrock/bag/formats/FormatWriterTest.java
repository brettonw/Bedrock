package com.brettonw.bedrock.bag.formats;

import com.brettonw.bedrock.bag.BagTest;
import com.brettonw.bedrock.bag.BagArray;
import com.brettonw.bedrock.bag.BagObject;
import com.brettonw.bedrock.bag.BagObjectFrom;
import org.junit.jupiter.api.Test;

public class FormatWriterTest {

    static {
        new FormatWriterJson ();
    }
    @Test
    public void testBadFormat () {
        BagObject bagObject = new BagObject ()
                .put ("x", "y");
        String output = FormatWriter.write (bagObject, "Xxx_format");
        BagArray bagArray = new BagArray ()
                .add (bagObject);
        output = FormatWriter.write (bagArray, "Xyz_format");
    }

    @Test
    public void test () {
        BagObject bagObject = new BagObject ()
                .put ("x", "y")
                .put ("abc", 123)
                .put ("def", new BagObject ()
                        .put ("xyz", "pdq")
                )
                .put ("mno", new BagArray ()
                        .add (null)
                        .add (1)
                        .add (new BagObject ()
                                .put ("r", "s")
                        )
                );
        String output = FormatWriter.write (bagObject, MimeType.JSON);
        BagTest.report (output.length () > 0, true, "write...");

        BagObject recon = BagObjectFrom.string (output);
        BagTest.report (FormatWriter.write (recon, MimeType.JSON), output, "Json output is round-trippable");
        BagTest.report (recon.getString ("def/xyz"), "pdq", "Json output is valid");
    }
}
