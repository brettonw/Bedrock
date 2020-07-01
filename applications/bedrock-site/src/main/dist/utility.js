Bedrock.Utility = function () {
    let _ = Object.create (null);

    _.copyIf = function (key, leftObject, rightObject) {
        if (key in leftObject) {
            rightObject[key] = leftObject[key];
        }
    };

    _.randomString = function (length, chars) {
        let result = "";
        for (let i = 0; i < length; ++i) {
            result += chars[Math.floor (Math.random () * chars.length)];
        }
        return result;
    };

    _.defaultTrue = function (value) {
        return ((typeof (value) === "undefined") || (value !== false));
    };

    _.defaultFalse = function (value) {
        return ((typeof (value) !== "undefined") && (value !== false));
    };

    _.ucFirst = function (str) {
        return ((typeof (str) !== "undefined") && (str.length > 0)) ? (str.charAt(0).toUpperCase() + str.slice(1)) : "";
    };

    return _;
} ();
