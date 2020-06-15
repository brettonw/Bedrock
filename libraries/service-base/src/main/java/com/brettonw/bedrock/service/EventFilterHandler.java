package com.brettonw.bedrock.service;

import com.brettonw.bedrock.bag.BagObject;

public interface EventFilterHandler {
    public boolean isAllowedEvent (Event event, BagObject filterConfiguration);
}
