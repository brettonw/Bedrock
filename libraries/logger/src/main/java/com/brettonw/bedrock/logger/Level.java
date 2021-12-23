package com.brettonw.bedrock.logger;

import java.util.Map;

public class Level {
    private int level;
    private String name;

    public int getLevel () { return level; }
    public String getName () { return name; }

    private Level (int level, String name) {
                this.level = level;
                this.name = name;
        }

    public static Level ALL = new Level (0, "ALL");
    public static Level TRACE = new Level (1, "TRACE");
    public static Level DEBUG = new Level (2, "DEBUG");
    public static Level INFO = new Level (3, "INFO");
    public static Level WARN = new Level (4, "WARN");
    public static Level ERROR = new Level (5, "ERROR");
    public static Level FATAL = new Level (6, "FATAL");
    public static Level OFF = new Level (7, "OFF");

    private static Map<String, Level> levels = Map.of(
            "ALL", ALL,
            "TRACE", TRACE,
            "DEBUG", DEBUG,
            "INFO", INFO,
            "WARN", WARN,
            "ERROR", ERROR,
            "FATAL", FATAL,
            "OFF", OFF
            );
    public static Level getLevel (String name, Level defaultLevel) { return levels.getOrDefault(name, defaultLevel); }
    public static Level getLevel (String name) { return getLevel (name, ALL); }
}
