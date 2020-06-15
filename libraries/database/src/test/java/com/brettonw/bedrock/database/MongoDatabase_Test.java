package com.brettonw.bedrock.database;

import com.brettonw.bedrock.bag.BagArray;
import com.brettonw.bedrock.bag.BagObject;
import com.brettonw.bedrock.bag.formats.MimeType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static com.brettonw.bedrock.database.MongoDatabase.*;
import static org.junit.jupiter.api.Assertions.*;

public class MongoDatabase_Test {
    private static final Logger log = LogManager.getLogger (MongoDatabase_Test.class);

    private static final String TEST_COLLECTION_NAME = "Test";
    private static final String TEST_NAME = "Test.Test";
    private BagArray testBagArray;
    private String queryJson;
    private String queryManyJson;

    public MongoDatabase_Test () throws Exception {
        testBagArray = new BagArray ()
                .add (new BagObject ()
                        .put ("id", 1)
                        .put ("key", "value 1" )
                        .put ("payload", "full" )
                )
                .add (new BagObject ()
                        .put ("id", 2)
                        .put ("key", "value 2" )
                        .put ("payload", "medium" )
                )
                .add (new BagObject ()
                        .put ("id", 3)
                        .put ("key", "value 3" )
                        .put ("payload", "medium" )
                )
                .add (new BagObject ()
                        .put ("id", 4)
                        .put ("key", "value 4" )
                        .put ("payload", "empty" )
                );

        queryJson = new BagObject ().put ("id", 2).toString (MimeType.JSON);
        queryManyJson = new BagObject ().put ("payload", "medium" ).toString (MimeType.JSON);

        // ensure the primary test database is fresh
        close (open ());
    }

    private Interface open () {
        MongoDatabase mongoDatabase = MongoDatabase.connectLocal (TEST_COLLECTION_NAME);
        assertNotEquals (null, mongoDatabase);
        return mongoDatabase;
    }

    private void close (Interface bagDb) throws Exception {
        bagDb.deleteAll ();
        assertEquals (0, bagDb.getCount ());
        bagDb.drop ();
    }

    @Test
    public void testGetNames () throws Exception {
        MongoDatabase mongoDatabase = MongoDatabase.connectLocal (TEST_COLLECTION_NAME);
        assertEquals (TEST_COLLECTION_NAME, mongoDatabase.getDatabaseName ());
        assertEquals (TEST_COLLECTION_NAME, mongoDatabase.getCollectionName ());
        assertEquals (TEST_NAME, mongoDatabase.getName ());
        close (mongoDatabase);
    }

    @Test
    public void testGetWithNoMatches () throws Exception {
        // ensure the primary test database is fresh
        close (open ());
        Interface bagDb = open ();
        BagObject result = bagDb.get (queryJson);
        assertEquals (result, null);
        close (bagDb);
    }

    @Test
    public void testPutWithGet () throws Exception {
        Interface bagDb = open ()
                .put (testBagArray.getBagObject (0))
                .put (testBagArray.getBagObject (1))
                .put (testBagArray.getBagObject (2));
        assertEquals (3, bagDb.getCount ());
        assertEquals (TEST_NAME, bagDb.getName ());

        BagObject result = bagDb.get (queryJson);
        assertEquals (testBagArray.getBagObject (1), result);

        close (bagDb);
    }

    @Test
    public void testPutArrayWithGet () throws Exception {
        Interface bagDb = open ().putMany (testBagArray);
        assertEquals (testBagArray.getCount (), bagDb.getCount ());
        assertEquals (TEST_NAME, bagDb.getName ());

        BagObject result = bagDb.get (queryJson);
        assertEquals (testBagArray.getBagObject (1), result);

        close (bagDb);
    }

    @Test
    public void testDelete () throws Exception {
        Interface bagDb = open ().putMany (testBagArray);
        assertEquals (testBagArray.getCount (), bagDb.getCount ());
        assertEquals (TEST_NAME, bagDb.getName ());

        bagDb.delete (queryJson);
        BagObject result = bagDb.get (queryJson);
        assertEquals (null, result);
        assertEquals (testBagArray.getCount () - 1, bagDb.getCount ());

        close (bagDb);
    }

    @Test
    public void testGetAll () throws Exception {
        Interface bagDb = open ().putMany (testBagArray);
        assertEquals (testBagArray.getCount (), bagDb.getCount ());
        assertEquals (TEST_NAME, bagDb.getName ());

        BagArray bagArray = bagDb.getAll ();
        assertNotEquals (null, bagArray);
        assertEquals (testBagArray.getCount (), bagArray.getCount ());
        assertEquals (testBagArray, bagArray);

        close (bagDb);
    }

    @Test
    public void testGetMany () throws Exception {
        Interface bagDb = open ().putMany (testBagArray);
        assertEquals (testBagArray.getCount (), bagDb.getCount ());
        assertEquals (TEST_NAME, bagDb.getName ());

        BagArray bagArray = bagDb.getMany (queryManyJson);
        assertNotEquals (null, bagArray);
        assertEquals (2, bagArray.getCount ());
        assertEquals (testBagArray.getBagObject (1), bagArray.getBagObject (0));
        assertEquals (testBagArray.getBagObject (2), bagArray.getBagObject (1));

        close (bagDb);
    }

