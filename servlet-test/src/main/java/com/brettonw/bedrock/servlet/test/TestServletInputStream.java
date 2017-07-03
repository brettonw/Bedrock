package com.brettonw.servlet.test;

import javax.servlet.ReadListener;
import javax.servlet.ServletInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;

public class TestServletInputStream extends ServletInputStream {
    private InputStream inputStream;

    public TestServletInputStream (String inputString, String encoding) {
        try {
            inputStream = new ByteArrayInputStream (inputString.getBytes(encoding));
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace ();
        }
    }

    @Override
    public boolean isFinished () {
        return false;
    }

    @Override
    public boolean isReady () {
        return true;
    }

    @Override
    public void setReadListener (ReadListener readListener) {

    }

    @Override
    public int read () throws IOException {
        return inputStream.read ();
    }

    @Override
    public int read (byte[] b) throws IOException {
        return inputStream.read (b);
    }

    @Override
    public int read (byte[] b, int off, int len) throws IOException {
        return inputStream.read (b, off, len);
    }

    @Override
    public long skip (long n) throws IOException {
        return inputStream.skip (n);
    }

    @Override
    public int available () throws IOException {
        return inputStream.available ();
    }

    @Override
    public void close () throws IOException {
        inputStream.close ();
    }

    @Override
    public synchronized void mark (int readlimit) {
        inputStream.mark (readlimit);
    }

    @Override
    public synchronized void reset () throws IOException {
        inputStream.reset ();
    }

    @Override
    public boolean markSupported () {
        return inputStream.markSupported ();
    }
}
