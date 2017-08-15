Bedrock.Utility = function () {
    let _ = Object.create (null);

    _.copyIf = function (key, leftObject, rightObject) {
        if (key in leftObject) rightObject[key] = leftObject[key];
    };

    _.randomString = function (length, chars) {
        var result = "";
        for (let i = 0; i < length; ++i) {
            result += chars[Math.floor (Math.random () * chars.length)];
        }
        return result;
    };

    return _;
} ();
