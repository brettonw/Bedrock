package com.brettonw.bedrock.bag.formats;

import com.brettonw.bedrock.bag.BagObject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class FormatWriterTextTest {
    @Test
    public void testFormatWriterProp () {
        BagObject queryBagObject = BagObject.open  ("xxx", "yyy").put ("aaa", "bbb");
        String queryString = queryBagObject.toString (MimeType.PROP);
        assertTrue (queryString != null);
        assertTrue (queryString.equalsIgnoreCase ("aaa=bbb\nxxx=yyy\n"));
    }

    @Test
    public void testFormatWriterUrl () {
        BagObject queryBagObject = BagObject.open  ("xxx", "yyy").put ("aaa", "bbb");
        String queryString = queryBagObject.toString (MimeType.URL);
        assertTrue (queryString != null);
        assertTrue (queryString.equalsIgnoreCase ("aaa=bbb&xxx=yyy&"));
    }
    @Test

    public void testFormatWriterAccumulated () {
        BagObject queryBagObject = BagObject.open  ("xxx", "yyy").put ("aaa", "bbb").add ("bbb", "abc").add ("bbb", "def");
        String queryString = queryBagObject.toString (MimeType.URL);
        assertTrue (queryString != null);
        assertTrue (queryString.equalsIgnoreCase ("aaa=bbb&bbb=abc&bbb=def&xxx=yyy&"));
    }
}
