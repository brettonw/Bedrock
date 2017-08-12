package com.brettonw.bedrock;

import com.brettonw.bedrock.bag.Bag;
import com.brettonw.bedrock.bag.BagObject;
import com.brettonw.bedrock.service.Base;
import com.brettonw.bedrock.service.Event;

import javax.servlet.http.HttpServletRequest;
import java.util.Enumeration;

import static com.brettonw.bedrock.service.Keys.POST_DATA;

public class Service extends Base {
    public static final String IP = "ip";

    public Service () {
    }

    public void handleEventEcho (Event event) {
        event.respond (event.getQuery ());
    }

    public void handleEventIp (Event event) {
        HttpServletRequest request = event.getRequest ();
        String ip = request.getRemoteAddr ();
        if (ip.startsWith ("127") || ip.startsWith ("0")) {
            // try to get the x-forwarded header, the last one...
            String forwarding = request.getHeader ("x-forwarded-for");
            if (forwarding != null) {
                String[] forwards = forwarding.split (",");
                for (String forward : forwards) {
                    forward = forward.trim ();
                    ip = forward.split (":")[0];
                }
            }
        }
        event.ok (BagObject.open (IP, ip));
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

    public void handleEventPostData (Event event) {
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
}
