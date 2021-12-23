package com.brettonw.bedrock.database;

import com.brettonw.bedrock.bag.*;
import com.brettonw.bedrock.bag.formats.MimeType;

import com.mongodb.client.*;
import com.mongodb.client.model.*;
import com.mongodb.*;

import com.brettonw.bedrock.logger.*;

import org.bson.Document;
import org.bson.conversions.Bson;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;

// http://mongodb.github.io/mongo-java-driver/
public class MongoDatabase implements Interface, AutoCloseable {
    private static final Logger log = LogManager.getLogger (MongoDatabase.class);

    private static final String UNDERSCORE_ID = "_id";
    private static final String LOCALHOST_DEFAULT = "mongodb://localhost:27017";

    public static final String CONNECTION_STRING = "connection-string";
    public static final String DATABASE_NAME = "database-name";
    public static final String COLLECTION_NAME = "collection-name";
    public static final String COLLECTION_NAMES = "collection-names";

    private static final Map<ConnectionString, MongoClient> MONGO_CLIENTS = new HashMap<> ();

    private final String databaseName;
    private final String collectionName;
    private final MongoCollection<Document> collection;

    private MongoDatabase (String databaseName, String collectionName, MongoCollection<Document> collection) {
        this.databaseName = databaseName;
        this.collectionName = collectionName;
        this.collection = collection;
        log.info ("Connected to '" + getName () + "'");
    }

    /**
     *
     * @return
     */
    public String getDatabaseName () {
        return databaseName;
    }

    /**
     *
     * @return
     */
    public String getCollectionName () {
        return collectionName;
    }

    /**
     *
     * @param connectionString
     * @param databaseName
     * @param collectionNames
     * @return
     */
    public static Map<String, MongoDatabase> connect (ConnectionString connectionString, String databaseName, String... collectionNames) {
        // check that everything is valid...
        if (databaseName != null) {
            if ((collectionNames != null) && (collectionNames.length > 0)) {
                // the first step is to get the clients, BUT... clients are retained in a hash for
                // pooling purposes, so the actual first step is to see if we've already connected
                // to this client.
                var mongoClient = MONGO_CLIENTS.get (connectionString);
                if (mongoClient == null) {
                    // this is our first connection to the given client, so create the
                    // connection, and then check that we can actually reach it by trying to do
                    // something that requires a live connection, like get the first database name
                    // from the database server. if that fails, we punt and return null...
                    try {
                        mongoClient = MongoClients.create(connectionString);
                        mongoClient.listDatabaseNames ().first ();
                    } catch (Exception exception) {
                        log.error ("Failed to connect to '" + databaseName + "'", exception);
                        return null;
                    }

                    // we successfully connected to a valid mongo client, so retain this client
                    // for future use...
                    MONGO_CLIENTS.put (connectionString, mongoClient);
                }

                // the next step is to get the database, and then the individual collections.
                // MongoDb is very nice to the programmatic interface, basically it will create
                // the database and collection if they don't already exist. The virtual connection
                // doesn't become a reality until something is written to the database, so at this
                // point there doesn't seem to be an actual failure case.
                // XXX I have found that the first operation will fail if the name is the same as
                // XXX another database or collection, differing only in case.
                var database = mongoClient.getDatabase (databaseName);
                var collections = new HashMap<String, MongoDatabase> (collectionNames.length);
                for (var collectionName : collectionNames) {
                    var collection = database.getCollection (collectionName);
                    var mongoDatabase = new MongoDatabase (databaseName, collectionName, collection);
                    collections.put (collectionName, mongoDatabase);
                }
                return collections;
            } else {
                log.error ("Invalid collectionNames");
            }
        } else {
            log.error ("Invalid databaseName");
        }

        return null;
    }

    /**
     *
     * @param connectionString
     * @param databaseName
     * @param collectionNames
     * @return
     */
    public static Map<String, MongoDatabase> connect (String connectionString, String databaseName, String... collectionNames) {
        try {
            return connect (new ConnectionString (connectionString), databaseName, collectionNames);
        } catch (IllegalArgumentException exception) {
            log.error (exception);
            return null;
        }
    }

    /**
     *
     * @param databaseName
     * @param collectionNames
     * @return
     */
    public static Map<String, MongoDatabase> connectLocal (String databaseName, String... collectionNames) {
        return connect (LOCALHOST_DEFAULT, databaseName, collectionNames);
    }

    /**
     *
     * @param collectionName
     * @return
     */
    public static MongoDatabase connectLocal (String collectionName) {
        var collections = connectLocal (collectionName, collectionName);
        if (collections != null) {
            for (MongoDatabase mongoDatabase : collections.values ()) {
                return mongoDatabase;
            }
        }
        return null;
    }

