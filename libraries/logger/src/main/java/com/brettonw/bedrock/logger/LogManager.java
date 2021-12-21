package com.brettonw.bedrock.logger;

public class LogManager {
    public static Logger getLogger (Class theClass) {
        // XXX need to get the log level from somewhere - like a configuration
        Level level = Level.INFO;
        return new Logger (theClass.getCanonicalName(), "", level);
    }
}
