package com.brettonw.bedrock.bag;

import com.brettonw.bedrock.bag.formats.FormatReader;
import com.brettonw.bedrock.bag.formats.MimeType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.function.Supplier;

public class BagObjectFrom {
    private static final Logger log = LogManager.getLogger (BagObjectFrom.class);

    // from a string, with the mime type specified
    static public BagObject string (String string) {
        return string (string, MimeType.DEFAULT);
    }

    static public BagObject string (String string, Supplier<BagObject> fail) {
        return string (string, MimeType.DEFAULT, fail);
    }

    static public BagObject string (String string, String mimeType) {
        return string (string, mimeType, () -> null);
    }

    static public BagObject string (String string, String mimeType, Supplier<BagObject> fail) {
        try {
            SourceAdapter sourceAdapter = new SourceAdapterReader(string, mimeType);
            return FormatReader.readBagObject (sourceAdapter);
        } catch (Exception exception) {
            log.error (exception);
        }
        return fail.get ();
    }

    // from a file, with the mime type specified
    static public BagObject file (File file) {
        return file (file, () -> null);
    }

    static public BagObject file (File file, Supplier<BagObject> fail) {
        return file (file, MimeType.DEFAULT, fail);
    }

    static public BagObject file (File file, String mimeType) {
        return file (file, mimeType, () -> null);
    }

    static public BagObject file (File file, String mimeType, Supplier<BagObject> fail) {
        try {
            SourceAdapter sourceAdapter = new SourceAdapterReader(file, mimeType);
            return FormatReader.readBagObject (sourceAdapter);
        } catch (Exception exception) {
            log.error (exception);
        }
        return fail.get ();
    }

    // from a resource, with the mime type specified
    static public BagObject resource (Class context, String name) {
        return resource (context, name, () -> null);
    }

    static public BagObject resource (Class context, String name, Supplier<BagObject> fail) {
        return resource (context, name, MimeType.DEFAULT, fail);
    }

    static public BagObject resource (Class context, String name, String mimeType) {
        return resource (context, name, mimeType, () -> null);
    }

    static public BagObject resource (Class context, String name, String mimeType, Supplier<BagObject> fail) {
        try {
            SourceAdapter sourceAdapter = new SourceAdapterReader (context, name, mimeType);
            return FormatReader.readBagObject (sourceAdapter);
        } catch (Exception exception) {
            log.error (exception);
        }
        return fail.get ();
    }

    // from a stream, with the mime type specified
    static public BagObject inputStream (InputStream inputStream) {
        return inputStream (inputStream, MimeType.DEFAULT);
    }

    static public BagObject inputStream (InputStream inputStream, Supplier<BagObject> fail) {
        return inputStream (inputStream, MimeType.DEFAULT, fail);
    }

    static public BagObject inputStream (InputStream inputStream, String mimeType) {
        return inputStream (inputStream, mimeType, () -> null);
    }

    static public BagObject inputStream (InputStream inputStream, String mimeType, Supplier<BagObject> fail) {
        try {
            SourceAdapter sourceAdapter = new SourceAdapterReader(inputStream, mimeType);
            return FormatReader.readBagObject (sourceAdapter);
        } catch (Exception exception) {
            log.error (exception);
        }
        return fail.get ();
    }

    // from a HTTP connection (get)
    static public BagObject url (String urlString) {
        return url (urlString, () -> null);
    }

    static public BagObject url (String urlString, Supplier<BagObject> fail) {
        try {
            URL url = new URL (urlString);
            return url (url, fail);
        } catch (MalformedURLException exception) {
            log.error (exception);
        }
        return fail.get ();
    }

    static public BagObject url (URL url) {
        return url (url, () -> null);
    }

    static public BagObject url (URL url, Supplier<BagObject> fail) {
        try {
            SourceAdapter sourceAdapter = new SourceAdapterHttp(url);
            return FormatReader.readBagObject (sourceAdapter);
        } catch (Exception exception) {
            log.error (exception);
        }
        return fail.get ();
    }

    // from a HTTP connection (post)
    static public BagObject url (String urlString, Bag postData, String postDataMimeType) {
        return url (urlString, postData, postDataMimeType, () -> null);
    }

    static public BagObject url (String urlString, Bag postData, String postDataMimeType, Supplier<BagObject> fail) {
        try {
            URL url = new URL (urlString);
            return url (url, postData, postDataMimeType, fail);
        } catch (MalformedURLException exception) {
            log.error (exception);
        }
        return fail.get ();
    }

    static public BagObject url (URL url, Bag postData, String postDataMimeType) {
        return url (url, postData, postDataMimeType, () -> null);
    }

    static public BagObject url (URL url, Bag postData, String postDataMimeType, Supplier<BagObject> fail) {
        try {
            SourceAdapter sourceAdapter = new SourceAdapterHttp(url, postData, postDataMimeType);
            return FormatReader.readBagObject (sourceAdapter);
        } catch (Exception exception) {
            log.error (exception);
        }
        return fail.get ();
    }

    static public BagObject sourceAdapter (SourceAdapter sourceAdapter) {
        return sourceAdapter (sourceAdapter, () -> null);
    }

    static public BagObject sourceAdapter (SourceAdapter sourceAdapter, Supplier<BagObject> fail) {
        try {
            return FormatReader.readBagObject (sourceAdapter);
        } catch (Exception exception) {
            log.error (exception);
        }
        return fail.get ();
    }
}
