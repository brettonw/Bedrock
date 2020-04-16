/**
 * Provides FormatReader and FormatWriter classes in support of the bedrock package. JSON and
 * some basic formats might be facilitated by a registered file mime-type association, but
 * you can add your own association to a reader (and its configuration) by using something
 * like this:
 * {@code
 *    FormatReader.registerFormatReader ("MyCustomTypeName", false, (input) -> new FormatReaderFixed (input, new int[]{3, 3, 3, 4}));
 *    BagArray bagArray = BagArrayFrom.string (stringInput, "MyCustomTypeName");
 * }
 * @author Bretton Wade
 */
package com.brettonw.bedrock.bag.formats;
