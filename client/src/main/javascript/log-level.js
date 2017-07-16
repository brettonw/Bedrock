let LogLevel = function () {
    let _ = OBJ;

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

    _.trace = function (message) {
        this.say (_.TRACE, message);
    };

    _.info = function (message) {
        this.say (_.INFO, message);
    };

    _.warn = function (message) {
        this.say (_.WARNNG, message);
    };

    _.error = function (message) {
        this.say (_.ERROR, message);
    };

    return _;
} ();
