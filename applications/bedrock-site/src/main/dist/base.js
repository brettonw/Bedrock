Bedrock.Base = function () {
    let _ = Object.create (null);

    _.new = function (parameters) {
        // TODO could add some validation here...

        return Object.create (this).init (parameters);
    };

    return _;
} ();
