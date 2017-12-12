Bedrock.Utility = function () {
    let $ = Object.create (null);

    $.copyIf = function (key, leftObject, rightObject) {
        if (key in leftObject) {
            rightObject[key] = leftObject[key];
        }
    };

    $.randomString = function (length, chars) {
        let result = "";
        for (let i = 0; i < length; ++i) {
            result += chars[Math.floor (Math.random () * chars.length)];
        }
        return result;
    };

    return $;
} ();
