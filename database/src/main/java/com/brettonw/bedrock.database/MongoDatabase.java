package com.brettonw.bedrock.database;

import com.brettonw.bedrock.bag.*;
import com.brettonw.bedrock.bag.formats.MimeType;
import com.mongodb.Block;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import lombok.Getter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.bson.Document;
import org.bson.conversions.Bson;

import java.util.HashMap;
import java.util.Map;

public class MongoDatabase implements Interface, AutoCloseable {
    private static final Logger log = LogManager.getLogger (MongoDatabase.class);

    private static final String UNDERSCORE_ID = "_id";
    private static final String LOCALHOST_DEFAULT = "mongodb://localhost:27017";

    public static final String CONNECTION_STRING = "connection-string";
    public static final String DATABASE_NAME = "database-name";
    public static final String COLLECTION_NAME = "collection-name";
    public static final String COLLECTION_NAMES = "collection-names";

    private static final Map<MongoClientURI, MongoClient> MONGO_CLIENTS = new HashMap<> ();

    @Getter private String databaseName;
    @Getter private String collectionName;
    private MongoCollection<Document> collection;

    private MongoDatabase (String databaseName, String collectionName, MongoCollection<Document> collection) {
        this.databaseName = databaseName;
        this.collectionName = collectionName;
        this.collection = collection;
        log.info ("Connected to '" + getName () + "'");
    }

    /**
     *
     * @param clientUri
     * @param databaseName
     * @param collectionNames
     * @return
     */
    public static Map<String, MongoDatabase> connect (MongoClientURI clientUri, String databaseName, String... collectionNames) {
        // check that everything is valid...
        if (databaseName != null) {
            if ((collectionNames != null) && (collectionNames.length > 0)) {
                // the first step is to get the clients, BUT... clients are retained in a hash for
                // pooling purposes, so the actual first step is to see if we've already connected
                // to this client.
                MongoClient mongoClient = MONGO_CLIENTS.get (clientUri);
                if (mongoClient == null) {
                    try {
                        // this is our first connection to the given client, so create the connection,
                        // and then check that we can actually reach it by trying to get its address.
                        // if that fails, we punt and return null...
                        mongoClient = new MongoClient (clientUri);
                        mongoClient.getAddress ();
                    } catch (Exception exception) {
                        log.error ("Failed to connect to '" + clientUri + "'", exception);
                        return null;
                    }

                    // we successfully connected to a valid mongo client, so retain this client
                    // for future use...
                    MONGO_CLIENTS.put (clientUri, mongoClient);
                }

                // the next step is to get the database, and then the individual collections.
                // MongoDb is very nice to the programmatic interface, basically it will create
                // the database and collection if they don't already exist. The virtual connection
                // doesn't become a reality until something is written to the database, so at this
                // point there doesn't seem to be an actual failure case.
                // XXX I have found that the first operation will fail if the name is the same as
                // XXX another database or collection, differing only in case.
                com.mongodb.client.MongoDatabase database = mongoClient.getDatabase (databaseName);
                Map<String, MongoDatabase> collections = new HashMap<> (collectionNames.length);
                for (String collectionName : collectionNames) {
                    MongoCollection<Document> collection = database.getCollection (collectionName);
                    MongoDatabase mongoDatabase = new MongoDatabase (databaseName, collectionName, collection);
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
        MongoClientURI mongoClientUri = null;
        try {
            mongoClientUri = new MongoClientURI (connectionString);
        } catch (Exception exception) {
            log.error ("Failed to connect to '" + connectionString + "'", exception);
            return null;
        }

        return connect (mongoClientUri, databaseName, collectionNames);
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
        Map<String, MongoDatabase>  collections = connectLocal (collectionName, collectionName);
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
        String databaseName = configuration.getString (DATABASE_NAME);
        String[] collectionNames = null;
        if (configuration.has (COLLECTION_NAMES)) {
            BagArray collectionNamesBagArray = configuration.getBagArray (COLLECTION_NAMES);
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
            String connectionString = configuration.has (CONNECTION_STRING) ? configuration.getString (CONNECTION_STRING) : LOCALHOST_DEFAULT;
            return connect (connectionString, databaseName, collectionNames);
        } else {
            log.error ("Invalid configuration (missing '" + DATABASE_NAME + "')");
        }
        return null;
    }

    public Interface put (BagObject bagObject) {
        Document document = Document.parse (bagObject.toString (MimeType.JSON));
        collection.insertOne (document);
        return this;
    }

    public Interface putMany (BagArray bagArray) {
        for (int i = 0, end = bagArray.getCount (); i < end; ++i) {
            put (bagArray.getBagObject (i));
        }
        return this;
    }

    private Bson buildQuery (String queryJson) {
        if (queryJson != null) {
            BagObject queryBagObject = BagObjectFrom.string (queryJson, MimeType.JSON);
            if (queryBagObject != null) {
                int count = queryBagObject.getCount ();
                String[] keys = queryBagObject.keys ();
                if (count > 1) {
                    Bson[] bsons = new Bson[count];
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
            String json = document.toJson ();
            BagObject bagObject = BagObjectFrom.string (json, MimeType.JSON);

            // Mongo adds "_id" if the posting object doesn't include it. we decide to allow
            // this, but to otherwise mask it from the user as it would lock us into the
            // Mongo API
            bagObject = bagObject.select (new SelectKey (SelectType.EXCLUDE, UNDERSCORE_ID));
            return bagObject;
        }
        return null;
    }

    public BagObject get (String queryJson) {
        Bson filter = buildQuery (queryJson);
        FindIterable<Document> queryResult = collection.find (filter);
        Document got = queryResult.first ();
        BagObject bagObject = extract (got);
        return bagObject;
    }

    public BagArray getMany (String queryJson) {
        final BagArray bagArray = new BagArray ();
        Bson filter = buildQuery (queryJson);
        collection.find (filter).forEach (
                (Block<Document>) document -> bagArray.add (extract (document))
        );
        return bagArray;
    }

    public BagArray getAll () {
        final BagArray bagArray = new BagArray ();
        collection.find (new Document ()).forEach (
                (Block<Document>) document -> bagArray.add (extract (document))
        );
        return bagArray;
    }

    public Interface delete (String queryJson) {
        Bson filter = buildQuery (queryJson);
        collection.deleteOne (filter);
        return this;
    }

    public Interface deleteMany (String queryJson) {
        Bson filter = buildQuery (queryJson);
        collection.deleteMany (filter);
        return this;
    }

    public Interface deleteAll () {
        collection.deleteMany (new Document ());
        return this;
    }

    public void drop () throws Exception {
        close ();
        collection.drop ();
        log.info ("Dropped '" + getName () + "'" );
    }

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
        return collection.count ();
    }

    public String getName () {
        return databaseName + "." + collectionName;
    }
}
