package com.brettonw.bedrock.bag.formats;

import com.brettonw.bedrock.bag.BagArray;
import com.brettonw.bedrock.bag.BagArrayFrom;
import com.brettonw.bedrock.bag.BagTest;
import com.brettonw.bedrock.bag.entry.*;
import org.junit.jupiter.api.Test;

import java.io.File;

public class FormatReaderTableTest {
    @Test
    public void testBasicFixedFormat () {
        String test = " a comment line\n\nA  B  C  D   \naaabbbcccdddd\nabcd\n11 22 33 4444\n";
        MimeType.addMimeTypeMapping (MimeType.FIXED);
        int[][] fields = HandlerArrayFromFixed.fieldsFromWidths (new int[]{3, 3, 3, 4});
        FormatReader.registerFormatReader (MimeType.FIXED, false, (input) ->
                new FormatReaderTable (test, new HandlerArrayFromDelimited ("\n",
                        new HandlerCompositeFiltered (str -> (str.length () > 0) && (! str.startsWith (" ")),
                            new HandlerArrayFromFixed (fields)))

                )
        );
        BagArray bagArray = BagArrayFrom.string (test, MimeType.FIXED);

        BagTest.report (bagArray.getCount (), 3, "3 valid rows were provided");
        BagTest.report (bagArray.getBagObject (0).getString ("A"), "aaa", "row 0, 1st element reads correctly");
        BagTest.report (bagArray.getBagObject (0).getString ("D"), "dddd", "row 0, 4th element reads correctly");
        BagTest.report (bagArray.getBagObject (2).getInteger ("A"), 11, "row 1, 1st element reads correctly");
        BagTest.report (bagArray.getBagObject (2).getInteger ("D"), 4444, "row 1, 4th element reads correctly");
    }

    @Test
    public void testBasicFixedFormatWithFieldNames () {
        String test = " a comment line\n\naaabbbcccdddd\nabcd\n11 22 33 4444\n";
        BagArray fieldNames = BagArray.open ("A").add ("B").add ("C").add ("D");
        int[][] fields = HandlerArrayFromFixed.fieldsFromWidths (new int[]{3, 3, 3, 4});
        FormatReaderTable frt = new FormatReaderTable (test, new HandlerArrayFromDelimited ("\n",
                new HandlerCompositeFiltered (str -> (str.length () > 0) && (! str.startsWith (" ")),
                        new HandlerArrayFromFixed (fields))
                ), fieldNames
        );
        BagArray bagArray = frt.readBagArray ();

        BagTest.report (bagArray.getCount (), 3, "3 valid rows were provided");
        BagTest.report (bagArray.getBagObject (0).getString ("A"), "aaa", "row 0, 1st element reads correctly");
        BagTest.report (bagArray.getBagObject (0).getString ("D"), "dddd", "row 0, 4th element reads correctly");
        BagTest.report (bagArray.getBagObject (2).getInteger ("A"), 11, "row 1, 1st element reads correctly");
        BagTest.report (bagArray.getBagObject (2).getInteger ("D"), 4444, "row 1, 4th element reads correctly");
    }

    private static boolean checksum (String str) {
        /*
        The last column on each line (fields 1.14 and 2.10) represents a modulo-10 checksum of the
        data on that line. To calculate the checksum, simply add the values of all the numbers on
        each line—ignoring all letters, spaces, periods, and plus signs—and assigning a value of 1
        to all minus signs. The checksum is the last digit of that sum.
         */
        if (str.length () > 0) {
            int length = str.length () - 1;
            int checksum = str.charAt (length) - '0';
            int sum = 0;
            for (int i = 0; i < length; ++i) {
                char c = str.charAt (i);
                if ((c >= '0') && (c <= '9')) {
                    sum += c - '0';
                } else if (c == '-') {
                    sum += 1;
                }
            }
            return (sum % 10) == checksum;
        }
        return false;
    }

    @Test
    public void test2le () {
        final String tleFormat = "test/2le";
        FormatReader.registerFormatReader (tleFormat, false, (input) ->
                new FormatReaderTable (input,
                        new HandlerCollector (2,
                                new HandlerArrayFromDelimited ("\n",
                                        new HandlerRoller (
                                                // exemplars, from https://www.celestrak.com/NORAD/documentation/tle-fmt.asp
                                                new HandlerCompositeFiltered (str -> checksum (str),
                                                        new HandlerArrayFromFixed (HandlerArrayFromFixed.fieldsFromExemplar ("1 NNNNNU yyNNNAAA yyNNNNNNNNNNNN NNNNNNNNNN NNNNNNNN NNNNNNNN N NNNNc", ' '))
                                                ),
                                                new HandlerCompositeFiltered (str -> checksum (str),
                                                        new HandlerArrayFromFixed (HandlerArrayFromFixed.fieldsFromExemplar ("2 NNNNN NNNNNNNN NNNNNNNN NNNNNNN NNNNNNNN NNNNNNNN NNNNNNNNNNNnnnnnc", ' '))
                                                )
                                        )
                                )
                        ), BagArrayFrom.array (
                                "1", "A", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N",
                                "2", "B", "O", "P", "Q", "R", "S", "T", "U", "V"
                        )
                )
        );
        BagArray bagArray = BagArrayFrom.file (new File ("data/2le.txt"), tleFormat);
        BagTest.report (bagArray != null, true, "expect successful read");
    }

    @Test
    public void test3le () {
        final String tleFormat = "test/3le";
        FormatReader.registerFormatReader (tleFormat, false, (input) ->
                new FormatReaderTable (input,
                        new HandlerCollector (3, new HandlerArrayFromDelimited ("\n", new HandlerRoller (
                                // exemplars, from https://www.celestrak.com/NORAD/documentation/tle-fmt.asp
                                new HandlerArrayFromFixed (HandlerArrayFromFixed.fieldsFromExemplar ("0 AAAAAAAAAAAAAAAAAAAAAAAA", ' ')),
                                new HandlerCompositeFiltered (str -> checksum (str),
                                        new HandlerArrayFromFixed (HandlerArrayFromFixed.fieldsFromExemplar ("1 NNNNNU yyNNNAAA yyNNNNNNNNNNNN NNNNNNNNNN NNNNNNNN NNNNNNNN N NNNNc", ' '))
                                ),
                                new HandlerCompositeFiltered (str -> checksum (str),
                                        new HandlerArrayFromFixed (HandlerArrayFromFixed.fieldsFromExemplar ("2 NNNNN NNNNNNNN NNNNNNNN NNNNNNN NNNNNNNN NNNNNNNN NNNNNNNNNNNnnnnnc", ' '))
                                )
                        ))),
                        BagArrayFrom.array ("0", "NAME",
                                "1", "A", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N",
                                "2", "B", "O", "P", "Q", "R", "S", "T", "U", "V")));
        BagArray bagArray = BagArrayFrom.file (new File ("data/3le.txt"), tleFormat);
        BagTest.report (bagArray != null, true, "expect successful read");
    }
}
