package com.brettonw.bedrock.logger;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;

public class TestPrintStream extends PrintStream {
    public TestPrintStream () {
        super (new ByteArrayOutputStream());
    }

    public String toString () {
        try {
            out.flush();
            String result = out.toString();
            ((ByteArrayOutputStream) out).reset ();
            return result;
        }
        catch (IOException exc) {
            return exc.getMessage();
        }
    }
}
