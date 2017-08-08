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
            console.log (query + " (status: " + response.status + ")");
            if (response.status === "ok") {
                onSuccess (response.response);
            }
        });
    };

    $.get = function (parameters, onSuccess) {
        $.getFromQuery ($.getQuery (parameters), onSuccess);
    };

    return $;
} ();
