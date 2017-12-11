let SimpleDatabase = function () {
    let $ = Object.create (null);

    // databases = [ "models", "clips" ];
    /**
     * load all of the requested sub-databases into one object
     * @param databaseNames {Array} names of the sub-databases to load
     * @param onReady {Function} what to do when all of the databases are loaded
     */
    $.load = function (databaseNames, onReady) {
        console.log ("loading " + databaseNames.length + " databases");

        let loadDatabase = function (database, name, onReady) {
            console.log ("loading " + name + "...");
            let request = new XMLHttpRequest ();
            request.overrideMimeType ("application/json");
            request.onload = function () {
                // parse the data
                database[name] = JSON.parse (this.responseText);
                console.log ("loaded " + name);
                onReady ();
            };
            let now = new Date ().getTime ();
            request.open ("GET", "data/" + name + ".json?" + now, true);
            request.send ();
        };

        let database = Object.create (null);
        for (let databaseName of databaseNames) {
            loadDatabase (database, databaseName, function () {
                if (Object.keys (database).length == databaseNames.length) {
                    console.log ("loading completed");
                    onReady (database);
                }
            });
        }
    };

    /**
     * match parameters or a wildcard
     * @param records
     * @param match
     * @returns {Array}
     */
    $.filter = function (records, match) {
        let filteredRecords = [];

        // only enumerate the object's own keys
        let matchKeys = Object.keys (match);
        for (let record of records) {
            let matched = true;
            for (let matchKey of matchKeys) {
                let matchValue = match[matchKey];
                matched &= (("*" == matchValue) || (record[matchKey] == matchValue));
            }

            if (matched) {
                filteredRecords.push (record);
            }
        }

        return filteredRecords;
    };

    let sortLexical = function (a, b, type, asc) {
        // start by checking for nulls, they sort to the top
        if (a == null) {
            return (b != null) ? (asc ? -1 : 1) : 0;
        }
        if (b == null) {
            return (asc ? 1 : -1);
        }

        // XXX this might need to be more sophisticated if a sort field is not a
        // XXX string or number (like... an object)
        switch (type) {
            case "number": {
                return asc ? (a - b) : (b - a);
            }
                break;
            case "string": {
                // try to sort the values as numerical if we can
                let na = Number (a);
                let nb = Number (b);
                if ((na == a.toString ()) && (nb == b.toString ())) {
                    return asc ? (na - nb) : (nb - na);
                }

                // sort case-insensitive strings with no spaces
                a = a.replace (/\s*/g, "").toLowerCase ();
                b = b.replace (/\s*/g, "").toLowerCase ();
                return asc ? a.localeCompare (b) : b.localeCompare (a);
            }
                break;
            case "timestamp": {
                let da = new Date (a).valueOf ();
                let db = new Date (b).valueOf ();
                return asc ? (da - db) : (db - da);
            }
                break;
        }

        // the items are equivalent
        return 0;
    };

    /**
     *
     * @param records
     * @param sortFieldArray
     */
    $.sort = function (records, sortFields) {
        let newRecords = records.slice ();
        newRecords.sort (function (a, b) {
            // walk over the sort fields in order
            for (let sortField of sortFields) {
                let sortResult = sortLexical (a[sortField.name], b[sortField.name], sortField.type, sortField.asc);
                if (sortResult != 0) {
                    return sortResult;
                }
            }
            return 0;
        });
        return newRecords;
    };

    return $;
} ();
