package com.brettonw.bedrock.service;

import com.brettonw.bedrock.bag.BagArray;
import com.brettonw.bedrock.bag.BagObject;

import java.util.regex.Pattern;

public class EventFilter implements EventFilterHandler {
    public static final String EVENT_LIST = "event-list";
    public static final String IP_ADDRESS_LIST = "ip-address-list";
    public static final String SECRET_LIST = "secret-list";
    public static final String ALLOW = "allow";
    public static final String DENY = "deny";

    public static boolean eventListApplies (Event event, BagObject filter) {
        BagArray eventList = filter.getBagArray (EVENT_LIST);
        if (eventList != null) {
            String eventName = event.getEventName ();
            for (int i = 0, end = eventList.getCount (); i < end; ++i) {
                if (eventList.getString (i).equals (eventName)) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }

    public static EventFilterResult ipAddressApplies (Event event, BagObject filter) {
        // see if the ip address is allowed or denied
        String eventIpAddress = Base.getIpAddress (event);
        BagArray ipAddressList = filter.getBagArray (IP_ADDRESS_LIST);
        if (ipAddressList != null) {
            for (int i = 0, end = ipAddressList.getCount (); i < end; ++i) {
                BagObject ipAddress = ipAddressList.getBagObject (i);
                if (ipAddress != null) {
                    // in practice, only allow or deny should be set, but both are possible - if we
                    // get an explicit match, it is definitive
                    String allow = ipAddress.getString (ALLOW);
                    if ((allow != null) && (Pattern.compile (allow).matcher (eventIpAddress).find ())) {
                        return EventFilterResult.ALLOW;
                    }
                    String deny = ipAddress.getString (DENY);
                    if ((deny != null) && (Pattern.compile (deny).matcher (eventIpAddress).find ())) {
                        return EventFilterResult.DENY;
                    }
                }
            }
        }
        return EventFilterResult.NOT_APPLICABLE;
    }

    public static EventFilterResult secretApplies (Event event, BagObject filter) {
        BagArray secretList = filter.getBagArray (SECRET_LIST);
        if (secretList != null) {
        }
    }

    public static EventFilterResult or (Event event, BagObject filter) {
        BagArray filtersArray = configuration.getBagArray (FILTER);
        if (filtersArray != null) {
            // since there are filters, every event must end up being explicitly allowed. we loop
            // over the filters in order of definition until one applies to the event, or we get to
            // the end of the list
            EventFilterResult eventFilterResult = EventFilterResult.NOT_APPLICABLE;
            for (int i = 0, end = filtersArray.getCount (); (i < end) && (eventFilterResult == EventFilterResult.NOT_APPLICABLE); ++i) {
                BagObject filter = filtersArray.getBagObject (i);
                eventFilterResult = filterEvent (event, filter);
            }
            return (eventFilterResult == EventFilterResult.ALLOW);
        }
    }

    @Override
    public boolean isAllowedEvent (Event event, BagObject filter) {

        return false;
    }
}
