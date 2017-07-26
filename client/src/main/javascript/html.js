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

