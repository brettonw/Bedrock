package com.brettonw.bedrock.database;

import com.brettonw.bedrock.bag.BagArray;
import com.brettonw.bedrock.bag.BagObject;

public interface Interface extends AutoCloseable {
    /**
     *
     * @param bagObject
     * @return
     */
    Interface put (BagObject bagObject);

    /**
     *
     * @param bagArray
     * @return
     */
    Interface putMany (BagArray bagArray);

    /**
     *
     * @param queryJson
     * @return
     */
    BagObject get (String queryJson);

    /**
     *
     * @param queryJson
     * @return
     */
    BagArray getMany (String queryJson);

    /**
     *
     * @return
     */
    BagArray getAll ();

    /**
     *
     * @param queryJson
     * @return
     */
    Interface delete (String queryJson);

    /**
     *
     * @param queryJson
     * @return
     */
    Interface deleteMany (String queryJson);

    /**
     *
     * @return
     */
    Interface deleteAll ();

    /**
     *
     */
    void drop () throws Exception;

    /**
     *
     * @return
     */
    long getCount ();

    /**
     *
     * @return
     */
    String getName ();
}
