"use strict;"

let Bedrock = Object.create (null);
Bedrock.LogLevel = function () {
    let _ = Object.create (null);

    _.TRACE = 0;
    _.INFO = 1;
    _.WARNNG = 2;
    _.ERROR = 3;

    // default
    let logLevel = _.ERROR;

    _.set = function (newLogLevel) {
        logLevel = newLogLevel;
    };

    let formatStrings = ["TRC", "INF", "WRN", "ERR"];
    _.say = function (messageLogLevel, message) {
        if (messageLogLevel >= logLevel) {
            console.log (formatStrings[messageLogLevel] + ": " + message)
        }
    };

    return _;
} ();
Bedrock.LogLevel.set (Bedrock.LogLevel.INFO);
Bedrock.Base = function () {
    let _ = Object.create (null);

    _.new = function (parameters) {
        // TODO could add some validation here...

        return Object.create (this).init (parameters);
    };

    return _;
} ();
Bedrock.Utility = function () {
    let _ = Object.create (null);

    _.copyIf = function (key, leftObject, rightObject) {
        if (key in leftObject) rightObject[key] = leftObject[key];
    };

    return _;
} ();
Bedrock.Http = function () {
    let $ = Object.create (null);

    $.get = function (queryString, onSuccess) {
        let request = new XMLHttpRequest ();
        request.overrideMimeType ("application/json");
        request.open ("GET", queryString, true);
        request.onload = function (event) {
            if (request.status === 200) {
                let response = JSON.parse (this.responseText);
                onSuccess (response);
            }
        };
        request.send ();
    };

    return $;
} ();
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
// Helper functions for emitting HTML from Javascript
let valid = function (value) {
    return (typeof (value) !== "undefined") && (value !== null);
};

let block = function (block, attributes, content) {
    let result = "<" + block;
    if (valid (attributes)) {
        let attributeNames = Object.keys (attributes);
        for (let attributeName of attributeNames) {
            if (valid (attributes[attributeName])) {
                result += " " + attributeName + "=\"" + attributes[attributeName] + "\"";
            }
        }
    }
    return result + (valid (content) ? (">" + content + "</" + block + ">") : ("/>"));
};

let div = function (cssClass, content) {
    return block ("div", { "class": cssClass }, content);
};

Bedrock.Html = function () {
    let $ = Object.create (null);

    $.removeAllChildren = function (element) {
        while (element.firstChild) {
            element.removeChild (element.firstChild);
        }
    };

    $.makeElement = function (tag, options) {
        let element = document.createElement (tag);
        let optionNames = Object.keys (options);
        for (let optionName of optionNames) {
            switch (optionName) {
                case "class": {
                    element.classList.add (options.class);
                    break;
                }
                case "classes": {
                    for (let cssClass of options.classes) {
                        element.classList.add (cssClass);
                    }
                    break;
                }
                case "style": {
                    for (let style of Object.keys (options.style)) {
                        element.style[style] = options.style[style];
                    }
                    break;
                }
                default: {
                    element[optionName] = options[optionName];
                    break;
                }
            }
        }
        return element;
    };

    $.addElement = function (parent, tag, options, before) {
        let element = $.makeElement(tag, options);
        parent.insertBefore (element, (typeof before !== "undefined") ? before : null);
        return element;
    };

    /**
     * Utility function to tell if an element is in view in the scrolling region of a container
     * @param element
     * @param view
     * @returns {boolean}
     */
    $.elementIsInView = function (element, view) {
        let viewTop = view.scrollTop;
        let viewBottom = view.offsetHeight + viewTop;
        let elementTop = element.offsetTop;
        let elementBottom = elementTop + element.offsetHeight;
        return ((elementBottom <= viewBottom) && (elementTop >= viewTop));
    };

    $.Builder = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            this.parentBuilder = ("parentBuilder" in parameters) ? parameters.parentBuilder : null;
            this.elementType = parameters.elementType;
            this.elementParameters = parameters.elementParameters;
            this.builders = [];
            return this;
        };

        _.addBuilder = function (builder) {
            this.builders.push (builder);
            return this;
        };

        _.add = function (elementType, elementParameters) {
            // if this method is called as a static, this is creating a new builder
            return (this === _) ?
                _.new ({ elementType: elementType, elementParameters: elementParameters }).build () :
                this.addBuilder (_.new ( { parentBuilder: this, elementType: elementType, elementParameters: elementParameters }));
        };

        _.beginBuilder = function (builder) {
            this.builders.push (builder);
            return builder;
        };

        _.begin = function (elementType, elementParameters) {
            // if this method is called as a static, this is creating a new builder
            return (this === _) ?
                _.new ({ elementType: elementType, elementParameters: elementParameters }) :
                this.beginBuilder (_.new ({ parentBuilder: this, elementType: elementType, elementParameters: elementParameters }));
        };

        _.end = function () {
            return (this.parentBuilder !== null) ? this.parentBuilder : this.build ();
        };

        _.build = function () {
            // create my element
            let element = $.makeElement (this.elementType, this.elementParameters);

            // walk down the builders, building in turn
            for (let builder of this.builders) {
                element.appendChild(builder.build ())
            }

            return element;
        };

        return _;
    } ();

    return $;
} ();

