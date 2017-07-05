"use strict;"

#ifdef DEBUG

#define SET_LOG_LEVEL(logLevel) LogLevel.set (logLevel)
#define LOG(level, message) LogLevel.say (level, message)
#define DEBUGGER debugger

#else

#define SET_LOG_LEVEL(logLevel)
#define LOG(level, message)
#define DEBUGGER

#endif

// class hierarchy
#define SUPER   Object.getPrototypeOf(_)
#define OBJ  Object.create (null)
#define CLASS_BASE   Object.create (ClassBase)

// default values...
#define DEFAULT_VALUE(value, defaultValue) (value = (((typeof value !== "undefined") && (value != null)) ? value : defaultValue))
#define DEFAULT_FUNCTION(value, defaultFunction) (value = (((typeof value !== "undefined") && (value != null)) ? value : defaultFunction ()))