    /**
     *
     * @param configuration
     * @return
     */
    public static Map<String, MongoDatabase> connect (BagObject configuration) {
        // get the database name and collection names
        var databaseName = configuration.getString (DATABASE_NAME);
        var collectionNames = (String[]) null;
        if (configuration.has (COLLECTION_NAMES)) {
            var collectionNamesBagArray = configuration.getBagArray (COLLECTION_NAMES);
            if (collectionNamesBagArray != null) {
                collectionNames = collectionNamesBagArray.toArray (String.class);
            }
        } else if (configuration.has (COLLECTION_NAME)) {
            collectionNames = new String[] { configuration.getString (COLLECTION_NAME) };
            if (databaseName == null) {
                databaseName = collectionNames[0];
                log.warn ("Using '" + COLLECTION_NAME + "' (" + databaseName + ") as '" + DATABASE_NAME + "'");
            }
        }

        // now see if the database name is valid, we can't do anything without it
        if (databaseName != null) {
            // at least one collection name is the minimum required configuration, but we
            // can use the database name if nothing was provided
            if ((collectionNames == null) || (collectionNames.length == 0)) {
                collectionNames = new String[]{ databaseName };
                log.warn ("Using '" + DATABASE_NAME + "' (" + databaseName + ") as '" + COLLECTION_NAME + "'");
            }

            // and finally, get the connection string, or use localhost as the default
            var connectionString = configuration.has (CONNECTION_STRING) ? configuration.getString (CONNECTION_STRING) : LOCALHOST_DEFAULT;
            return connect (connectionString, databaseName, collectionNames);
        } else {
            log.error ("Invalid configuration (missing '" + DATABASE_NAME + "')");
        }
        return null;
    }

    /**
     *
     * @param bagObject
     * @return
     */
    public Interface put (BagObject bagObject) {
        var document = Document.parse (bagObject.toString (MimeType.JSON));
        collection.insertOne (document);
        return this;
    }

    /**
     *
     * @param bagArray
     * @return
     */
    public Interface putMany (BagArray bagArray) {
        for (int i = 0, end = bagArray.getCount (); i < end; ++i) {
            put (bagArray.getBagObject (i));
        }
        return this;
    }

    private Bson buildQuery (String queryJson) {
        if (queryJson != null) {
            var queryBagObject = BagObjectFrom.string (queryJson, MimeType.JSON);
            if (queryBagObject != null) {
                var count = queryBagObject.getCount ();
                var keys = queryBagObject.keys ();
                if (count > 1) {
                    var bsons = new Bson[count];
                    for (int i = 0; i < count; ++i) {
                        bsons[i] = Filters.eq (keys[i], queryBagObject.getString (keys[i]));
                    }
                    return Filters.and (bsons);
                } else if (count == 1) {
                    return Filters.eq (keys[0], queryBagObject.getString (keys[0]));
                }
            }
        }
        return new Document ();
    }

    private static BagObject extract (Document document) {
        if (document != null) {
            // XXX if only there was a better way to do this... it will make Mongo a challenge at any kind of scale
            var json = document.toJson ();
            var bagObject = BagObjectFrom.string (json, MimeType.JSON);

            // Mongo adds "_id" if the posting object doesn't include it. we decide to allow
            // this, but to otherwise mask it from the user as it would lock us into the
            // Mongo API
            bagObject = bagObject.select (new SelectKey (SelectType.EXCLUDE, UNDERSCORE_ID));
            return bagObject;
        }
        return null;
    }

    /**
     *
     * @param queryJson
     * @return
     */
    public BagObject get (String queryJson) {
        var filter = buildQuery (queryJson);
        var queryResult = collection.find (filter);
        var got = queryResult.first ();
        return extract (got);
    }

    /**
     *
     * @param queryJson
     * @return
     */
    public BagArray getMany (String queryJson) {
        final var bagArray = new BagArray ();
        var filter = buildQuery (queryJson);
        Consumer<Document> consumer = document -> bagArray.add (extract (document));
        collection.find (filter).forEach (consumer);
        return bagArray;
    }

    /**
     *
     * @return
     */
    public BagArray getAll () {
        final var bagArray = new BagArray ();
        Consumer<Document> consumer = document -> bagArray.add (extract (document));
        collection.find (new Document ()).forEach (consumer);
        return bagArray;
    }

    /**
     *
     * @param queryJson
     * @return
     */
    public Interface delete (String queryJson) {
        var filter = buildQuery (queryJson);
        collection.deleteOne (filter);
        return this;
    }

    /**
     *
     * @param queryJson
     * @return
     */
    public Interface deleteMany (String queryJson) {
        var filter = buildQuery (queryJson);
        collection.deleteMany (filter);
        return this;
    }

    /**
     *
     * @return
     */
    public Interface deleteAll () {
        collection.deleteMany (new Document ());
        return this;
    }

    /**
     *
     * @throws Exception
     */
    public void drop () throws Exception {
        close ();
        collection.drop ();
        log.info ("Dropped '" + getName () + "'" );
    }

    /**
     *
     * @throws Exception
     */
    @Override
    public void close () throws Exception {
        // XXX what should happen here?
        log.info ("Closed '" + getName () + "'");
    }

    /**
     *
     * @return
     */
    public long getCount () {
        return collection.countDocuments();
    }

    /**
     *
     * @return
     */
    public String getName () {
        return databaseName + "." + collectionName;
    }
}
