package com.brettonw.bedrock.bag;

public class SortKey {
    public static final String KEY = "key";
    public static final String TYPE = "type";
    public static final SortType DEFAULT_TYPE = SortType.ALPHABETIC;
    public static final String ORDER = "order";
    public static final SortOrder DEFAULT_ORDER = SortOrder.ASCENDING;

    public static final SortKey[] DEFAULT = { new SortKey () };

    private String key;
    private SortType type;
    private SortOrder order;

    public SortKey () {
        this ((String) null);
    }

    public SortKey (String key) {
        this (key, DEFAULT_TYPE, DEFAULT_ORDER);
    }

    public SortKey (String key, SortType type, SortOrder order) {
        this.key = key;
        this.type = type;
        this.order = order;
    }

    public SortKey (BagObject bagObject) {
        this (
                bagObject.getString (KEY),
                bagObject.getEnum (TYPE, SortType.class, () -> DEFAULT_TYPE),
                bagObject.getEnum (ORDER, SortOrder.class, () -> DEFAULT_ORDER)
        );
    }

    public String getKey () {
        return key;
    }

    public SortType getType () {
        return type;
    }

    public SortOrder getOrder () {
        return order;
    }

    public SortKey setKey (String key) {
        this.key = key;
        return this;
    }

    public SortKey setType (SortType type) {
        this.type = type;
        return this;
    }

    public SortKey setOrder (SortOrder order) {
        this.order = order;
        return this;
    }

    private int compare (Double left, Double right) {
        return (left < right) ? -1 : (left > right) ? 1 : 0;
    }

    public int compare (String left, String right) {
        int cmp = 0;
        switch (type) {
            case ALPHABETIC:
                switch (order) {
                    case ASCENDING:
                        cmp = left.compareTo (right);
                        break;
                    case DESCENDING:
                        cmp = right.compareTo (left);
                        break;
                }
                break;
            case NUMERIC:
                switch (order) {
                    case ASCENDING:
                        cmp = compare (new Double (left), new Double (right));
                        break;
                    case DESCENDING:
                        cmp = compare (new Double (right), new Double (left));
                        break;
                }
                break;
        }
        return cmp;
    }

    public static SortKey[] keys (String... keys) {
        SortKey[] sortKeys = new SortKey[keys.length];
        for (int i = 0, end = keys.length; i < end; ++i) {
            sortKeys[i] = new SortKey (keys[i]);
        }
        return sortKeys;
    }
    // array of sort keys like [ { "key":"key1" }, { "key":"key2", "type":"alphabetic"}, { "key":"key2", "type":"numeric", "order":"ascending"} ]
    public static SortKey[] keys (BagArray keys) {
        SortKey[] sortKeys = new SortKey[keys.getCount ()];
        for (int i = 0, end = keys.getCount (); i < end; ++i) {
            sortKeys[i] = new SortKey (keys.getBagObject (i));
        }
        return sortKeys;
    }
}
