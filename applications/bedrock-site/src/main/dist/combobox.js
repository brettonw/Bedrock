Bedrock.ComboBox = function () {
    let _ = Object.create(Bedrock.Base);

    let Html = Bedrock.Html;
    let PagedDisplay = Bedrock.PagedDisplay;
    let Style = PagedDisplay.Style;
    let EntryType = PagedDisplay.EntryType;
    let Utility = Bedrock.Utility;

    const defaultStyles = Object.create (null);
    defaultStyles[Style.TABLE] = "bedrock-combobox-paged-display-table";
    defaultStyles[Style.TABLE_ROW] = "bedrock-combobox-paged-display-table-row";
    defaultStyles[Style.TABLE_ROW_ENTRY] = "bedrock-combobox-paged-display-table-row-entry";
    defaultStyles[Style.TABLE_ROW_ENTRY_TEXT] = "bedrock-combobox-paged-display-table-row-entry-text";
    defaultStyles[Style.ODD] = "bedrock-combobox-paged-display-odd";
    defaultStyles[Style.HOVER] = "bedrock-combobox-paged-display-hover";

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

            // if there are styles, copy them in...
            this.styles = Object.create (defaultStyles);
            if (parameters.styles !== undefined) {
                for (let style of Object.keys (defaultStyles)) {
                    if (parameters.styles[style] !== undefined) {
                        this.styles[style] = parameters.styles[style];
                    }
                }
            }

            // we will need the parentElement, this is a placeholder for it
            let inputElement, parentElement;

            // the user must specify an inputElementId, or inputElement that we can get the
            // inputElementId from
            // XXX NOTE TODO - this is obviated by the code 20 lines before
            let inputElementId = ("inputElementId" in parameters) ? parameters.inputElementId :
                ("inputElement" in parameters) ? parameters.inputElement.id : null;
            if (inputElementId !== null) {
                // we know we have an id, now try to get the inputElement
                inputElement = ("inputElement" in parameters) ? parameters.inputElement : document.getElementById (inputElementId);
                if (inputElement === null) {
                    // have to create the inputElement, the user must specify a
                    // parentElementId, or parentElement that we can get the
                    // parentElementId from
                    let parentElementId = ("parentElementId" in parameters) ? parameters.parentElementId :
                        ("parentElement" in parameters) ? parameters.parentElement.id : null;
                    if (parentElementId !== null) {
                        // get the parent element
                        parentElement = ("parentElement" in parameters) ? parameters.parentElement : document.getElementById (parentElementId);

                        // setup the creation parameters for the input element
                        let inputElementParameters = {
                            classes: ["combobox-input"],
                            id: inputElementId,
                            placeholder: inputElementId, // a reasonable default
                            type: "text",
                            autocomplete: "off"
                        };

                        // depending on whether there is "class" in the parameters
                        if ("class" in parameters) {
                            inputElementParameters.classes.push (parameters.class);
                        }

                        // copy a few optional values if they are present
                        Utility.copyIf ("placeholder", parameters, inputElementParameters);
                        Utility.copyIf ("style", parameters, inputElementParameters);
                        Utility.copyIf ("onchange", parameters, inputElementParameters);
                        Utility.copyIf ("event", parameters, inputElementParameters);
                        Utility.copyIf ("events", parameters, inputElementParameters);

                        // now create the input element
                        inputElement = Html.addElement (parentElement, "input", inputElementParameters);
                    } else {
                        // fatal error, don't know where to create the input
                        LOG (ERROR, "expected 'parentElementId' or 'parentElement'.");
                        return null;
                    }
                } else {
                    // the inputElement was found, let's retrieve its parent
                    parentElement = inputElement.parentNode;
                }
            } else {
                // fatal error, no id was supplied, and none was findable
                LOG (ERROR, "ERROR: expected 'inputElementId' or 'inputElement'.");
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
                            self.optionsTable.goPrev();
                            break;
                        }
                        case "ArrowDown": {
                            self.optionsTable.goNext();
                            break;
                        }
                        case "Enter": {
                            self.optionsTable.select();
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
            LOG (ERROR, "ERROR: 'inputElementId' is required.");
            return null;
        }

        return this;
    };

    _.callOnChange = function () {
        if (("onchange" in this.inputElement) && (typeof this.inputElement.onchange === "function")) {
            this.inputElement.onchange ();
        } else {
            this.inputElement.dispatchEvent (new Event ("change"));
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
        Html.removeAllChildren(optionsElement);

        // get the current value as a regex object for rapid matching - note that
        // if we don't want regexp, all regexp characters must be escaped
        let inputElementValue = this.useRegExp ? this.inputElement.value : this.inputElement.value.replace (/[\-\[\]\{\}\(\)\*\+\?\.,\\\^\$\|#\s]/g, "\\$&");
        let regExp = new RegExp (inputElementValue, 'i');

        // take the inputElement value and use it to filter the list
        let optionList = [];
        for (let option of this.options) {
            if (option.matchTarget.match (regExp)) {
                optionList.push ({
                    "value": option.value,
                    "display": (option.value.length > 32) ? (option.value.substr (0, 30) + "...") : option.value,
                    "label": option.label
                });
            }
        }

        // now create the paged display
        this.optionsTable = PagedDisplay.Table.new ({
            container: optionsElement,
            records: optionList,
            select: [
                { name: "display", type: PagedDisplay.EntryType.LEFT_JUSTIFY, class: "combobox-option" },
                { name: "label", type: PagedDisplay.EntryType.RIGHT_JUSTIFY, class: "combobox-option-label" }
            ],
            styles: this.styles,
            onclick: function (record) {
                inputElement.value = record.value;
                self.callOnChange();
                return true;
            }
        }).makeTable ();

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

    // onchange...
    Object.defineProperty (_, "onchange", {
        set: function (onchange) {
            this.inputElement.onchange = onchange;
        }
    });

    // dispatchEvent
    // XXX this probably needs a little more thought
    _.dispatchEvent = function (event) {
        this.inputElement.dispatchEvent(event);
    };

    return _;
} ();
