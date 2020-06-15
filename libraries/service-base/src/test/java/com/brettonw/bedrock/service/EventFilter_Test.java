package com.brettonw.bedrock.service;

import com.brettonw.bedrock.bag.BagArray;
import com.brettonw.bedrock.bag.BagObject;
import com.brettonw.bedrock.bag.formats.MimeType;
import com.brettonw.bedrock.servlet.test.TestRequest;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

public class EventFilter_Test extends EventFilter {
    @Test
    public void testAllow () {
        BagObject filterConfiguration = BagObject.open(FILTER_TYPE, ALLOW);
        Event event = new Event (BagObject.open (Base.EVENT, Base.OK), null);
        assertEquals (filterEvent(event, filterConfiguration), EventFilterResult.ALLOW);
    }

    @Test
    public void testEventApplies () {
        Event event = new Event (BagObject.open (Base.EVENT, Base.OK), null);
        assertTrue (checkEventList(event, BagObject.open(EVENT_LIST, BagArray.open (Base.OK))));
        assertFalse (checkEventList(event, BagObject.open(EVENT_LIST, BagArray.open ("junk"))));
        assertFalse (checkEventList(event, BagObject.open(EVENT_LIST, BagArray.open ("junk").add ("junk2"))));
        assertTrue (checkEventList(event, BagObject.open(EVENT_LIST, BagArray.open ("junk").add ("junk2").add (Base.OK))));
        assertTrue (checkEventList(event, new BagObject ()));
        assertTrue (checkEventList(event, BagObject.open(EVENT_LIST, BagArray.open ("junk").add ("junk2").add (EventFilter.WILDCARD))));
    }

    @Test
    public void testFilterEvent () {
        BagObject query = BagObject.open (Base.EVENT, Base.OK);
        Event event = new Event (query, new TestRequest (query.toString(MimeType.JSON)));
        BagObject filterConfiguration = BagObject
                .open (FILTER_TYPE, ANY_LIST)
                .put (ANY_LIST,
                        BagArray
                                .open (
                                        BagObject
                                                .open (FILTER_TYPE, IP_ADDRESS_LIST)
                                                .put (IP_ADDRESS_LIST,
                                                        BagArray
                                                                .open (BagObject.open (DENY, "200.200.200.*"))
                                                                .add (BagObject.open (ALLOW, "127.0.0.1"))
                                                                .add (BagObject.open (ALLOW, "192.*"))
                                                )
                                )
                                .add (BagObject.open (EVENT_LIST, BagArray.open (Base.LOCK)).put (FILTER_TYPE, SECRET_LIST))
                                .add (BagObject.open (FILTER_TYPE, ALLOW))
                );
        assertEquals (filterEvent(event, filterConfiguration), EventFilterResult.ALLOW);
    }
}
