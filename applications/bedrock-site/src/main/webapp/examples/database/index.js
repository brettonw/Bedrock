"use strict";

let Html = Bedrock.Html;

let now = new Date ().getTime ();
Bedrock.Http.get ("bsc5-short.json?" + now, function (records) {
    console.log ("Database loaded.");

    // might want to condition the input here...
    let allFieldNames = Bedrock.PagedDisplay.getAllFieldNames(records);

    // build the database filter
    Bedrock.Database.Container.new ({
        database: records,
        onUpdate: function (db) {
            Bedrock.PagedDisplay.makeTableWithHeader(document.getElementById ("bedrock-database-display"), db, allFieldNames);
        }
    });
});
