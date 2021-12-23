module com.brettonw.bedrock.database {
    requires com.brettonw.bedrock.base;
    requires com.brettonw.bedrock.bag;
    requires com.brettonw.bedrock.logger;
    requires org.mongodb.driver.sync.client;
    requires org.mongodb.driver.core;
    requires org.mongodb.bson;
    exports com.brettonw.bedrock.database;
}
