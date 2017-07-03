package com.brettonw.bedrock.bag;

/**
 * A helper class for composing paths used in BagObject indexing.
 */
public final class Key {
    Key () {}

    /**
     * Concatenate multiple string components to make a path
     * @param components the different levels of the hierarchy to index
     * @return a String with the components in path form for indexing into a bag object
     */
    public static String cat (Object... components) {
        StringBuilder stringBuilder = new StringBuilder ();
        if (components.length > 0) {
            stringBuilder.append (components[0]);
            for (int i = 1; i < components.length; ++i) {
                stringBuilder.append (BagObject.PATH_SEPARATOR).append (components[i].toString ());
            }
        }
        return stringBuilder.toString ();
    }

    static String[] split (String key) {
        return key.split (BagObject.PATH_SEPARATOR, 2);
    }
}
