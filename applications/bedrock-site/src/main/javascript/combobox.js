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
