package com.brettonw.bedrock.service;

import com.brettonw.bedrock.bag.Bag;
import com.brettonw.bedrock.bag.BagArray;
import com.brettonw.bedrock.bag.BagObject;
import lombok.Data;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.http.HttpServletRequest;

import static com.brettonw.bedrock.service.Keys.*;

@Data @RequiredArgsConstructor
public class Event {
    private static final Logger log = LogManager.getLogger (Event.class);

    @Getter @NonNull private final BagObject query;
    @Getter @NonNull private final HttpServletRequest request;
    @Getter          private Bag response;

    public String getEventName () {
        return query.getString (EVENT);
    }

    public Event respond (Bag bag) {
        response = bag;
        return this;
    }

    public Event ok (Bag bag) {
        return respond (BagObject.open (QUERY, query).put (STATUS, OK).put (RESPONSE, bag));
    }

    public Event ok () {
        return ok (null);
    }

    public Event error (BagArray errors) {
        // log the errors
        for (int i = 0, end = errors.getCount (); i < end; ++i) {
            log.error (errors.getString (i));
        }

        // and respond to the end user...
        return respond (BagObject.open (QUERY, query).put (STATUS, ERROR).put (ERROR, errors));
    }

    public Event error (String error) {
        return error (BagArray.open (error));
    }
}
