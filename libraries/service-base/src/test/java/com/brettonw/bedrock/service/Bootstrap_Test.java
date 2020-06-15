package com.brettonw.bedrock.service;

import com.brettonw.bedrock.bag.*;
import com.brettonw.bedrock.servlet.Tester;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class Bootstrap_Test extends Base {
    Tester tester;

    public Bootstrap_Test () {
        super("xxx.json");
        tester = new Tester (this);
    }

    public void handleEventHello (Event event) {
        event.ok (BagObject.open  ("testing", "123"));
    }

    public void handleEventGoodbye (Event event) {
        event.ok (BagObject.open ("testing", "456"));
    }

    public void handleEventDashName (Event event) {
        event.ok ();
    }

    private void assertGet (BagObject bagObject, BagObject query) {
        assertTrue (bagObject.getString (STATUS).equals (OK));
        bagObject = bagObject.getBagObject (QUERY).select (new SelectKey (SelectType.EXCLUDE, POST_DATA));
        assertTrue (bagObject.equals (query));
    }

    @Test
    public void testAttribute () {
        assertTrue (getContext () != null);
        assertTrue (getAttribute (SERVLET) == this);
    }

    @Test
    public void testBadInstall () {
        String event = "JUNK";
        assertFalse (install ("JUNK"));
    }

    @Test
    public void testUnknownEvent () throws IOException {
        BagObject query = BagObject.open (EVENT, "nohandler");
        assertTrue (tester.bagObjectFromGet (query).getString (STATUS).equals (ERROR));
    }

    @Test
    public void testMissingHandler () throws IOException {
        BagObject query = BagObject.open (EVENT, "no-handler");
        assertTrue (tester.bagObjectFromGet (query).getString (STATUS).equals (ERROR));
    }

    @Test
    public void testGet () throws IOException {
        BagObject query = BagObject
                .open (EVENT, "hello")
                .put ("param1", 1)
                .put ("param2", 2);
        assertGet (tester.bagObjectFromGet (query), query);

        query.put ("param3", 3);
        assertGet (tester.bagObjectFromGet (query), query);

        query.put ("param4", 4);
        assertTrue (tester.bagObjectFromGet (query).getString (STATUS).equals (OK));
    }

    @Test
    public void testGetOk () throws IOException {
        BagObject query = BagObject.open (EVENT, OK);
        assertGet (tester.bagObjectFromGet (query), query);

        query.put ("param4", 4);
        assertGet (tester.bagObjectFromGet (query), query);
    }

    @Test
    public void testPost () throws IOException {
        BagObject query = BagObject
                .open (EVENT, "goodbye")
                .put ("param1", 1)
                .put ("param2", 2);
        BagObject postData = BagObjectFrom.resource (getClass (), "/testPost.json");
        BagObject response = tester.bagObjectFromPost (query, postData);
        assertGet (response, query);
        assertTrue (response.getBagObject (QUERY).has (POST_DATA));
        assertTrue (response.getBagObject (QUERY).getBagObject (POST_DATA).equals (postData));

        query.put ("param3", 3);
        response = tester.bagObjectFromPost (query, postData);
        assertGet (response, query);
        assertTrue (response.getBagObject (QUERY).has (POST_DATA));
        assertTrue (response.getBagObject (QUERY).getBagObject (POST_DATA).equals (postData));

        query.put ("param4", 4);
        assertTrue (tester.bagObjectFromPost (query, postData).getString (STATUS).equals (OK));
        query.remove ("param4");

        query.put ("param3", 2);
        assertTrue (tester.bagObjectFromPost (query, postData).getString (STATUS).equals (OK));
    }

    @Test
    public void testEmptyRequest () throws IOException {
        BagObject response = tester.bagObjectFromGet ("");
        assertTrue (response.getString (STATUS).equals (ERROR));
        assertTrue (response.getString (Key.cat (ERROR, 0)).equals ("Missing '" + EVENT + "'"));
    }

    @Test
    public void testHelp () throws IOException {
        BagObject query = BagObject.open (EVENT, HELP);
        BagObject response = tester.bagObjectFromGet (query);
        assertTrue (response.getString (STATUS).equals (OK));

        // make sure the response matches the schema
        assertTrue (response.getBagObject (RESPONSE).equals (getSchema ()));
    }

    @Test
    public void testBadGet () throws IOException {
        BagObject query = BagObject
                .open (EVENT, "halp")
                .put ("param1", 1)
                .put ("param2", 2);
        assertTrue (tester.bagObjectFromGet (query).getString (STATUS).equals (ERROR));
    }

    @Test
    public void testBadParameters () throws IOException {
        BagObject query = BagObject
                .open (EVENT, "hello")
                .put ("param1", 1)
                .put ("param3", 3);
        assertTrue (tester.bagObjectFromGet (query).getString (STATUS).equals (OK));
    }

    @Test
    public void testVersion () throws IOException {
        BagObject query = BagObject.open (EVENT, VERSION);
        BagObject response = tester.bagObjectFromGet (query);
        assertTrue (response.getString (STATUS).equals (OK));
    }

    @Test
    public void testMultiple () throws IOException {
        BagObject query = BagObject.open (EVENT, MULTIPLE);
        BagArray postData = BagArray.open (BagObject.open (EVENT, VERSION)).add (BagObject.open (EVENT, "help"));
        assertTrue (tester.bagObjectFromPost (query, query).getString (STATUS).equals (ERROR));
        assertTrue (tester.bagObjectFromPost (query, postData).getString (STATUS).equals (OK));
    }

    @Test
    public void testDashName () throws IOException {
        BagObject query = BagObject.open (EVENT, "dash-name");
        assertGet (tester.bagObjectFromGet (query), query);
    }
}
