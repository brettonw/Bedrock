package com.brettonw.bedrock.bag;

import com.brettonw.bedrock.bag.formats.MimeType;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
import java.util.function.Supplier;

/**
 * Source Adapter allows the Bag* constructors to be used with a variety of text-based
 * inputs without clogging the Bag* class files. The adapter handles interfacing various
 * external sources to one central string handler, routed into a format reader. The string
 * and it's MIME-type are captured together.
 */
public class SourceAdapter {
    protected String mimeType;
    protected String stringData;

    public SourceAdapter () {}

    public SourceAdapter (String stringData, String mimeType) {
        this.stringData = stringData;
        this.mimeType = mimeType;
    }

    public SourceAdapter setMimeType (String mimeType) {
        this.mimeType = mimeType;
        return this;
    }

    public SourceAdapter setStringData (String stringData) {
        this.stringData = stringData;
        return this;
    }

    public String getMimeType () {
        return mimeType;
    }

    public String getMimeType (Supplier<String> noMimeType) {
        return (mimeType != null) ? mimeType : noMimeType.get ();
    }

    public String getStringData () {
        return stringData;
    }

    public String getStringData (Supplier<String> noStringData) {
        return (stringData != null) ? stringData : noStringData.get ();
    }

    static String deduceMimeType (String hint, String name) {
        // extract the name extension, this is the most definitive source
        if (name != null) {
            int i = name.lastIndexOf('.');
            String extension = (i > 0) ? name.substring (i + 1).toLowerCase () : null;
            if (extension != null) {
                String mimeType = MimeType.getFromExtension (extension);
                if (mimeType != null) {
                    return mimeType;
                }
            }
        }

        // fall back to the hint
        return hint;
    }

    static String readString (Reader reader) throws IOException {
        BufferedReader bufferedReader = new BufferedReader (reader);
        StringBuilder stringBuilder = new StringBuilder ();
        String line;
        while ((line = bufferedReader.readLine ()) != null) {
            stringBuilder.append (line).append ('\n');
        }
        bufferedReader.close ();
        return stringBuilder.toString ();
    }
}
