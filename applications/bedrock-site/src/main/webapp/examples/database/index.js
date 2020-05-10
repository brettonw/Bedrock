"use strict";

let Html = Bedrock.Html;

let main = function () {
    let now = new Date ().getTime ();
    Bedrock.Http.get ("bsc5-short.json?" + now, function (records) {
        console.log ("Database loaded.");

        // sort the records as an example
        let CF = Bedrock.CompareFunctions;
        records = Bedrock.DatabaseOperations.Sort.new ({ fields:[
                { name:"C", ascending:true, type: CF.ALPHABETIC },
                { name:"B", ascending:true, type: CF.ALPHABETIC },
                { name:"RA", ascending:true, type: CF.ALPHABETIC },
                { name:"Dec", ascending:true, type: CF.ALPHABETIC }
            ] }).perform (records);

        // build the database filter
        Bedrock.Database.Container.new ({
            database: records,
            filterValues: [{ field: "C" }],
            onUpdate: function (db) {
                Bedrock.PagedDisplay.Table.new ({
                    container: "bedrock-database-display",
                    records: db,
                    select: [
                        { name: "HR", displayName: "ID", width: 0.05 },
                        { name: "RA", width: 0.1 },
                        { name: "Dec", width: 0.1 },
                        { name: "C", displayName: "Con", width: 0.05 },
                        { name: "B", displayName: "Bay", width: 0.05 },
                        { name: "F", displayName: "Flam", width: 0.05 },
                        { name: "V", displayName: "Mag", width: 0.05 },
                        { name: "K", displayName: "Temp", width: 0.05 },
                        { name: "N", displayName: "Name", width: 0.40 }
                    ],
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
