package com.brettonw.bedrock.bag.formats;

import com.brettonw.bedrock.bag.BagArray;
import com.brettonw.bedrock.bag.BagObject;
import com.brettonw.bedrock.logger.LogManager;
import com.brettonw.bedrock.logger.Logger;

/**
 * The FormatWriterText is a configurable text format writer for any format that uses a divider
 * between entries, and a divider between pairs.
 */
public class FormatWriterText extends FormatWriter {
    private static final Logger log = LogManager.getLogger (FormatWriterText.class);

    String entrySeparator;
    String pairSeparator;

    public FormatWriterText () { super (); }

    public FormatWriterText (String entrySeparator, String pairSeparator) {
        super ();
        this.entrySeparator = entrySeparator;
        this.pairSeparator = pairSeparator;
    }

    @Override
    public String write (BagArray bagArray) {
        StringBuilder stringBuilder = new StringBuilder ();
        for (int i = 0, end = bagArray.getCount (); i < end; ++i) {
            stringBuilder.append (bagArray.getString (i)).append (entrySeparator);
        }
        return stringBuilder.toString ();
    }

    @Override
    public String write (BagObject bagObject) {
        StringBuilder stringBuilder = new StringBuilder ();
        String[] keys = bagObject.keys ();
        for (String key : keys) {
            String value;
            // the reader has a flag to accumulate values or overwrite them. accumulated values will be gathered into
            // an array - as the writer, we will assume the presence of the array means multiple lines
            BagArray bagArray = bagObject.getBagArray (key);
            if (bagArray != null) {
                for (int i = 0, end = bagArray.getCount (); i < end; ++i) {
                    value = bagArray.getString (i);
                    stringBuilder.append (key).append (pairSeparator).append (value).append (entrySeparator);
                }
            } else if ((value = bagObject.getString (key)) != null) {
                stringBuilder.append (key).append (pairSeparator).append (value).append (entrySeparator);
            }
        }
        return stringBuilder.toString ();
    }

    static {
        registerFormatWriter (MimeType.PROP, false, () -> new FormatWriterText ("\n", "="));
        registerFormatWriter (MimeType.URL, false, () -> new FormatWriterText ("&", "="));
    }
}