Bedrock.ComboBox = function () {
    let _ = Object.create(Bedrock.Base);

    let Html = Bedrock.Html;

    let indexById = {};

    _.getById = function (inputElementId) {
        return indexById[inputElementId];
    };

    _.init = function (parameters) {
        // input element id is required
        if ("inputElementId" in parameters) {
            // scope "this" as self so I can use it in closures
            let self = this;

            // if the user starts pressing keys to navigate the options list, then we don't
            // want to automagically incur mouseover events while the list scrolls. This flag
            // is used to tell the options not to highlight from mouseover events when the
            // reason for the event is a keypress
            this.allowMouseover = true;

            // set up the option for regexp in matching, default is false
            this.useRegExp = ("useRegExp" in parameters) ? parameters.useRegExp : false;

            // we will need the parentElement, this is a placeholder for it
            let inputElement, parentElement;

            // the user must specify an inputElementId, or inputElement that we can get the
            // inputElementId from
            let inputElementId = ("inputElementId" in parameters) ? parameters.inputElementId :
                ("inputElement" in parameters) ? parameters.inputElement.id : null;
            if (inputElementId != null) {
                // we know we have an id, now try to get the inputElement
                inputElement = ("inputElement" in parameters) ? parameters.inputElement : document.getElementById (inputElementId);
                if (inputElement == null) {
                    // have to create the inputElement, the user must specify a
                    // parentElementId, or parentElement that we can get the
                    // parentElementId from
                    let parentElementId = ("parentElementId" in parameters) ? parameters.parentElementId :
                        ("parentElement" in parameters) ? parameters.parentElement.id : null;
                    if (parentElementId != null) {
                        // get the parent element
                        parentElement = ("parentElement" in parameters) ? parameters.parentElement : document.getElementById (parentElementId);

                        // setup the creation parameters for the input element
                        let inputElementParameters = {
                            classes: ["combobox-input"],
                            id: inputElementId,
                            placeholder: inputElementId, // a reasonable default
                            type: "text"
                        };

                        // depending on whether there is "class" in the parameters
                        if ("class" in parameters) {
                            inputElementParameters.classes.push (parameters.class);
                        }

                        // copy a few optional values if they are present
                        Bedrock.copyIf ("placeholder", parameters, inputElementParameters);
                        Bedrock.copyIf ("style", parameters, inputElementParameters);
                        Bedrock.copyIf ("onchange", parameters, inputElementParameters);

                        // now create the input element
                        inputElement = Html.addElement (parentElement, "input", inputElementParameters);
                    } else {
                        // fatal error, don't know where to create the input
                        console.log ("ERROR: expected 'parentElementId' or 'parentElement'.");
                        return null;
                    }
                } else {
                    // the inputElement was found, let's retrieve its parent
                    parentElement = inputElement.parentNode;
                }
            } else {
                // fatal error, no id was supplied, and none was findable
                console.log ("ERROR: expected 'inputElementId' or 'inputElement'.");
                return null;
            }

            // now store the results so we can work with them, and set the value
            this.inputElement = inputElement;
            if ("value" in parameters) {
                this.inputElement.value = parameters.value
            }

            // put a pseudo-parent down so the popup will always be under the input, but not
            // in the document flow, and create our options container inside that - the pseudo-
            // parent has position relative with sizes of 0, and the child is placed with
            // absolute position under that. See the CSS file for details.
            let pseudoParentElement = Html.addElement (parentElement, "div", { class: "combobox-pseudo-parent" }, inputElement.nextSibling);
            let optionsElement = this.optionsElement = Html.addElement (pseudoParentElement, "div", { id: inputElementId + "-options", class: "combobox-options" });

            // set the options
            this.setOptions (parameters.options);

            // subscribe to various events on the input element to do our thing
            {
                // capture the mousedown, and if it's on the far right of the input element,
                // clear the text before proceeding
                inputElement.onmousedown = function (event) {
                    let x = (event.pageX - this.offsetLeft) / this.offsetWidth;
                    let arrowPlacement = (this.offsetWidth - parseFloat (getComputedStyle (this).backgroundSize)) / this.offsetWidth;
                    if (x > arrowPlacement) {
                        inputElement.value = "";

                        // if the element is already focused, we need to update the options
                        if (this === document.activeElement) {
                            self.updateOptions ();
                        }
                        self.callOnChange ();
                    }
                    //console.log (this.id + " - mousedown (" + x + "/" + arrowPlacement + ")");
                };

                // capture some keys (up/down, for instance)
                inputElement.onkeydown = function (event) {
                    switch (event.key) {
                        case "ArrowUp": {
                            if (self.currentOption != null) {
                                self.currentOption.classList.remove ("combobox-option-hover");
                                if (self.currentOption.previousSibling != null) {
                                    self.currentOption = self.currentOption.previousSibling;
                                } else {
                                    self.currentOption = optionsElement.lastChild;
                                }
                            } else {
                                self.currentOption = optionsElement.lastChild;
                            }
                            self.currentOption.classList.add ("combobox-option-hover");

                            // if the newly selected current option is not visible, set the scroll
                            // pos to make it visible, and tell the options not to respond to
                            // mouseover events until the mouse moves
                            if (!Html.elementIsInView (self.currentOption, optionsElement)) {
                                self.allowMouseover = false;
                                optionsElement.scrollTop = self.currentOption.offsetTop;
                            }
                            break;
                        }
                        case "ArrowDown": {
                            if (self.currentOption != null) {
                                self.currentOption.classList.remove ("combobox-option-hover");
                                if (self.currentOption.nextSibling != null) {
                                    self.currentOption = self.currentOption.nextSibling;
                                } else {
                                    self.currentOption = optionsElement.firstChild;
                                }
                            } else {
                                self.currentOption = optionsElement.firstChild;
                            }
                            self.currentOption.classList.add ("combobox-option-hover");

                            // if the newly selected current option is not visible, set the scroll
                            // pos to make it visible, and tell the options not to respond to
                            // mouseover events until the mouse moves
                            if (!Html.elementIsInView (self.currentOption, optionsElement)) {
                                self.allowMouseover = false;
                                optionsElement.scrollTop = (self.currentOption.offsetTop - optionsElement.offsetHeight) + self.currentOption.offsetHeight;
                            }
                            break;
                        }
                        case "Enter": {
                            if (self.currentOption != null) {
                                inputElement.value = self.currentOption.getAttribute ("data-value");
                            }
                            self.callOnChange ();
                            inputElement.blur ();
                            break;
                        }
                        case "Escape": {
                            inputElement.blur ();
                            break;
                        }
                        default:
                            return true;
                    }
                    return false;
                };

                // in case the user changes by pasting, does this not fire oninput?
                inputElement.onpaste = function () {
                    this.oninput ();
                };

                // oninput fires immediately when the value changes
                inputElement.oninput = function () {
                    self.updateOptions ();
                    self.callOnChange ();
                };

                // when the control gains focus (in this order: onmousedown, focus, click)
                inputElement.onfocus = function (event) {
                    //console.log (this.id + " - focus");
                    self.updateOptions ();
                    optionsElement.scrollTop = 0;
                    optionsElement.style.display = "block";
                };

                // when the user moves away from the control
                inputElement.onblur = function () {
                    //console.log (this.id + " - blur");
                    self.optionsElement.style.display = "none";
                };
            }
        } else {
            // error out
            console.log ("ERROR: 'inputElementId' is required.");
            return null;
        }

        return this;
    };

    _.callOnChange = function () {
        if (("onchange" in this.inputElement) && (typeof this.inputElement.onchange === "function")) {
            this.inputElement.onchange ();
        }
    };

    _.updateOptions = function () {
        // scope "this" as self so I can use it in closures
        let self = this;

        // there should be no currently selected option
        self.currentOption = null;

        // get the elements
        let inputElement = this.inputElement;
        let optionsElement = this.optionsElement;

        // clear out the options (fragment, should be one op)
        while (optionsElement.firstChild) {
            optionsElement.removeChild (optionsElement.firstChild);
        }

        // try doing this on a document fragment to prevent lots of dom updates
        let fragment = document.createDocumentFragment();

        // get the current value as a regex object for rapid matching
        let inputElementValue = this.useRegExp ? this.inputElement.value : this.inputElement.value.replace (/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
        let regExp = new RegExp (inputElementValue, 'i');

        // take the inputElement value and use it to filter the list
        for (let option of this.options) {
            if (option.matchTarget.match (regExp)) {
                let comboBoxOption = Html.addElement (fragment, "div", {
                    class: "combobox-option",
                    onmousedown: function () {
                        inputElement.value = option.value;
                        self.callOnChange();
                        return true;
                    },
                    onmouseover: function () {
                        //console.log ("onmouseover (" + ((self.allowMouseover === true) ? "YES" : "NO") + ")");
                        if (self.allowMouseover === true) {
                            if (self.currentOption != null) {
                                self.currentOption.classList.remove ("combobox-option-hover");
                            }
                            self.currentOption = this;
                            this.classList.add ("combobox-option-hover");
                        }
                        self.allowMouseover = true;
                    },
                    onmouseout: function () {
                        //console.log ("onmouseout (" + ((self.allowMouseover === true) ? "YES" : "NO") + ")");
                        if (self.allowMouseover === true) {
                            this.classList.remove ("combobox-option-hover");
                        }
                    }
                });
                comboBoxOption.setAttribute("data-value", option.value);

                // cap the display at 32 chars
                let display = (option.value.length > 32) ? (option.value.substr(0, 30) + "...") : option.value;

                //comboBoxOption.innerHTML = ("label" in option) ? option.label : option.value;
                if ("label" in option) {
                    Html.addElement (comboBoxOption, "div", { style: { float: "left" }}).innerHTML = display;
                    Html.addElement (comboBoxOption, "div", { class: "combobox-option-label" }).innerHTML = option.label;
                } else {
                    comboBoxOption.innerHTML = display;
                }
            }
        }

        // add the fragment to the options element
        optionsElement.appendChild(fragment);

        return this;
    };

    _.setOptions = function (options) {
        this.options = options;
        // get the list of options from the parameters, convert it to the expected format:
        // { value: "v", label: "m", alt:"xxx" }, and we create { value: "v", label: "m", matchTarget: "v, m, xxx" }
        let conditionedOptions = this.options = [];
        for (let option of options) {
            if (option === Object (option)) {
                let conditionedOption = { value: option.value, matchTarget: option.value };
                if ("label" in option) {
                    conditionedOption.label = option.label;
                    conditionedOption.matchTarget += ", " + option.label;
                }
                if ("alt" in option) {
                    conditionedOption.matchTarget += ", " + option.alt;
                }
                conditionedOptions.push (conditionedOption);
            } else {
                conditionedOptions.push ({ value: option, matchTarget: option });
            }
        }

        // and start with the current option set to null
        this.currentOption = null;

        return this;
    };

    // properties, to allow the combobox object to be used as a drop-in replacement for an
    // input element
    // "value" property
    Object.defineProperty (_, "value", {
        get: function () {
            return this.inputElement.value;
        },
        set: function (value) {
            this.inputElement.value = value;
        }
    });

    Object.defineProperty (_, "onchange", {
        set: function (onchange) {
            this.inputElement.onchange = onchange;
        }
    });

    return _;
} ();
Bedrock.Forms = function () {
    let _ = Object.create (Bedrock.Base);

    // import a few things
    let Html = Bedrock.Html;

    // strings used internally
    const INPUT = "-input-";
    const ERROR = "-error-";

    // strings for input types
    _.LIST = "list";
    _.SELECT = "select";
    _.TEXT = "text";
    _.CHECKBOX = "checkbox";

    _.init = function (parameters) {
        // scope "this" as self so I can use it in closures
        let scope = this;

        // parameters.name - name of the form (and the event to use when submitting)
        let formName = this.name = parameters.name;

        // parameters.completion - function to call when the user clicks submit and all the
        //                     input values pass validation
        this.completion = parameters.completion;

        // parameters.onupdate - function to call when any value changes in the form
        let onUpdate = function (updatedName) {
            if ("onUpdate" in parameters) {
                parameters.onUpdate (updatedName, scope);
            }
        };

        // parameters.div - where to put the form
        let divElement = document.getElementById(parameters.div);
        divElement = Html.addElement(divElement, "div", { class : "form-container" });

        // parameters.inputs - array of input names, with prompt, type, default value, template, and required flag
        // input = { name: "nm", type: "text|checkbox|select", label: "blah", required: true, (...values appropriate for input type...) }
        let inputs = this.inputs = {};
        for (let input of parameters.inputs) {
            // create the div and set the title
            let formDivElement = Html.addElement (divElement, "div", { class: "form-div" });
            Html.addElement (formDivElement, "div", { class: "form-title-div", innerHTML: input.label });
            let parentDiv = Html.addElement (formDivElement, "div", { class: "form-input-div"});

            // now add the actual input
            let inputObject = inputs[input.name] = {
                name: input.name,
                type: input.type,
                required: ("required" in input) ? input.required : false,
            };

            // and the input element depending on the type
            let inputElementId = formName + INPUT + input.name;
            switch (input.type) {
                case _.TEXT: {
                    let value = ("value" in input) ? input.value : "";
                    inputObject.inputElement = Html.addElement (parentDiv, "input", {
                        id: inputElementId,
                        type: _.TEXT,
                        class: "form-input",
                        placeholder: input.placeholder,
                        value: value,
                        onchange: function () { onUpdate (input.name); }
                    });
                    // this is a value stored for reset
                    inputObject.value = value;
                    if ("pattern" in input) {
                        inputObject.pattern = input.pattern;
                    }
                    break;
                }
                case _.CHECKBOX: {
                    let checked = ("checked" in input) ? input.checked : false;
                    inputObject.inputElement = Html.addElement (parentDiv, "input", {
                        id: inputElementId,
                        type: _.CHECKBOX,
                        class: "form-input",
                        checked: checked,
                        onchange: function () { onUpdate (input.name); }
                    });
                    // this is a value stored for reset
                    inputObject.checked = checked;
                    break;
                }
                case _.SELECT: {
                    let inputElement = inputObject.inputElement = Html.addElement (parentDiv, _.SELECT, {
                        id: inputElementId,
                        class: "form-input",
                        onchange: function () { onUpdate (input.name); }
                    });
                    for (let option of input.options) {
                        let value = (option === Object (option)) ? option.value : option;
                        let label = ((option === Object (option)) && ("label" in option)) ? option.label : value;
                        Html.addElement (inputElement, "option", { value: value, innerHTML: label });
                    }
                    let value = ("value" in input) ? input.value : inputObject.inputElement.value;
                    inputObject.inputElement.value = inputObject.value = value;
                    break;
                }
                case _.LIST: {
                    let value = ("value" in input) ? input.value : "";

                    inputObject.inputElement = Bedrock.ComboBox.new ({
                        class: "form-input",
                        parentElement: parentDiv,
                        placeholder: input.placeholder,
                        inputElementId: inputElementId,
                        options: input.options,
                        value: value,
                        onchange: function () { onUpdate (input.name); }
                    });

                    // this is a value stored for reset
                    inputObject.value = value;

                    if ("pattern" in input) {
                        inputObject.pattern = input.pattern;
                    }
                    break;
                }
            }

            // and now add the error element
            inputObject.errorElement = Html.addElement (formDivElement, "div", { id: (formName + ERROR + input.name), class: "form-error", innerHTML: inputObject.required ? "REQUIRED" : "" });
        }

        // now add the submit button
        let formDivElement = Html.addElement (divElement, "div", { classes: ["form-div", "form-button-wrapper"] });
        Html.addElement (formDivElement, "input", { type: "button", value: "SUBMIT", class: "form-submit-button", onclick: function () { scope.handleClickSubmit (); } });

        return this;
    };

    _.handleClickSubmit = function () {
        // define the error condition
        let allValid = true;

        // check if all the required inputs are set correctly
        let inputNames = Object.keys(this.inputs);
        for (let inputName of inputNames) {
            let input = this.inputs[inputName];
            if (input.required) {
                let valid = true;
                switch (input.type) {
                    case _.TEXT:
                    case _.SELECT:
                    case _.LIST: {
                        if ("pattern" in input) {
                            valid = (input.inputElement.value.match (input.pattern) !== null);
                        } else {
                            valid = (input.inputElement.value.length > 0);
                        }
                        break;
                    }
                    case _.CHECKBOX: {
                        valid = input.inputElement.checked;
                        break;
                    }
                }
                input.errorElement.style.visibility = valid ? "hidden" : "visible";
                allValid = allValid && valid;
            }
        }

        // call completion if everything passes
        if (allValid === true) {
            this.completion (this);
        }
    };

    _.reset = function () {
        let inputNames = Object.keys (this.inputs);
        for (let inputName of inputNames) {
            let input = this.inputs[inputName];
            switch (input.type) {
                case _.CHECKBOX:
                    input.inputElement.checked = input.checked;
                    break;
                case _.TEXT:
                case _.SELECT:
                case _.LIST:
                    input.inputElement.value = input.value;
                    break;
            }
        }
    };

    _.getValues = function () {
        let result = {
            event: this.name
        };
        let keys = Object.keys (this.inputs);
        for (let key of keys) {
            let input = this.inputs[key];
            switch (input.type) {
                case _.CHECKBOX:
                    result[input.name] = input.inputElement.checked;
                    break;
                case _.TEXT:
                case _.SELECT:
                case _.LIST:
                    result[input.name] = input.inputElement.value;
                    break;
            }
        }
        return result;
    };

    _.setValues = function (values) {
        let keys = Object.keys (this.inputs);
        for (let key of keys) {
            if (key in values) {
                let input = this.inputs[key];
                switch (input.type) {
                    case _.CHECKBOX:
                        input.inputElement.checked = values[key];
                        break;
                    case _.TEXT:
                    case _.SELECT:
                    case _.LIST:
                        input.inputElement.value = values[key];
                        break;
                }
            }
        }
    };


    return _;
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

Bedrock.TestContainer = function () {
    let _ = Object.create (null);

    // test design philosophy is to be verbose on failure, and silent on pass
    let assertEquals = function (msg, a, b) {
        a = (!isNaN (a)) ? Utility.fixNum (a) : a;
        b = (!isNaN (b)) ? Utility.fixNum (b) : b;
        if (a != b) {
            Bedrock.LogLevel.say (Bedrock.LogLevel.ERROR, "(FAIL ASSERTION) " + msg + " (" + a + " == " + b + ")");
            return false;
        }
        return true;
    };

    let assertArrayEquals = function (msg, a, b) {
        if (a.length == b.length) {
            for (let i = 0; i < a.length; ++i) {
                if (!assertEquals(msg + "[" + i + "]", a[i], b[i])) {
                    return false;
                }
            }
            return true;
        } else {
            Bedrock.LogLevel.say (Bedrock.LogLevel.ERROR, msg + " (mismatched arrays, FAIL ASSERTION)");
            return false;
        }
    };

    let tests = [
        function () {
            Bedrock.LogLevel.say (Bedrock.LogLevel.letINFO, "Test...");
            assertEquals("One", 1, 1);
            assertEquals("Two", 2.0, 2.0);
        },
        function () {
            Bedrock.LogLevel.say (Bedrock.LogLevel.letINFO, "Test...");
            assertEquals ("One", 1, 1);
            assertEquals ("Two", 2.0, 2.0);
        }
    ];

    _.runTests = function () {
        Bedrock.LogLevel.say (Bedrock.LogLevel.INFO, "Running Tests...");
        for (let test of tests) {
            test ();
        }
        Bedrock.LogLevel.say (Bedrock.LogLevel.INFO, "Finished Running Tests.");
    };

    return _;
} ();

Bedrock.TestContainer.runTests();
