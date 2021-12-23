package com.brettonw.bedrock.bag.formats;

import com.brettonw.bedrock.logger.LogManager;
import com.brettonw.bedrock.logger.Logger;

import java.util.Arrays;

public class FormatReaderParsed extends FormatReader {
    private static final Logger log = LogManager.getLogger (FormatReader.class);

    protected int index;
    protected int inputLength;
    protected int lineNumber;
    protected int lastLineIndex;
    protected boolean error;

    protected FormatReaderParsed () {}

    public FormatReaderParsed (String input) {
        super (input);
        inputLength = (input != null) ? input.length () : 0;
        index = 0;
        lineNumber = 1;
        lastLineIndex = 0;
    }

    /**
     *
     * @return
     */
    protected boolean check () {
        return (! error) && (index < inputLength);
    }

    protected void consumeWhiteSpace () {
        // consume white space (space, carriage return, tab, etc.
        while (check ()) {
            switch (input.charAt (index)) {
                // tab, space, nbsp
                case '\t': case ' ': case '\u00a0':
                    ++index;
                    break;
                // carriage return - the file reader converts all returns to \n
                case '\n':
                    ++index;
                    ++lineNumber;
                    lastLineIndex = index;
                    break;
                default:
                    return;
            }
        }
    }

    /**
     *
     * @param c
     * @return
     */
    protected boolean expect(char c) {
        consumeWhiteSpace ();

        // the next character should be the one we expect
        if (check() && (input.charAt (index) == c)) {
            ++index;
            return true;
        }
        return false;
    }

    /**
     *
     * @param c
     * @return
     */
    protected boolean require(char c) {
        return require (expect (c), "'" + c + "'");
    }

    /**
     *
     * @param condition
     * @param explanation
     * @return
     */
    protected boolean require (boolean condition, String explanation) {
        if (! condition) {
            onReadError (explanation + " REQUIRED");
        }
        return condition;
    }

    /**
     *
     * @param errorMessage
     */
    protected void onReadError (String errorMessage) {

        // log the messages, we only need to output the line if this is the first time the error is
        // being reported
        if (! error) {
            // say where the error is
            log.error ("Error while parsing input on line " + lineNumber + ", near: ");
            // find the end of the current line. note: line endings could only be '\n' because the
            // input reader consumed the actual line endings for us and replaced them with '\n'
            int lineEnd = index;
            while ((lineEnd < inputLength) && (input.charAt (lineEnd) != '\n')) {
                ++lineEnd;
            }
            log.error (input.substring (lastLineIndex, lineEnd));

            // build the error message, by computing a carat line, and adding the error message to it
            int errorIndex = index - lastLineIndex;
            char[] caratChars = new char[errorIndex + 2];
            Arrays.fill (caratChars, ' ');
            caratChars[errorIndex] = '^';
            String carat = new String (caratChars) + errorMessage;

            log.error (carat);

            // set the error state
            error = true;
        }
    }
}
