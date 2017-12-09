package com.brettonw.bedrock.bag.formats;

import com.brettonw.bedrock.bag.BagArray;
import com.brettonw.bedrock.bag.BagObject;
import com.brettonw.bedrock.bag.SourceAdapter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

public class FormatReader {
    private static final Logger log = LogManager.getLogger (FormatReader.class);

    protected final String input;

    protected FormatReader () {
        this (null);
    }

    /**
     *
     * @param input
     */
    public FormatReader (String input) {
        this.input = input;
    }

    // static type registration by name
    private static final Map<String, Function<String, FormatReader>> formatReaders = new HashMap<> ();

    /**
     *
     * @param mimeType
     * @param replace
     * @param factory
     */
    public static void registerFormatReader (String mimeType, boolean replace, Function<String, FormatReader> factory) {
        // try to find the mime type first, and if it's not there, add it
        String foundMimeType = MimeType.getFromMimeType (mimeType, () -> MimeType.addMimeTypeMapping (mimeType));
        if ((! replace) || (! formatReaders.containsKey(foundMimeType))) {
            formatReaders.put(foundMimeType, factory);
        }
    }

    private static FormatReader getFormatReader (String stringData, String mimeType, Class iType) {
        // deduce the format, and create the format reader
        String foundMimeType = MimeType.getFromMimeType (mimeType);
        if (foundMimeType != null) {
            FormatReader formatReader = formatReaders.get(foundMimeType).apply (stringData);
            if (formatReader != null) {
                if (iType.isInstance (formatReader)) {
                    return formatReader;
                } else {
                    log.error ("Reader for format (" + mimeType + ") doesn't implement " + iType.getName ());
                }
            } else {
                log.error ("No reader for format (" + mimeType + ")");
            }
        } else {
            log.error ("Unknown format (" + mimeType + ")");
        }
        return null;
    }

    /**
     *
     * @param sourceAdapter
     * @return
     */
    public static BagArray readBagArray (SourceAdapter sourceAdapter) {
        FormatReader formatReader = getFormatReader(sourceAdapter.getStringData(), sourceAdapter.getMimeType(), ArrayFormatReader.class);
        return (formatReader != null) ? ((ArrayFormatReader)formatReader).readBagArray () : null;
    }

    /**
     *
     * @param sourceAdapter
     * @return
     */
    public static BagObject readBagObject (SourceAdapter sourceAdapter) {
        FormatReader formatReader = getFormatReader(sourceAdapter.getStringData(), sourceAdapter.getMimeType(), ObjectFormatReader.class);
        return (formatReader != null) ? ((ObjectFormatReader)formatReader).readBagObject () : null;
    }

    /**
     * static method to forcibly invoke the static initializer
     */
    public static void register () {
    }

    static {
        // rather than have a compile-time and run-time dependency, we just list the sub-
        // classes of FormatReader here that need to be loaded.
        Class[] formatReaders = {
                FormatReaderComposite.class,
                FormatReaderJson.class,
                FormatReaderTable.class
        };
        for (Class type : formatReaders) {
            try {
                //type.newInstance ();
                type.getConstructor ().newInstance ();
            } catch (IllegalAccessException exception) {
                // do nothing
            } catch (InstantiationException | InvocationTargetException | NoSuchMethodException exception) {
                log.error (exception);
            }
        }
    }
}
