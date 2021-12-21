package com.brettonw.bedrock.logger;

public class Logger {
    String name;
    Level level;

    public Logger (String name, String configuration, Level level) {
        this.name = name;
        this.level = level;
    }

    public Level getLevel () { return level; }
    public Logger setLevel (Level level) { this.level = level; return this; }

    public Logger log (Level logLevel, String message) {
        if (logLevel.getLevel() >= level.getLevel()) {
            // print a message to ... what (STDERR)?
        }
        return this;
    }

    public Logger trace (String message) { return log (Level.TRACE, message); }
    public Logger debug (String message) { return log (Level.DEBUG, message); }
    public Logger info (String message) { return log (Level.INFO, message); }
    public Logger warn (String message) { return log (Level.WARN, message); }
    public Logger error (Exception exception, String message) {
        // TODO do something with the exception (stack trace, etc.)
        return log (Level.ERROR, message);
    }

    public Logger error (Exception exception) {
        return error (exception, exception.getMessage());
    }

    public void fatal (String message) {
        log (Level.FATAL, message);
        // XXX what to do with fatal?
    }

}
