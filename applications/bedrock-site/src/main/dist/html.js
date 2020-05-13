// Helper functions for emitting HTML from Javascript
let valid = function (value = null) {
    return (value !== null);
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

let a = function (cssClass, href, content) {
    return block ("a", { "class": cssClass, "href": href, "target": "_top" }, content);
};

Bedrock.Html = function () {
    let $ = Object.create (null);

    $.removeAllChildren = function (element) {
        while (element.firstChild) {
            element.removeChild (element.firstChild);
        }
    };

    $.makeElement = function (tag, options) {
        // check to see if tag includes a namespace url, we allow separation by semicolon
        let tagSplit = tag.split(";", 2);
        let uri = "";
        if (tagSplit.length == 2) {
            // figure out which one has a ":" in it - that's the namespace
            if (tagSplit[0].indexOf(":") > 0) {
                uri = tagSplit[0];
                tag = tagSplit[1];
            } else if (tagSplit[1].indexOf(":") > 0) {
                uri = tagSplit[1];
                tag = tagSplit[0];
            }
        }

        // create the tag and add the options, appropriately
        let element = (uri.length > 0) ? document.createElementNS(uri, tag) : document.createElement (tag);
        let optionNames = Object.keys (options);
        for (let optionName of optionNames) {
            switch (optionName) {
                case "class":
                case "classes": {
                    let cssClasses = options[optionName];
                    if (! Array.isArray (cssClasses)) {
                        cssClasses = cssClasses.split (",");
                    }
                    for (let cssClass of cssClasses) {
                        element.classList.add (cssClass);
                    }
                    break;
                }
                case "style": {
                    for (let styleName of Object.keys (options.style)) {
                        element.style[styleName] = options.style[styleName];
                    }
                    break;
                }
                case "attribute":
                case "attributes":{
                    // the .attribute form of access is preferred, but for non-standard elements, as
                    // in SVG node attributes, this is the supported method
                    let attributes = options[optionName];
                    for (let attributeName of Object.keys (attributes)) {
                        element.setAttribute (attributeName, attributes[attributeName]);
                    }
                    break;
                }
                case "event":
                case "events":{
                    // firefox and chrome handle these things differently, so this is an
                    // effort to provide common handling
                    let events = options[optionName];
                    for (let eventName of Object.keys (events)) {
                        element.addEventListener(eventName, events[eventName], false);
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

    $.addElement = function (parent, tag, options, before = null) {
        let element = $.makeElement(tag, options);
        parent.insertBefore (element, before);
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

    /**
     * Utility function to retrieve a style value from the stylesheets collection.
     * Note: this only works if the stylesheet was loaded locally or securely
     * @param selector the name of the class to fetch a style value from
     * @param style the name of the style to fetch
     * @returns {string} the found style value, or undefined
     */
    $.getCssSelectorStyle = function (selector, style) {
        for (let styleSheet of document.styleSheets) {
            try {
                if (styleSheet.cssRules !== null) {
                    for (let cssRule of styleSheet.cssRules) {
                        if (cssRule.selectorText && (cssRule.selectorText === selector)) {
                            return cssRule.style[style];
                        }
                    }
                }
            }
            catch (exception) {
                // really, just trap this since it's a security problem that chrome fixed by
                // throwing an exception
            }
        }
        return undefined;
    };

    $.Builder = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            this.parentBuilder = ("parentBuilder" in parameters) ? parameters.parentBuilder : null;
            this.elementType = parameters.elementType;
            this.elementParameters = (parameters.elementParameters !== undefined) ? parameters.elementParameters : {};
            this.builders = [];
            return this;
        };

        _.addBuilder = function (builder) {
            this.builders.push (builder);
            return this;
        };

        _.add = function (elementType, elementParameters) {
            // if this method is called as a static, this is creating a new builder
            return (Object.is (this, _)) ?
                _.new ({ elementType: elementType, elementParameters: elementParameters }).build () :
                this.addBuilder (_.new ( { parentBuilder: this, elementType: elementType, elementParameters: elementParameters }));
        };

        _.beginBuilder = function (builder) {
            this.builders.push (builder);
            return builder;
        };

        _.begin = function (elementType, elementParameters) {
            // if this method is called as a static, this is creating a new builder
            return (Object.is (this, _)) ?
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
                element.appendChild(builder.build ());
            }

            return element;
        };

        return _;
    } ();

    return $;
} ();

