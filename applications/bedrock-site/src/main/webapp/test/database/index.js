"use strict";

let Html = Bedrock.Html;

let now = new Date ().getTime ();
Bedrock.Http.get ("bsc5-short.json?" + now, function (records) {
    console.log ("Database loaded.");

    // might want to condition the input here...

    // identify all the fields, and make a few adjustments
    let fieldNames = Bedrock.PagedDisplay.getAllFieldNames(records);

    // add the header to the display
    let bedrockDatabaseDisplay = document.getElementById ("bedrock-database-display");
    let headerLineElement = Html.addElement (bedrockDatabaseDisplay, "div", { id: "bedrock-header-line" });
    for (let fieldName of fieldNames) {
        let headerElement = Html.addElement (headerLineElement, "div", { class: "bedrock-header-entry" });
        let styleName = fieldName.replace (/ /g, "-").toLowerCase ();
        Html.addElement (headerElement, "div", { classes: [ styleName, "bedrock-header-entry-text" ] }).innerHTML = fieldName;
    }
    let bedrockDatabaseDisplayList = Html.addElement (bedrockDatabaseDisplay, "div", { id:"bedrock-database-display-list" });

    // build the database filter
    Bedrock.Database.Container.new ({
        database: records,
        onUpdate: function (db) {
            Bedrock.PagedDisplay.makeTable(bedrockDatabaseDisplayList, db, fieldNames);
        }
    });
});
