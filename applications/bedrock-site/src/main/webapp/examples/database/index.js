"use strict";

let Html = Bedrock.Html;

let now = new Date ().getTime ();
Bedrock.Http.get ("bsc5-short.json?" + now, function (records) {
    console.log ("Database loaded.");

    // build the database filter
    Bedrock.Database.Container.new ({
        database: records,
        onUpdate: function (db) {
            Bedrock.PagedDisplay.Table.new ({
                container: "bedrock-database-display",
                records: db
            }).makeTableWithHeader();
        }
    });
});
