package com.brettonw.bedrock.bag;

import junit.framework.TestCase;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class BagTest {
    private static final Logger log = LogManager.getLogger (BagTest.class);

    public static void report (Object actual, Object expect, String message) {
        boolean result = (actual != null) ? actual.equals (expect) : (expect == null);
        log.info (message + " (" + (result ? "PASS" : "FAIL") + ")");
        TestCase.assertEquals (message, expect, actual);
    }
}
