Bedrock.LogLevel = function () {
    let _ = Object.create (null);

    _.TRACE = 0;
    _.INFO = 1;
    _.WARNNG = 2;
    _.ERROR = 3;

    // default
    let logLevel = _.ERROR;

    _.set = function (newLogLevel) {
        logLevel = newLogLevel;
    };

    let formatStrings = ["TRC", "INF", "WRN", "ERR"];
    _.say = function (messageLogLevel, message) {
        if (messageLogLevel >= logLevel) {
            console.log (formatStrings[messageLogLevel] + ": " + message)
        }
    };

    return _;
} ();

#ifdef DEBUG

#define SET_LOG_LEVEL(logLevel) Bedrock.LogLevel.set (Bedrock.LogLevel.logLevel)
#define LOG(logLevel, message) Bedrock.LogLevel.say (Bedrock.LogLevel.logLevel, message)
#define DEBUGGER debugger

#else

#define SET_LOG_LEVEL(logLevel)
#define LOG(logLevel, message)
#define DEBUGGER

#endif

SET_LOG_LEVEL(INFO);
