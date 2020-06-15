package com.brettonw.bedrock;

import com.brettonw.bedrock.bag.*;
import com.brettonw.bedrock.bag.formats.MimeType;
import com.brettonw.bedrock.service.Base;
import com.brettonw.bedrock.service.Event;
import com.brettonw.bedrock.service.EventFilter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Enumeration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Service extends Base {
    private static final Logger log = LogManager.getLogger (Service.class);

    public static final String FETCH_URL = "url";
    public static final String FETCH_CONTENT = "content";
    public static final String FETCH_MIME_TYPE = "mime-type";
    public static final String FETCH_ESCAPE_TYPE = "escape-type";
    public static final String IP_ADDRESS = "ip-address";

    public Service () { }

    public void handleEventEcho (Event event) {
        event.respond (event.getQuery ());
    }

    public void handleEventEchoArray (Event event) {
        event.respond (new BagArray ().add (event.getQuery ()));
    }

    public void handleEventEchoPost (Event event) {
        BagObject query = event.getQuery ();
        // get the post data
        Bag postData = query.getBagArray (POST_DATA);
        if (postData == null) {
            postData = query.getBagObject (POST_DATA);
        }

        // if we got valid post data...
        if (postData != null) {
            event.respond (postData);
        } else {
            event.error ("Invalid post data");
        }
    }

    public void handleEventIpAddress (Event event) {
        event.ok (BagObject.open (IP_ADDRESS, event.getIpAddress ()));
    }

    public void handleEventHeaders (Event event) {
        HttpServletRequest request = event.getRequest ();
        BagObject responseBagObject = new BagObject ();
        Enumeration headerNames = request.getHeaderNames ();
        while (headerNames.hasMoreElements ()) {
            String headerName = (String) headerNames.nextElement ();
            String headerValue = request.getHeader (headerName);
            responseBagObject.put (headerName, headerValue);
        }
        event.ok (responseBagObject);
    }

    private String unescapeUrl (String urlString) {
        Pattern pattern = Pattern.compile ("[^\\\\]%[0-9a-fA-F]{2}");
        Matcher matcher = pattern.matcher (urlString);
        StringBuffer sb = new StringBuffer (urlString.length ());
        while (matcher.find ()) {
            String group = matcher.group ();
            String hexVal = matcher.group ().substring (2);
            int intVal = Integer.parseInt (hexVal, 16);
            String s = group.substring (0, 1) + (char) intVal;
            matcher.appendReplacement (sb, s);
        }
        matcher.appendTail (sb);
        return sb.toString ();
    }

    public void handleEventFetch (Event event) {
        try {
            // decode the URL
            String urlString = unescapeUrl (event.getQuery ().getString (FETCH_URL));

            // fetch the requested site and get its mime type (and subtypes)
            SourceAdapterHttp sourceAdapterHttp = new SourceAdapterHttp (urlString);
            String mimeType = sourceAdapterHttp.getMimeType ();
            String[] mimeSubTypes = mimeType.split ("/");

            // decide how to encode the response, text and text-based protocols that are not JSON
            // need to be escaped so the result can be rebuilt on the receiver side.
            if (mimeSubTypes[0].equals ("text") || mimeType.equals (MimeType.TEXT) || mimeType.equals (MimeType.XML)) {
                String response = sourceAdapterHttp.getStringData ()
                    .replace ("\\", "\\\\")
                    .replace ("\n", "\\n")
                    .replace ("\r", "\\r")
                    .replace ("\f", "\\f")
                    .replace ("\t", "\\t")
                    .replace ("\b", "\\b")
                    .replace ("\"", "\\\"");
                event.ok (new BagObject ().put (FETCH_CONTENT, response).put (FETCH_MIME_TYPE, mimeType).put (FETCH_ESCAPE_TYPE, "text"));
            } else if (mimeType.equals (MimeType.JSON)) {
                // straight JSON content can be embedded
                event.ok (new BagObject ().put (FETCH_CONTENT, BagObjectFrom.string (sourceAdapterHttp.getStringData ())).put (FETCH_MIME_TYPE, mimeType).put (FETCH_ESCAPE_TYPE, "none"));
            } else {
                // XXX right now, we don't do anything with other types, but we might base64 encode
                // XXX them in the future
                event.error ("Unsupported response content type");
            }
        } catch (IOException exception) {
            event.error ("Fetch FAILURE (" + exception.toString () + ")");
        }
    }
}
