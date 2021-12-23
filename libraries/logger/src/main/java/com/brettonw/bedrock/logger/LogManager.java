package com.brettonw.bedrock.logger;

import java.io.PrintStream;
import java.util.HashMap;
import java.util.Map;

public class LogManager {
    private static Map<String, Logger> loggers;
    private static Level defaultLevel = Level.INFO;
    private static String defaultConfiguration = "";
    private static PrintStream defaultOut = System.err;

    private static Map<String, Logger> getLoggers () {
        if (loggers == null) {
            loggers = new HashMap<String, Logger> ();
        }
        return loggers;
    }

    public static Logger getLogger (Class theClass, Level level, String configuration, PrintStream out) {
        Map<String, Logger> loggers = getLoggers ();
        String className = theClass.getCanonicalName();
        if (! loggers.containsKey(className)) {
            loggers.put(className, new Logger (className, level, configuration, out));
        }
        return loggers.get(className);
    }

    public static Logger getLogger (Class theClass) {
        return getLogger (theClass, defaultLevel, defaultConfiguration, defaultOut);
    }
}
