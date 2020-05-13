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

    $.getFromQuery = function (query, onSuccess) {
        Bedrock.Http.get (query, function (response) {
            LOG (INFO, query + " (status: " + response.status + ")");
            if (response.status === "ok") {
                onSuccess (response.response);
            }
        });
    };

    $.get = function (parameters, onSuccess) {
        $.getFromQuery ($.getQuery (parameters), onSuccess);
    };

    $.postFromQuery = function (query, postData, onSuccess) {
        Bedrock.Http.post (query, postData, function (response) {
            LOG (INFO, query + " (status: " + response.status + ")");
            if (response.status === "ok") {
                onSuccess (response.response);
            }
        });
    };

    $.post = function (parameters, onSuccess) {
        $.postromQuery ($.getQuery (parameters), postData, onSuccess);
    };

    return $;
} ();
