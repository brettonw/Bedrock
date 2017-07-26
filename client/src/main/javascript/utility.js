Bedrock.Utility = function () {
    let _ = Object.create (null);

    _.copyIf = function (key, leftObject, rightObject) {
        if (key in leftObject) rightObject[key] = leftObject[key];
    };

    return _;
} ();
