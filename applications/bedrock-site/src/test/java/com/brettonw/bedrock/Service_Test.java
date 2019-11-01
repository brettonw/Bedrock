package com.brettonw.bedrock;

import com.brettonw.bedrock.bag.BagObject;
import com.brettonw.bedrock.bag.BagObjectFrom;
import com.brettonw.bedrock.servlet.Tester;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

import java.io.IOException;

import static org.junit.Assert.assertTrue;

public class Service_Test extends Service {
    private static final Logger log = LogManager.getLogger (Service_Test.class);

    public static final String ECHO = "echo";
    public static final String HEADERS = "headers";
    public static final String FETCH = "fetch";

    Tester tester;

    public Service_Test () {
        tester = new Tester (this);
    }

    @Test
    public void testGetIP () throws IOException {
        BagObject query = BagObject.open (EVENT, IP);
        BagObject response = tester.bagObjectFromGet (query);
        assertTrue (response.getString (STATUS).equals (OK));
        String ip = response.getBagObject (RESPONSE).getString (IP);
        assertTrue (ip != null);
        log.info (IP + ": " + ip);
    }

    @Test
    public void testGetOk () throws IOException {
        BagObject query = BagObject.open (EVENT, OK);
        BagObject response = tester.bagObjectFromGet (query);
        assertTrue (response.getString (STATUS).equals (OK));
    }

    @Test
    public void testGetEcho () throws IOException {
        BagObject query = BagObject.open (EVENT, ECHO);
        BagObject response = tester.bagObjectFromGet (query);
        assertTrue (response.equals (query));
    }

    @Test
    public void testGetPostData () throws IOException {
        BagObject query = BagObject.open (EVENT, POST_DATA);
        BagObject response = tester.bagObjectFromGet (query);
        assertTrue (response.getString (STATUS).equals (ERROR));
    }

    @Test
    public void testPostEcho () throws IOException {
        BagObject query = BagObject.open (EVENT, ECHO);
        BagObject postData = BagObjectFrom.resource (getClass (), "/testPost.json");
        BagObject response = tester.bagObjectFromPost (query, postData);
        query.put (POST_DATA, postData);
        assertTrue (response.equals (query));
    }

    @Test
    public void testPostPostData () throws IOException {
        BagObject query = BagObject.open (EVENT, POST_DATA);
        BagObject postData = BagObjectFrom.resource (getClass (), "/testPost.json");
        BagObject response = tester.bagObjectFromPost (query, postData);
        assertTrue (response.equals (postData));
    }

    @Test
    public void testGetHeaders () throws IOException {
        BagObject query = BagObject.open (EVENT, HEADERS);
        BagObject response = tester.bagObjectFromGet (query);
        assertTrue (response.getString (STATUS).equals (OK));
    }

    @Test
    public void testGetFetch () throws IOException {
        BagObject query = BagObject.open (EVENT, FETCH).put (FETCH_URL, "https://bedrock.brettonw.com/api?event%3dok");
        BagObject response = tester.bagObjectFromGet (query);
        assertTrue (response.getString (STATUS).equals (OK));
        query.put (FETCH_URL, "https://google.com");
        response = tester.bagObjectFromGet (query);
        assertTrue (response.getString (STATUS).equals (OK));
    }

    @Test
    public void testEmptyGet () throws IOException {
        BagObject response = tester.bagObjectFromGet ("");
        assertTrue (response.getString (STATUS).equals (ERROR));
    }
}
