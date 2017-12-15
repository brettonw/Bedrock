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

        let doFilter = function (database, filterField, filterValue, shouldMatch = true) {
            let result = [];

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

        let conditionValues = function (values = [], elementCount = 0) {
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
                elementCount: (parameters.filterElementCount !== undefined) ? parameters.filterElementCount : 4,
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

