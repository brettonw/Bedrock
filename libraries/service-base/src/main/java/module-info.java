module com.brettonw.bedrock.service {
    requires java.servlet;
    requires org.apache.commons.io;
    requires com.brettonw.bedrock.base;
    requires com.brettonw.bedrock.logger;
    requires com.brettonw.bedrock.bag;
    requires com.brettonw.bedrock.secret;
    exports com.brettonw.bedrock.service;
}
