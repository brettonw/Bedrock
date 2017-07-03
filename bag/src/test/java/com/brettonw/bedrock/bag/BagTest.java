package com.brettonw.bedrock.bag;

import com.brettonw.bedrock.bag.entry.HandlerTest;
import com.brettonw.bedrock.bag.formats.*;
import junit.framework.TestCase;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({
        SortKeyTest.class,
        SelectKeyTest.class,
        BagArrayTest.class,
        BagObjectTest.class,
        KeyTest.class,
        FromUrlTest.class,
        SerializerTest.class,

        HandlerTest.class,
        FormatReaderTest.class,
        FormatReaderCompositeTest.class,
        FormatReaderJsonTest.class,
        FormatReaderTableTest.class,

        FormatWriterTest.class,
        FormatWriterTextTest.class,
        FormatWriterJsonTest.class,

        SourceAdapterTest.class,
        SourceAdapterHttpTest.class,
        SourceAdapterReaderTest.class,
        MimeTypeTest.class
})

public class BagTest {
    private static final Logger log = LogManager.getLogger (BagTest.class);

    public static void report (Object actual, Object expect, String message) {
        boolean result = (actual != null) ? actual.equals (expect) : (expect == null);
        log.info (message + " (" + (result ? "PASS" : "FAIL") + ")");
        TestCase.assertEquals (message, expect, actual);
    }
}
