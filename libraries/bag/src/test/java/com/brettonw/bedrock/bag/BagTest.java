package com.brettonw.bedrock.bag;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class BagTest {
    private static final Logger log = LogManager.getLogger (BagTest.class);

    public static void report (Object actual, Object expect, String message) {
        boolean result = (actual != null) ? actual.equals (expect) : (expect == null);
        log.info (message + " (" + (result ? "PASS" : "FAIL") + ")");
        assertEquals (expect, actual, message);
    }
}