    @Test
    public void testDeleteMany () throws Exception {
        Interface bagDb = open ().putMany (testBagArray);
        assertEquals (testBagArray.getCount (), bagDb.getCount ());
        assertEquals (TEST_NAME, bagDb.getName ());

        bagDb.deleteMany (queryManyJson);
        assertEquals (2, bagDb.getCount ());

        BagArray bagArray = bagDb.getMany (queryManyJson);
        assertNotEquals (null, bagArray);
        assertEquals (0, bagArray.getCount ());

        close (bagDb);
    }

    @Test
    public void testGetWithMultipleMatchFields () throws Exception {
        Interface bagDb = open ().putMany (testBagArray);
        assertEquals (testBagArray.getCount (), bagDb.getCount ());
        assertEquals (TEST_NAME, bagDb.getName ());

        BagObject result = bagDb.get (new BagObject ().put ("id", 3).put ("payload", "medium").toString (MimeType.JSON));
        assertEquals (testBagArray.getBagObject (2), result);

        close (bagDb);
    }

    @Test
    public void testGetManyWithNull () throws Exception {
        Interface bagDb = open ().putMany (testBagArray);
        assertEquals (testBagArray.getCount (), bagDb.getCount ());
        assertEquals (TEST_NAME, bagDb.getName ());

        BagArray bagArray = bagDb.getMany (null);
        assertNotEquals (null, bagArray);
        assertEquals (testBagArray.getCount (), bagArray.getCount ());
        assertEquals (testBagArray, bagArray);

        close (bagDb);
    }

    @Test
    public void testConnectWithBadConnectionStringFails () {
        Map<String, MongoDatabase> collections = MongoDatabase.connect ("bongo", "bongo", "bongo");
        assertEquals (null, collections);
    }

    @Test
    public void testConnectWithInvalidAddressFails () {
        Map<String, MongoDatabase> collections = MongoDatabase.connect ("mongodb://bongo", "bongo", "bongo");
        assertEquals (null, collections);
    }

    @Test
    public void testConnectLocalWithNullFails () {
        MongoDatabase mongoDatabase = MongoDatabase.connectLocal (null);
        assertEquals (null, mongoDatabase);
    }

    @Test
    public void testConnectLocalWithNullFails2 () {
        Map<String, MongoDatabase> collections = MongoDatabase.connectLocal ("xxx", (String[])null);
        assertEquals (null, collections);
    }

    @Test
    public void testConnectLocalWithNullDatabaseNameFails () {
        Map<String, MongoDatabase> collections = MongoDatabase.connectLocal (null, "xxx");
        assertEquals (null, collections);
    }

    @Test
    public void testMinimumConfiguration () {
        // minimum required configuration
        BagObject configuration = BagObject.open (COLLECTION_NAME, "bongo");
        Map<String, MongoDatabase> collections = MongoDatabase.connect (configuration);
        assertNotEquals (null, collections);
        try (MongoDatabase mongoDatabase = collections.get ("bongo")) {
            mongoDatabase.put (BagObject.open ("xxx", "yyy"));
            assertTrue (mongoDatabase.getCount () == 1);
            mongoDatabase.drop ();
        } catch (Exception exception) {}
    }

    @Test
    public void testMinimumConfiguration2 () {
        // minimum required configuration
        BagObject configuration = BagObject.open (DATABASE_NAME, "bongo");
        Map<String, MongoDatabase> collections = MongoDatabase.connect (configuration);
        assertNotEquals (null, collections);
        try (MongoDatabase mongoDatabase = collections.get ("bongo")) {
            mongoDatabase.put (BagObject.open ("xxx", "yyy"));
            assertTrue (mongoDatabase.getCount () == 1);
            mongoDatabase.drop ();
        } catch (Exception exception) {}
    }

    @Test
    public void testConfiguration () throws Exception {
        BagObject configuration = BagObject
            .open (DATABASE_NAME, "mvn-test")
            .put (COLLECTION_NAMES, BagArray.open ("bongo"));

        Map<String, MongoDatabase> collections = MongoDatabase.connect (configuration);
        assertNotEquals (null, collections);
        try (MongoDatabase mongoDatabase = collections.get ("bongo")) {
            mongoDatabase.put (BagObject.open ("xxx", "yyy"));
            assertTrue (mongoDatabase.getCount () == 1);
            mongoDatabase.drop ();
        } catch (Exception exception) {
            throw (exception);
        }
    }

    /*
    @Test
    public void testRemoteConfiguration () throws Exception {
        BagObject configuration = BagObjectFrom.resource (MongoDatabase_Test.class, "/configuration.json");

        Map<String, MongoDatabase> collections = MongoDatabase.connect (configuration);
        assertNotEquals (null, collections);
        try (MongoDatabase mongoDatabase = collections.get ("collection-test")) {
            mongoDatabase.put (BagObject.open ("xxx", "yyy"));
            assertTrue (mongoDatabase.getCount () == 1);
            mongoDatabase.drop ();
        } catch (Exception exception) {
            throw (exception);
        }
    }
    */

    @Test
    public void testBadConfiguration () {
        BagObject configuration = BagObject.open (CONNECTION_STRING, "xxx");
        Map<String, MongoDatabase> collections = MongoDatabase.connect (configuration);
        assertEquals (null, collections);
    }
}
