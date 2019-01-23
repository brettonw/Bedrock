package com.brettonw.bedrock.bag.formats;

import com.brettonw.bedrock.bag.BagArray;
import com.brettonw.bedrock.bag.BagObject;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

abstract public class FormatWriter {
    private static final Logger log = LogManager.getLogger (FormatReader.class);

    protected static final String[] QUOTES = { "\"" };

    protected String enclose (String input, String[] bracket) {
        String bracket0 = bracket[0];
        String bracket1 = (bracket.length > 1) ? bracket[1] : bracket0;
        return bracket0 + input + bracket1;
    }

    protected String quote (String input) {
        return enclose (input, QUOTES);
    }

    abstract public String write (BagObject bagObject);
    abstract public String write (BagArray bagArray);

    // static type registration by name
    private static final Map<String, FormatWriter> formatWriters = new HashMap<>();

    public static void registerFormatWriter (String format, boolean replace, Supplier<FormatWriter> supplier) {
        if ((! replace) || (! formatWriters.containsKey(format))) {
            formatWriters.put(format, supplier.get());
        }
    }

    public static String write (BagObject bagObject, String format) {
        if (formatWriters.containsKey(format)) {
            return formatWriters.get(format).write (bagObject);
        }
        return null;
    }

    public static String write (BagArray bagArray, String format) {
        if (formatWriters.containsKey(format)) {
            return formatWriters.get(format).write (bagArray);
        }
        return null;
    }

    static {
        // rather than have a compile-time and run-time dependency, we just list the sub-
        // classes of FormatWriter here that need to be loaded.
        Class[] formatWriters = {
                FormatWriterJson.class,
                FormatWriterText.class
        };
        for (Class type : formatWriters) {
            try {
                type.newInstance ();
            } catch (IllegalAccessException exception) {
                // do nothing
            } catch (InstantiationException exception) {
                log.error (exception);
            }
        }
    }
}
