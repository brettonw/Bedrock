Bedrock.DatabaseOperations = function () { 
    let $ = Object.create (null);
	
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
                this.regExp = new RegExp (parameters.match, 'i');
            } catch (error) {
				// replace regexp characters with escaped versions of themselves
				// XXX We might want to give the option to ignore case in the future.
                this.regExp = new RegExp (parameters.match.replace (/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"), 'i');
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
			this.operation = parameters.operation; // lt, lte, eq, gte, gt, ne
			this.type = parameters.type; // numeric, alphabetic, auto
			this.value = parameters.value;
            return this;
        };

        _.perform = function (database) {
            let result = [];

			// hoist the frequently used fields into the current context
			let field = this.field;

            // loop over all the records to see what passes
            for (let record of database) {
                if (field in record) {
					
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
			this.operation = parameters.operation; // lt, lte, eq, gte, gt
			this.type = parameters.type; // numeric, alphabetic, auto
			this.value = parameters.value;
            return this;
        };

        _.perform = function (database) {
            return database;
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
	// Or is a filter that does runs each filter in a list, and then merges the results
	// on a given field. Same as "Union" or "Unique".
	$.Sort = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
			this.field = parameters.field;
			this.type = parameters.type; // numeric, alphabetic, date, auto
			
			// allow the user to specify either ascending or descending
			this.ascending = ("ascending" in parameters) ? parameters.ascending : true; 
			this.ascending = ("descending" in parameters) ? (! parameters.descending) : this.ascending; 
            return this;
        };

        _.perform = function (database) {
            return database;
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
			this.type = parameters.type; // numeric, alphabetic, date, auto
			this.min = parameters.min;
			this.max = parameters.max;
			
			let sort = Sort.new ({ field: parameters.field, type: parameters.type });
			let min = CompareSorted.new ({ field: parameters.field, operation: "gte", type: parameters.type, value: parameters.min });
			let max = CompareSorted.new ({ field: parameters.field, operation: "lte", type: parameters.type, value: parameters.max });
			let and = And.new ({ filters: [sort, min, max] });
			
			this.filter = and;
            return this;
        };

        _.perform = function (database) {
            return and.perform (database);
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

} ();

Bedrock.Database = function () {
    let $ = Object.create (null);

    let Html = Bedrock.Html;

    // getAllFields - traverses an array of objects to produce an object that contains all
    // the field names, and all the associated values of each field
    $.getAllFields = function (database) {
        let allFields = {};
        for (let record of database) {
            let fields = Object.keys (record).sort ();
            for (let field of fields) {
                // make sure there is a field collector
                if (!(field in allFields)) {
                    allFields[field] = Object.create (null);
                }

                // put the value in, all the individual values if it's an array
                let values = record[field];
                if (values instanceof Array) {
                    for (let value of values) {
                        allFields[field][value] = value;
                    }
                } else {
                    allFields[field][values] = values;
                }
            }
        }

        // now replace each entry with a sorted array of its keys, and then save it
        let fields = Object.keys (allFields);
        for (let field of fields) {
            allFields[field] = Object.keys (allFields[field]).sort ();
        }
        return allFields;
    };

    //------------------------------------------------------------------------------------
    // Source is an interface declaration for something that returns a database
    $.Source = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (database) {
            this.database = database;
            return this;
        };

        _.getDatabase = function () {
            return this.database;
        };

        return _;
    } ();

    //------------------------------------------------------------------------------------
    // database filter element is a single part of a deep tree query, they are grouped
    // together to build complex AND-based reduction operations
    $.FilterElement = function () {
        let _ = Object.create (Bedrock.Base);

        let doFilter = function (database, filterField, filterValue, shouldMatch) {
            let result = [];

            // initialize the not value if it wasn't passed
            shouldMatch = (typeof shouldMatch !== "undefined") ? shouldMatch : true;

            // if the search key is not specified, this is a pass-through filter, just return
            // what we started with
            if (filterField.length === 0) {
                return database;
            }

            // the individual filter function... we assume the user doesn't intend this to
            // be a regexp if it fails to compile
            let regExp;
            try {
                regExp = new RegExp (filterValue, 'i');
            } catch (error) {
                regExp = new RegExp (filterValue.replace (/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"), 'i')
            }
            let matchValue = function (value) {
                let matchResult = value.toString().match (regExp);
                return ((matchResult != null) === shouldMatch);
            };

            // otherwise, loop over all the records to see what passes
            for (let record of database) {
                // only pass records that contain the search key
                let match = (filterField in record);
                if (match === true) {
                    // get the value from the record, it might be a value, or an array of
                    // values, so we have to check and handle accordingly
                    let values = record[filterField];
                    if (values instanceof Array) {
                        let anyMatches = false;
                        for (let value of values) {
                            anyMatches = anyMatches || matchValue (value);
                        }
                        match = match && anyMatches;
                    } else {
                        match = match && matchValue (values);
                    }
                }

                // if we match, store the record into the result
                if (match === true) {
                    result.push (record);
                }
            }

            // return the result
            return result;
        };

        const FILTER_ELEMENT_FIELD = "filter-element-field";
        const FILTER_ELEMENT_VALUE = "filter-element-value";

        _.init = function (parameters) {
            // scope this so I can use it in closures
            let scope = this;

            let index = this.index = parameters.index;
            this.databaseSource = parameters.databaseSource;
            this.owner = parameters.owner;
            let filterField = parameters.initialValue.field;
            let filterValue = parameters.initialValue.value;
            let fieldKeys = parameters.fieldKeys;

            // create the element container
            this.elementContainer = Html.addElement (parameters.div, "div", { class: "bedrock-database-element-container", id: "filterElementContainer" + index });

            // create the select and editing elements inside the container
            this.countDiv = Html.addElement (this.elementContainer, "div", { class: "bedrock-database-element-text-div" });
            //this.fieldComboBox = addComboBoxElement (this.elementContainer, FILTER_ELEMENT_FIELD + index, fieldKeys, filterField, "FILTER FIELD");

            let fieldComboBox = this.fieldComboBox = Bedrock.ComboBox.new ({
                style: { width: "100%" },
                parentElementId: this.elementContainer.id,
                placeholder: "(FILTER FIELD)",
                inputElementId: FILTER_ELEMENT_FIELD + index,
                options: fieldKeys,
                value: filterField,
                onchange: function () {
                    scope.valueComboBox.value = "";
                    scope.update ();
                }
            });


            let database = this.databaseSource.getDatabase ();
            let allFields = $.getAllFields (database);
            //this.valueElement = addComboBoxElement(this.elementContainer, FILTER_ELEMENT_VALUE + index, (filterField in allFields) ? allFields[filterField] : [], filterValue, "FILTER VALUE");

            let valueComboBox = this.valueComboBox = Bedrock.ComboBox.new ({
                style: { width: "100%" },
                parentElementId: this.elementContainer.id,
                placeholder: "(FILTER VALUE)",
                inputElementId: FILTER_ELEMENT_VALUE + index,
                options: (filterField in allFields) ? allFields[filterField] : [],
                value: filterValue,
                onchange: function () {
                    scope.finishUpdate ();
                }
            });

            this.filteredDatabase = doFilter (database, filterField, filterValue, true);
            this.countDiv.innerHTML = this.filteredDatabase.length + "/" + database.length;

            return this;
        };

        _.update = function () {
            // rebuild the value options
            let database = this.databaseSource.getDatabase ();
            let allFields = $.getAllFields (database);
            this.valueComboBox.setOptions ((this.fieldComboBox.value in allFields) ? allFields[this.fieldComboBox.value] : []);

            this.finishUpdate ();
        };

        _.finishUpdate = function () {
            let database = this.databaseSource.getDatabase ();
            this.filteredDatabase = doFilter (database, this.fieldComboBox.value, this.valueComboBox.value, true);
            this.countDiv.innerHTML = this.filteredDatabase.length + "/" + database.length;
            this.owner.push (this.index);
        };

        _.onValueChange = function (updatedControl) {
            this.update ();
        };

        _.getDatabase = function () {
            return this.filteredDatabase;
        };

        _.setFieldValue = function (filterField, filterValue) {
            // set the filter field value
            this.fieldComboBox.value = filterField;

            // rebuild the value select
            let database = this.databaseSource.getDatabase ();
            let allFields = $.getAllFields (database);
            this.valueComboBox
                .setOptions ((this.fieldComboBox.value in allFields) ? allFields[this.fieldComboBox.value] : [])
                .value = filterValue;
        };

        return _;
    } ();

    //------------------------------------------------------------------------------------
    $.SortElement = function () {
        let _ = Object.create (Bedrock.Base);

        let makeControls = function (index, field, type, asc, fieldKeys) {
            let innerHTML =
                div ("bedrock-element-div", makeSelectHTML ("sortElementSelectKey" + index, fieldKeys, field, "SORT FIELD")) +
                div ("bedrock-element-div", makeSelectHTML ("sortElementSelectType" + index, ["AUTO", "NUMERIC", "ALPHABETIC", "DATE"], type, "SORT TYPE")) +
                div ("bedrock-element-div", makeSelectHTML ("sortElementSelectAsc" + index, ["ASCENDING", "DESCENDING"], asc, "SORT ASC"));
            return innerHTML;
        };

        _.init = function (parameters) {
            this.index = parameters.index;
            this.owner = parameters.owner;
            this.sortField = parameters.sortField;
            this.sortType = parameters.sortType;
            this.sortAsc = parameters.sortAsc;

            // create the select and editing elements inside the supplied div id
            document.getElementById ("sortElementContainer" + parameters.index).innerHTML = makeControls (parameters.index, this.sortField, this.sortType, this.sortAsc, parameters.fieldKeys);

            return this;
        };


        return _;
    } ();

    //------------------------------------------------------------------------------------
    $.Filter = function () {
        let _ = Object.create (Bedrock.Base);

        let conditionValues = function (values, elementCount) {
            values = (typeof values !== "undefined") ? values : [];
            for (let i = values.length; i < elementCount; ++i) {
                values.push ({});
            }
            for (let value of values) {
                value.field = ("field" in value) ? value.field : "";
                value.value = ("value" in value) ? value.value : "";
            }
            return values;
        };

        _.init = function (parameters) {
            this.databaseSource = parameters.databaseSource;
            this.elementCount = parameters.elementCount;
            this.owner = parameters.owner;
            this.fieldKeys = parameters.fieldKeys;
            this.initialValues = conditionValues (parameters.initialValues, parameters.elementCount);
            return this.reset ();
        };

        _.finish = function () {
            // hide unused filter elements and call out to the parent
            let filters = this.filters;
            let length = filters.length;
            let index = length - 1;

            // this was the last one, reverse up the list looking for the last full filter
            while ((filters[index].fieldComboBox.value.length == 0) && (index > 0)) {
                --index;
            }
            if (filters[index].fieldComboBox.value.length > 0) {
                ++index;
            }
            if (index < length) {
                filters[index].elementContainer.style.display = "inline-block";
                while (++index < length) {
                    filters[index].elementContainer.style.display = "none";
                }
            }

            // and finally call the outbound push
            this.owner.push (this.getDatabase ());
        };

        _.push = function (index) {
            let filters = this.filters;
            let length = filters.length;
            if ((index + 1) < length) {
                filters[index + 1].update ();
            } else {
                // notify the receiver we've finished updating
                this.finish ();
            }
            return this;
        };

        _.update = function () {
            return this.push (-1);
        };

        _.onValueChange = function (updatedControl) {
            let index = updatedControl.id.match (/\d+$/)[0];
            this.filters[index].onValueChange (updatedControl);
        };

        _.getDatabase = function () {
            return this.filters[this.filters.length - 1].getDatabase ();
        };

        _.setValues = function (values) {
            let elementCount = this.elementCount;
            let filters = this.filters;
            values = conditionValues (values, elementCount);
            for (let i = 0; i < elementCount; ++i) {
                filters[i].setFieldValue (values[i].field, values[i].value);
            }
            return this.update ();
        };

        _.reset = function () {
            // scope this so I can use it in closures
            let scope = this;

            // get the filter container and clean it out
            let filterContainer = document.getElementById ("filterContainer");
            while (filterContainer.firstChild) {
                filterContainer.removeChild (filterContainer.firstChild);
            }

            // now create the filter elements
            this.filters = [];
            for (let index = 0; index < this.elementCount; ++index) {
                this.filters.push ($.FilterElement.new ({
                    div: filterContainer,
                    index: index,
                    fieldKeys: this.fieldKeys,
                    initialValue: this.initialValues[index],
                    databaseSource: (index > 0) ? this.filters[index - 1] : this.databaseSource,
                    owner: this
                }));
            }

            // drop in the clear button
            let clearButtonElementContainer = Html.addElement (filterContainer, "div", { class: "bedrock-database-element-container" });
            Html.addElement (clearButtonElementContainer, "div", { class: "bedrock-database-element-text-div" });
            Html.addElement (clearButtonElementContainer, "button", {
                class: "bedrock-database-clear-button", onclick: function () {
                    scope.reset ();
                }
            }).innerHTML = "CLEAR";

            // and notify the receiver that we've finished setting up
            this.finish ();

            return this;
        };

        return _;
    } ();

    //------------------------------------------------------------------------------------
    $.Sort = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            this.elementCount = parameters.elementCount;
            this.owner = parameters.owner;
            this.fieldKeys = parameters.fieldKeys;

            // create the select and editing elements
            let sortContainerHTML = "";
            for (let index = 0; index < this.elementCount; ++index) {
                sortContainerHTML += block ("div", { class: "bedrock-database-element-container", id: "sortElementContainer" + index }, "");
            }

            // drop in the clear button
            sortContainerHTML +=
                div ("bedrock-database-element-container",
                    div ("bedrock-database-element-text-div", "") +
                    div ("bedrock-element-div",
                        block ("button", { class: "bedrockClearButton", type: "button", onclick: "theBedrock.sort.reset ();" }, "CLEAR")
                    )
                );

            document.getElementById ("sortContainer").innerHTML = sortContainerHTML;

            this.sorts = [];
            for (let index = 0; index < this.elementCount; ++index) {
                this.sorts.push ($.SortElement.new ({
                    index: index,
                    fieldKeys: this.fieldKeys,
                    owner: this,
                    sortField: "",
                    sortType: "",
                    sortAsc: ""
                }));
            }

            return this;
        };

        return _;
    } ();

    $.Container = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            this.databaseSource = $.Source.new (parameters.database);
            this.fieldKeys = Object.keys ($.getAllFields (parameters.database)).sort ();
            this.onUpdate = parameters.onUpdate;

            // get the top level container
            let bedrockContainerId = ("div" in parameters) ? parameters.div : "bedrock-database-container";
            let bedrockContainer = document.getElementById (bedrockContainerId);
            Html.addElement (bedrockContainer, "div", { class: "bedrock-database-group-container", id: "filterContainer" });
            Html.addElement (bedrockContainer, "div", { class: "bedrock-database-group-container", id: "sortContainer" });

            // create the filter
            this.filter = $.Filter.new ({
                databaseSource: this.databaseSource,
                fieldKeys: this.fieldKeys,
                owner: this,
                elementCount: (typeof parameters.filterElementCount !== "undefined") ? parameters.filterElementCount : 4,
                initialValues: parameters.filterValues
            });
/*
            // create the sort control
            this.sort = $.Sort.new ({
                databaseSource: this.databaseSource,
                fieldKeys: this.fieldKeys,
                owner: this,
                elementCount: (typeof parameters.sortElementCount !== "undefined") ? parameters.sortElementCount : 2,
                initialValues: parameters.sortValues,
            });
            */

            return this;
        };

        _.push = function (db) {
            // do the sort

            // pass the result on to the update handler
            this.onUpdate (db);
        };

        return _;
    } ();

    return $;
} ();

