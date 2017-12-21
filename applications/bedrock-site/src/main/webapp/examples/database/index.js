"use strict";

let Html = Bedrock.Html;

let main = function () {
    let now = new Date ().getTime ();
    Bedrock.Http.get ("bsc5-short.json?" + now, function (records) {
        console.log ("Database loaded.");

        // build the database filter
        Bedrock.Database.Container.new ({
            database: records,
            onUpdate: function (db) {
                Bedrock.PagedDisplay.Table.new ({
                    container: "bedrock-database-display",
                    records: db,
                    onclick: function (record) {
                        let show = function (name, pre=" ") {
                            return (record[name] !== undefined) ? pre + record[name] : "";
                        };
                        document.getElementById("bedrock-record-display").innerHTML = show ("RA", "(RA: ") + show ("Dec", ", Dec: ") + ")" + show ("C") + show ("B", "-") + show ("N");
                        return true;
                    }
                }).makeTableWithHeader ();
            }
        });
    });
};
