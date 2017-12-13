Bedrock.DatabaseOperations = function () {
    let $ = Object.create (null);

    // "using"
    let CompareFunctions = Bedrock.CompareFunctions;
    let maskFunction = CompareFunctions.mask;

    //------------------------------------------------------------------------------------
    // Filter is an interface specification for something that takes an array of objects
    // (AKA a database) as input, and returns a new database. Typical operations performed
    // by filters are "select" and "sort". More complex operations are accomplished by
    // hierarchical combinations of these basic filters. Filters do their work lazily,
    // when the user calls the "perform" method. The default filter implementation is a
    // passthrough for a "source".
    $.Filter = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            return this;
        };

        _.perform = function (database) {
            return database;
        };

        return _;
    } ();

    //------------------------------------------------------------------------------------
    // Match is a filter that does a linear time walk over the rows of the database and
    // checks every record to see if the requested field matches a given pattern. The
    // result can be inverted to flip the sense of the match operation.
    $.Match = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            this.field = parameters.field;

            // initialize the shouldMatch property
            let invert = "invert" in parameters ? parameters.invert : false;
            this.shouldMatch = ! parameters.invert;

            // compile the match paramter... we assume the user doesn't intend this to be
            // a regular expression if it fails to compile.
            try {
                this.regExp = new RegExp (parameters.match, "i");
            } catch (error) {
                // replace regexp characters with escaped versions of themselves
                // XXX We might want to give the option to ignore case in the future.
                this.regExp = new RegExp (parameters.match.replace (/[\-\[\]{}()*+?.,\\\^$\|#\s]/g, "\\$&"), "i");
            }

            return this;
        };

        _.perform = function (database) {
            let result = [];

            // hoist the frequently used fields into the current context
            let field = this.field;
            let regExp = this.regExp;
            let shouldMatch = this.shouldMatch;

            // create the individual filter function...
            let matchValue = function (value) {
                let matchResult = value.toString().match (regExp);
                return ((matchResult != null) === true);
            };

            // loop over all the records to see what passes
            for (let record of database) {
                // only pass records that contain the search field
                let match = (field in record);
                if (match === true) {
                    // get the value from the record, it might be a value, or an array of
                    // values, so we have to check and handle accordingly
                    let values = record[field];
                    if (values instanceof Array) {
                        match = false;
                        for (let value of values) {
                            match = match || matchValue (value);
                        }
                    } else {
                        match = matchValue (values);
                    }
                }

                // if we match, store the record into the result
                if (match === shouldMatch) {
                    result.push (record);
                }
            }

            // return the result
            return result;
        };

        return _;
    } ();

    //------------------------------------------------------------------------------------
    // Compare is a filter that does a linear time walk over the rows of the database and
    // checks every record to see if the requested field compares favorably to a given
    // value.
    $.Compare = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            this.field = parameters.field;
            this.operationMask = CompareFunctions.operationMask (("operation" in parameters) ? parameters.operation : "=");
            this.compareFunction = CompareFunctions.get (("type" in parameters) ? parameters.type : "auto");
            this.value = parameters.value;
            return this;
        };

        _.perform = function (database) {
            let result = [];

            // hoist the frequently used parameters into the current context
            let field = this.field;
            let operationMask = this.operationMask;
            let compareFunction = this.compareFunction;
            let value = this.value;

            // loop over all the records to see what passes
            for (let record of database) {
                if (field in record) {
                    let compareResult = compareFunction (record[field], value);
                    let maskedCompareResult = mask (compareResult);
                    if ((maskedCompareResult & operationMask) != 0) {
                        result.push (record);
                    }
                }
            }

            // return the result
            return result;
        };

        return _;
    } ();

    //------------------------------------------------------------------------------------
    // CompareSorted is a filter that does a log (n) time traversal of a database sorted
    // on the requested field, to find where the given value divides the sorted list.
    // NOTE: the database must already be sorted when it comes in.
    $.CompareSorted = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            this.field = parameters.field;
            this.operationMask = CompareFunctions.operationMask (("operation" in parameters) ? parameters.operation : "=");
            this.compareFunction = CompareFunctions.get (("type" in parameters) ? parameters.type : "auto");
            this.value = parameters.value;
            return this;
        };

        _.perform = function (database) {
            // hoist the frequently used parameters into the current context
            let field = this.field;
            let operationMask = this.operationMask;
            let compareFunction = this.compareFunction;
            let value = this.value;
            let end = database.length;


            // find the lower bound of the search region
            let findLowerBound = function (low, high) {
                while (low <= high) {
                    let mid = (low + high) >>> 1;
                    let cmp = (mid < end) ? compareFunction (database[mid][field], value, true) : 1;
                    if (cmp < 0) {
                        low = mid + 1;
                    } else {
                        high = mid - 1;
                    }
                }
                return low;
            };

            // find the upper bound of the search region
            let findUpperBound = function (low, high) {
                while (low <= high) {
                    let mid = (low + high) >>> 1;
                    let cmp = (mid < end) ? compareFunction (database[mid][field], value, true) : 1;
                    if (cmp <= 0) {
                        low = mid + 1;
                    } else {
                        high = mid - 1;
                    }
                }
                return low;
            };

            // find where the comparison points are, then decide how to slice the result
            let upperBound;
            switch (operationMask) {
                case 0b0001: // <
                    // take from 0 to lower bound
                    return database.slice (0, findLowerBound (0, end));
                case 0b0011: // <=
                    // take from 0 to upper bound
                    return database.slice (0, findUpperBound (0, end));
                case 0b0010: // =
                    // take from lower bound to upper bound
                    upperBound = findUpperBound (0, end);
                    return database.slice (findLowerBound (0, upperBound), upperBound);
                case 0b0110: // >=
                    // take from lower bound to end
                    return database.slice (findLowerBound (0, end));
                case 0b0100: // >
                    // take from upper bound to end
                    return database.slice (findUpperBound (0, end));
                case 0b0101: // <>
                    // take from 0 to lower bound, and upper bound to end
                    upperBound = findUpperBound (0, end);
                    return database.slice (0, findLowerBound (0, upperBound)).concat (database.slice (upperBound));
            }

            // return the result
            return result;
        };

        return _;
    } ();

    //------------------------------------------------------------------------------------
    // And is a filter that runs each filter in a list in turn. Same as "Intersect".
    $.And = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            this.filters = parameters.filters;
            return this;
        };

        _.perform = function (database) {
            for (let filter of this.filters) {
                database = filter.perform (database);
            }
            return database;
        };

        return _;
    } ();

    //------------------------------------------------------------------------------------
    // Or is a filter that runs each filter in a list, and then merges the results on a
    // given field. Same as "Union" or "Unique". NOTE, this assumes the given field is a
    // unique identifier for each record, like an "identity".
    $.Or = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            this.filters = parameters.filters;
            this.field = parameters.field;
            return this;
        };

        _.perform = function (database) {
            let resultKey = {};
            let result = [];

            // hoist frequently used variables to the current context
            let field = this.field;

            // loop over all of the filters
            for (let filter of this.filters) {
                let filteredDatabase = filter.perform (database);
                for (let record of filteredDatabase) {
                    // only store records that have the requested field
                    if (field in record) {
                        // and now, only store this record in the result if it's not
                        // already in there...
                        let key = record[field];
                        if (!(key in resultKey)) {
                            resultKey[key] = key;
                            result.push (record);

                            // XXX I wonder if there is an optimization to be made by
                            // XXX removing the found record from the source database, so
                            // XXX we don't bother to filter it through the next one in
                            // XXX the list
                        }
                    }
                }
            }

            return result;
        };

        return _;
    } ();

    //------------------------------------------------------------------------------------
    // Sort is a filter that sorts the database according to its parameters.
    $.Sort = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            this.recordComparable = Bedrock.Comparable.RecordComparable.new (parameters);
            return this;
        };

        _.perform = function (database) {
            let newDatabase = database.slice ();
            let that = this;
            newDatabase.sort (function (recordA, recordB) {
                return that.recordComparable.compare (recordA, recordB);
            });
            return newDatabase;
        };

        return _;
    } ();

    //------------------------------------------------------------------------------------
    // Range is a filter that composes a Sort and two CompareSorted filters into an AND
    // filter.
    $.Range = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            this.field = parameters.field;
            this.type = parameters.type; // numeric, alphabetic, chronologic, auto
            this.min = parameters.min;
            this.max = parameters.max;

            let sort = $.Sort.new ({ fields: [ { name: parameters.field, type: parameters.type }] });
            let min = $.CompareSorted.new ({ field: parameters.field, operation: "gte", type: parameters.type, value: parameters.min });
            let max = $.CompareSorted.new ({ field: parameters.field, operation: "lte", type: parameters.type, value: parameters.max });
            let and = $.And.new ({ filters: [sort, min, max] });

            this.filter = and;
            return this;
        };

        _.perform = function (database) {
            return this.filter.perform (database);
        };

        return _;
    } ();

    //------------------------------------------------------------------------------------
    // Select is a reduction filter that performs a linear time walk over the records of
    // the database and selects only the requested fields for the new database.
    $.Select = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            return this;
        };

        _.perform = function (database) {
            return database;
        };

        return _;
    } ();

    return $;
} ();
