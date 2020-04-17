package com.brettonw.bedrock.bag;

import com.brettonw.bedrock.bag.formats.MimeType;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class SourceAdapterReader extends SourceAdapter {
    public SourceAdapterReader (Reader reader, String mimeType) throws IOException {
        this.mimeType = mimeType;
        stringData = readString (reader);
    }

    /**
     * Read directly from a string
     * @param string
     * @param mimeType
     * @throws IOException
     */
    public SourceAdapterReader (String string, String mimeType) throws IOException {
        this (new StringReader (string), mimeType);
    }

    /**
     * Read string data from any input stream
     * @param inputStream
     * @param mimeType
     * @throws IOException
     */
    public SourceAdapterReader (InputStream inputStream, String mimeType) throws IOException {
        // always force UTF-8 for input streams
        this (new InputStreamReader (inputStream, StandardCharsets.UTF_8), mimeType);
    }

    /**
     * Read string data from a file
     * @param file
     * @throws IOException
     */
    public SourceAdapterReader (File file) throws IOException {
        this (file, MimeType.DEFAULT);
    }

    /**
     * Read string data from a file when the MIME-type is known
     * @param file
     * @param mimeType
     * @throws IOException
     */
    public SourceAdapterReader (File file, String mimeType) throws IOException {
        this (new FileInputStream (file), deduceMimeType(mimeType, file.getName()));
    }

    /**
     * Read string data from a resource
     * @param context
     * @param name
     * @throws IOException
     */
    public SourceAdapterReader (Class context, String name) throws IOException {
        this (context, name, MimeType.DEFAULT);
    }

    /**
     * Read string data from a resource when the MIME-type is known
     * @param context
     * @param name
     * @param mimeType
     * @throws IOException
     */
    public SourceAdapterReader (Class context, String name, String mimeType) throws IOException {
        this (context.getResourceAsStream (name), deduceMimeType (mimeType, name));
    }
}
