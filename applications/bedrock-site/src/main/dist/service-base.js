Bedrock.ServiceBase = function () {
    let $ = Object.create (null);

    $.getQuery = function (parameters) {
        let query = "api";
        let divider = "?";
        for (let name of Object.keys (parameters)) {
            let parameter = parameters[name];
            query += divider + name + "=" + parameter;
            divider = "&"
        }
        return query;
    };

    $.getFromQuery = function (query, onSuccess, onFailure) {
        Bedrock.Http.get (query, function (response) {
            LOG (INFO, query + " (status: " + response.status + ")");
            if (response.status === "ok") {
                onSuccess (("response" in response) ? response.response : response.status);
            } else if (typeof (onFailure) !== "undefined") {
                onFailure (response.error);
            } else {
                // default on failure, alert...
                alert (JSON.stringify(response, null, 4));
            }
        });
    };

    $.get = function (parameters, onSuccess, onFailure) {
        $.getFromQuery ($.getQuery (parameters), onSuccess, onFailure);
    };

    $.postFromQuery = function (query, postData, onSuccess, onFailure) {
        Bedrock.Http.post (query, postData, function (response) {
            LOG (INFO, query + " (status: " + response.status + ")");
            if (response.status === "ok") {
                onSuccess (response.response);
            } else if (typeof (onFailure) !== "undefined") {
                onFailure (response.error);
            } else {
                // default on failure, alert...
                alert (JSON.stringify(response, null, 4));
            }
        });
    };

    $.post = function (parameters, postData, onSuccess, onFailure) {
        $.postFromQuery ($.getQuery (parameters), postData, onSuccess, onFailure);
    };

    return $;
} ();
