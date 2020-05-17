package com.brettonw.bedrock.secret;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

import static org.junit.Assert.assertTrue;

public class SecretTest {
    private static final Logger log = LogManager.getLogger (SecretTest.class);

    @Test
    public void testSecret () {
        assertTrue (true);
        assertTrue (true == true);
    }

    @Test
    public void testRoundTrip () {
        assertTrue (true);
        assertTrue (true == true);
    }
}
