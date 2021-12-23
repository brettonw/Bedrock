package com.brettonw.bedrock.logger;

import org.junit.jupiter.api.Test;

import java.text.SimpleDateFormat;

import static org.junit.jupiter.api.Assertions.*;

public class LoggerTest {
    private static final Logger log = LogManager.getLogger (LoggerTest.class, Level.INFO, "", new TestPrintStream());

    @Test
    public void testLevel () {
        TestPrintStream tps = new TestPrintStream();
        assertEquals (tps.toString(), "");
        Logger log = new Logger("LoggerTest", Level.INFO, "", tps);
        SimpleDateFormat sdf = Logger.sdf;

        log.info ("Hello World");
        assertEquals(String.format("%s [INFO] (LoggerTest:testLevel) Hello World\n", sdf.format(log.getDate())), tps.toString());
        log.info ("Hello Again");
        assertEquals(String.format("%s [INFO] (LoggerTest:testLevel) Hello Again\n", sdf.format(log.getDate())), tps.toString());
        log.warn ("Hello Warn");
        assertEquals(String.format("%s [WARN] (LoggerTest:testLevel) Hello Warn\n", sdf.format(log.getDate())), tps.toString());
        log.debug ("Hello Debug");
        assertEquals("", tps.toString());

        log.setLevel(Level.WARN);
        log.info ("Hello Info");
        assertEquals("", tps.toString());
        log.warn ("Hello Warn");
        assertEquals(String.format("%s [WARN] (LoggerTest:testLevel) Hello Warn\n", sdf.format(log.getDate())), tps.toString());
        log.error ("Hello Exc", new Exception("Test Exception"));
        assertEquals(String.format("%s [ERROR] (LoggerTest:testLevel) Hello Exc\n", sdf.format(log.getDate())), tps.toString());
    }
}
