// XXX form fieldss don't validate unless they are required...

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
    _.PASSWORD = "password";
    _.SECRET = "secret";
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
                visible: true
            };

            let makeTextField = function(textType, style) {
                let value = ("value" in input) ? input.value : "";
                inputObject.inputElement = Html.addElement (parentDiv, "input", {
                    id: inputElementId,
                    type: textType,
                    class: "form-input",
                    style: (typeof (style) !== "undefined") ? style : {},
                    placeholder: input.placeholder,
                    value: value,
                    onchange: function () { onUpdate (input.name); },
                    onkeyup: function (event) { if (event.keyCode === 13) scope.handleClickSubmit (); }
                });
                // this is a value stored for reset
                inputObject.value = value;
                if ("pattern" in input) {
                    inputObject.pattern = input.pattern;
                }
            };

            // and the input element depending on the type
            let inputElementId = formName + "-" + Bedrock.Utility.randomString (8, "0123456789ABCDEF") + INPUT + input.name;
            switch (input.type) {
                case _.TEXT:
                case _.PASSWORD: {
                    makeTextField(input.type);
                    break;
                }
                case _.SECRET: {
                    makeTextField(_.TEXT, { "-webkit-text-security" : "disc"});
                    break;
                }
                case _.CHECKBOX: {
                    let checked = ("checked" in input) ? input.checked : false;
                    inputObject.inputElement = Html.addElement (parentDiv, "input", {
                        id: inputElementId,
                        type: _.CHECKBOX,
                        class: "form-input",
                        checked: checked,
                        onchange: function () { onUpdate (input.name); },
                        onkeyup: function (event) { if (event.keyCode === 13) scope.handleClickSubmit (); }
                    });
                    // this is a value stored for reset
                    inputObject.checked = checked;
                    break;
                }
                case _.SELECT: {
                    let inputElement = inputObject.inputElement = Html.addElement (parentDiv, _.SELECT, {
                        id: inputElementId,
                        class: "form-input",
                        onchange: function () { onUpdate (input.name); },
                        onkeyup: function (event) { if (event.keyCode === 13) scope.handleClickSubmit (); }
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
                        onchange: function () { onUpdate (input.name); },
                        onkeyup: function (event) { if (event.keyCode === 13) scope.handleClickSubmit (); }
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
            inputObject.errorElement = Html.addElement (formDivElement, "div", { id: (formName + "-" + Bedrock.Utility.randomString (8, "0123456789ABCDEF") + ERROR + input.name), class: "form-error", innerHTML: inputObject.required ? "REQUIRED" : "" });
        }

        // now add the submit button
        let formDivElement = Html.addElement (divElement, "div", { classes: ["form-div", "form-button-wrapper"] });
        let submitButtonTitle = ("submitButtonValue" in parameters) ? parameters.submitButtonValue : "SUBMIT";
        Html.addElement (formDivElement, "input", { type: "button", value: submitButtonTitle, class: "form-submit-button", onclick: function () { scope.handleClickSubmit (); }  });

        // and call the onUpdate the first time through
        onUpdate ("*");

        return this;
    };

    _.handleClickSubmit = function () {
        // define the error condition
        let allValid = true;

        // check if all the required inputs are set correctly
        let inputNames = Object.keys(this.inputs);
        for (let inputName of inputNames) {
            let input = this.inputs[inputName];
            if (input.required && input.visible) {
                let valid = true;
                switch (input.type) {
                    case _.TEXT:
                    case _.SECRET:
                    case _.SELECT:
                    case _.LIST: {
                        if ("pattern" in input) {
                            valid = (input.inputElement.value.match (input.pattern) !== null);
                        } else  {
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
                case _.SECRET:
                case _.SELECT:
                case _.LIST:
                    input.inputElement.value = input.value;
                    break;
            }

            // call the update on the changed value
            input.inputElement.onchange ();
        }
        return this;
    };

    _.getValues = function (addEvent, includeInvisible) {
        let result = {};
        if ((typeof (addEvent) !== "undefined") && (addEvent === true)) {
            result.event = this.name;
        }
        let keys = Object.keys (this.inputs);
        for (let key of keys) {
            let input = this.inputs[key];
            if (input.visible || ((typeof(includeInvisible) !== "undefined") && (includeInvisible === true))) {
                switch (input.type) {
                    case _.CHECKBOX:
                        result[input.name] = input.inputElement.checked;
                        break;
                    case _.TEXT:
                    case _.SECRET:
                    case _.SELECT:
                    case _.LIST:
                        if (input.inputElement.value.trim().length > 0) {
                            result[input.name] = input.inputElement.value;
                        }
                        break;
                }
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
                    case _.SECRET:
                    case _.SELECT:
                    case _.LIST:
                        input.inputElement.value = values[key];
                        break;
                }

                // call the update on the changed value
                input.inputElement.onchange ();
            }
        }
        return this;
    };

    _.showInput = function (key, show) {
        let input = this.inputs[key];
        let elementStyle = input.inputElement.parentElement.parentElement.style;

        // all elements are visible when created, so this should happen the first time through
        if ((!("display" in input)) && (elementStyle.display !== "none")) {
            input.display = elementStyle.display;
        }

        // set the state
        input.visible = show;
        elementStyle.display = show ? input.display : "none";
        return this;
    };

    _.showOnlyInputs = function (keys, show) {
        // make an object out of the keys array
        let showHide = {};
        for (let key of keys) {
            showHide[key] = 0;
        }

        // loop over all the inputs to show or hide them as requested
        for (let key in this.inputs) {
            this.showInput(key,  (key in showHide) ? show : !show);
        }
    };

    return _;
} ();

