"use strict";

let Bedrock = Object.create (null);
Bedrock.version = "1.6.2";
Bedrock.Enum = {
    create: function () {
        let _ = Object.create (null);

        // function to create an enumerated object
        let make = function (name, value) {
            //console.log ("enumerate '" + name + "' = " + value);
            let enumeratedValue = Object.create (_);
            Object.defineProperty(enumeratedValue, "name", { value: name });
            Object.defineProperty(enumeratedValue, "value", { value: value });
            return enumeratedValue;
        };

        // create the enumerated values, which are Objects of this type already populated
        let names = [].slice.call (arguments);
        let enumeratedValues = [];
        for (let name of names) {
            let enumeratedValue = make (name, enumeratedValues.length);
            enumeratedValues.push(enumeratedValue);
            Object.defineProperty (_, name, { value: enumeratedValue, enumerable: true });
        }

        // save the names and values independently
        Object.defineProperty (_, "names", { value: names });
        Object.defineProperty (_, "values", { value: enumeratedValues });

        // the toString property so that we can implicitly treat this thing as a string
        Object.defineProperty (_, "toString", { value: function () { return this.name; } });

        return _;
    }
};
Bedrock.LogLevel = function () {
    let _ = Bedrock.Enum.create ("TRACE", "INFO", "WARNING", "ERROR");

    // default
    let logLevel = _.ERROR;

    _.set = function (newLogLevel) {
        logLevel = newLogLevel;
    };

    let formatStrings = ["TRC", "INF", "WRN", "ERR"];
    _.say = function (messageLogLevel, message) {
        if (messageLogLevel >= logLevel) {
            console.log (formatStrings[messageLogLevel.value] + ": " + message)
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
        if (key in leftObject) {
            rightObject[key] = leftObject[key];
        }
    };

    _.randomString = function (length, chars) {
        let result = "";
        for (let i = 0; i < length; ++i) {
            result += chars[Math.floor (Math.random () * chars.length)];
        }
        return result;
    };

    _.defaultTrue = function (value) {
        return ((typeof (value) === "undefined") || (value !== false));
    };

    _.defaultFalse = function (value) {
        return ((typeof (value) !== "undefined") && (value !== false));
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

    $.post = function (queryString, postData, onSuccess) {
        let request = new XMLHttpRequest ();
        request.overrideMimeType ("application/json");
        request.open ("POST", queryString, true);
        request.onload = function (event) {
            if (request.status === 200) {
                let response = JSON.parse (this.responseText);
                onSuccess (response);
            }
        };
        request.send (postData);
    };

    return $;
} ();
Bedrock.Cookie = function () {
    let $ = Object.create (null);

    $.set = function (name, value, expireDays = 30) {
        let date = new Date ();
        date.setTime (date.getTime () + (expireDays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + date.toUTCString ();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    };

    $.get = function (name) {
        let find = name + "=";
        let decodedCookie = decodeURIComponent (document.cookie);
        let cookieArray = decodedCookie.split (";");
        for (let cookie of cookieArray) {
            let index = cookie.indexOf (find);
            if (index >= 0) {
                return cookie.substring (index + find.length);
            }
        }
        return "";
    };

    $.remove = function (name) {
        this.set (name, "", -1);
    };

    $.replace = function (name, value, expireDays) {
        this.set (name, "", -1);
        this.set (name, value, expireDays);
    };

    $.resetAll = function () {
        let decodedCookie = decodeURIComponent (document.cookie);
        let cookieArray = decodedCookie.split (";");
        for (let cookie of cookieArray) {
            let name = cookie.split ("=")[0];
            name = name.replace (/^\s*/, "");
            name = name.replace (/\s*$/, "");
            this.set (name, "", -1);
        }
    };

    return $;
} ();

Bedrock.ServiceBase = function () {
    let $ = Object.create (null);

    $.getQuery = function (parameters) {
        let contextPath = Bedrock.Cookie.get ("full-context-path");
        let query = contextPath + "api";
        let divider = "?";
        for (let name of Object.keys (parameters)) {
            let parameter = parameters[name];
            query += divider + name + "=" + parameter;
            divider = "&"
        }
        return query;
    };

    $.getFromQuery = function (query, onSuccess, onFailure) {
        Bedrock.Http.get (query, function (response) {
            Bedrock.LogLevel.say (Bedrock.LogLevel.INFO, query + " (status: " + response.status + ")");
            if (response.status === "ok") {
                onSuccess (("response" in response) ? response.response : response.status);
            } else if (typeof (onFailure) !== "undefined") {
                onFailure (response.error);
            } else {
                // default on failure, alert...
                alert (response.error);
            }
        });
    };

    $.get = function (parameters, onSuccess, onFailure) {
        $.getFromQuery ($.getQuery (parameters), onSuccess, onFailure);
    };

    $.postFromQuery = function (query, postData, onSuccess, onFailure) {
        Bedrock.Http.post (query, postData, function (response) {
            Bedrock.LogLevel.say (Bedrock.LogLevel.INFO, query + " (status: " + response.status + ")");
            if (response.status === "ok") {
                onSuccess (("response" in response) ? response.response : response.status);
            } else if (typeof (onFailure) !== "undefined") {
                onFailure (response.error);
            } else {
                // default on failure, alert...
                alert (response.error);
            }
        });
    };

    $.post = function (parameters, postData, onSuccess, onFailure) {
        $.postFromQuery ($.getQuery (parameters), postData, onSuccess, onFailure);
    };

    return $;
} ();
Bedrock.ServiceDescriptor = function () {
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

    $.tryExample = function (exampleName) {
        // show the result
        let hoverBoxRoot = document.getElementById ("bedrock-service-descriptor-hover-box");
        let hoverBoxBufferElement = document.getElementById ("bedrock-service-descriptor-hover-box-buffer");
        let Html = Bedrock.Html;
        Html.removeAllChildren(hoverBoxBufferElement);
        hoverBoxRoot.style.visibility = "visible";
        event.stopPropagation();

        Bedrock.ServiceBase.get ({ event : "help" }, function (response) {
            // get the example and explicitly set the event in it (it's typically omitted for simplicity in the configurations)
            let example = response.events[exampleName].example;
            example.event = exampleName;

            let url;
            let postData = null;

            let handleExampleResponse = function (exampleResponse) {
                let innerHTML = Html.Builder.begin ("div");
                innerHTML.add("h2", { style: { margin: 0 }, innerHTML: "Example for " + exampleName });
                if (postData != null) {
                    innerHTML
                        .begin ("div", { style: { margin: "16px 0" }})
                        .add ("div", { style: { fontWeight: "bold", display: "inline-block", width: "80px" }, innerHTML: "URL: " })
                        .add ("div", { style: { display: "inline-block" }, innerHTML: url.replace (/&/g, "&amp;") })
                        .end ()
                        .add ("div", { style: { margin: "16px 0 8px 0", fontWeight: "bold" }, innerHTML: "Post JSON: " })
                        .add ("pre", { class: "code-pre", innerHTML: postData })
                } else {
                    innerHTML
                        .begin ("div", { style: { margin: "16px 0" }})
                        .add ("div", { style: { fontWeight: "bold", display: "inline-block", width: "80px" }, innerHTML: "URL: " })
                        .add ("a", { style: { display: "inline-block", textDecoration: "none" }, innerHTML: url.replace (/&/g, "&amp;"), href: url, target: "_blank" })
                        .end ();
                }
                innerHTML
                    .add ("div", { style: { margin: "16px 0 8px 0", fontWeight: "bold" }, innerHTML: "Response JSON: " })
                    .add ("pre", { class: "code-pre", innerHTML: JSON.stringify (exampleResponse, null, 4) })

                hoverBoxBufferElement.appendChild(innerHTML.end ());
            };

            // if the example includes post data...
            if ("post-data" in example) {
                // separate the post data and issue the example request as a post
                postData = JSON.stringify (example["post-data"], null, 4);
                delete example["post-data"];
                url = Bedrock.ServiceBase.getQuery (example);
                Bedrock.Http.post (url, postData, handleExampleResponse);
            } else {
                // issue the example request as a get
                url = Bedrock.ServiceBase.getQuery (example);
                Bedrock.Http.get(url, handleExampleResponse);
            }
        }, function (error) {
            hoverBoxBufferElement.appendChild (Html.Builder.begin ("div", { innerHTML: "ERROR: " + error}).end ());
        });
    };

    $.displaySpecification = function (specification) {
        // start with an empty build
        let innerHTML = "";

        if ("description" in specification) {
            innerHTML += block ("h2", {}, "Description") + div ("description-div", specification.description);
        }

        if ("events" in specification) {
            innerHTML += block ("h2", {}, "Events");
            let events = specification.events;
            let eventNames = Object.keys (events);
            let eventsHTML = "";
            for (let eventName of eventNames) {
                let event = events[eventName];

                // events are assumed to be published, but if they have a p"published: false"
                // attribute, we will skip it
                if (! (("published" in event) && ((event.published === false) || (event.published === "false")))) {

                    let eventHTML = "";

                    // if there is an example
                    if ("example" in event) {
                        eventHTML = block ("div", { class: "try-it", onclick: 'Bedrock.ServiceDescriptor.tryExample (&quot;' + eventName + '&quot;);' }, "[example]");
                    }
                    eventHTML = div ("event-name", eventName + eventHTML);

                    // if there is a description
                    if ("description" in event) {
                        eventHTML += div ("event-description", event.description);
                    }

                    let odd;
                    let evenOddTitle = function (title) {
                        odd = true;
                        eventHTML += div ("even-odd-title", title);
                        return odd;
                    };

                    let evenOdd = function (title, object) {
                        odd = true;
                        let names = Object.keys (object);
                        if (names.length > 0) {
                            eventHTML += div ("even-odd-title", title);
                            for (let name of names) {
                                let element = object[name];
                                let required = ("required" in element) ? ((element.required === true) || (element.required === "true")) : false;
                                eventHTML += div ("even-odd-div" + (odd ? " odd" : ""),
                                    div ("even-odd-name", name) +
                                    div ("even-odd-required", required ? "REQUIRED" : "OPTIONAL") +
                                    div ("even-odd-description", element.description));
                                odd = !odd;
                            }
                        }
                        return odd;
                    };

                    let listParameters = function (title, object) {
                        // parameters
                        if ("parameters" in object) {
                            evenOdd (title, object.parameters);
                        }

                        if (("strict" in object) && ((object.strict === false) || (object.strict === "false"))) {
                            if (!("parameters" in object)) {
                                evenOddTitle (title);
                            }
                            eventHTML += div ("even-odd-div" + (odd ? " odd" : ""),
                                div ("even-odd-name", "(any)") +
                                div ("even-odd-required", "OPTIONAL") +
                                div ("even-odd-description", "Event allows unspecified parameters."));
                        }
                    };

                    // parameters
                    listParameters ("Parameters:", event);

                    // post-data
                    if (("parameters" in event) && ("post-data" in event.parameters)) {
                        listParameters ("Post Data:", event.parameters["post-data"]);
                    }

                    // response
                    if ("response" in event) {
                        let response = event.response;
                        // return specification might be an array, indicating this event returns an
                        // array of something
                        if (Array.isArray (response)) {
                            // return specification might be an empty array, or an array with a single
                            // proto object
                            if (response.length > 0) {
                                evenOdd ("Response (Array):", response[0]);
                            } else {
                                evenOddTitle ("Response (Array):");
                                eventHTML += div ("even-odd-div" + (odd ? " odd" : ""),
                                    div ("even-odd-name", "(any)") +
                                    div ("even-odd-required", "OPTIONAL") +
                                    div ("even-odd-description", "Unspecified."));
                            }
                        } else {
                            evenOdd ("Response:", response);
                        }
                    }

                    eventsHTML += div ("event-div", eventHTML);
                }
            }
            innerHTML += div("events-div", eventsHTML);
        }

        if ("name" in specification) {
            document.title = specification.name;
            innerHTML = block ("h1", {}, specification.name) + div("container-div", innerHTML);
        }
        innerHTML += div ("content-center footer", "Built with " + a ("footer-link", "http://bedrock.brettonw.com", "Bedrock"));

        // now add a floating pane that is invisible and install the click handler to hide it
        innerHTML +=
            block ("div", { id: "bedrock-service-descriptor-hover-box" },
                block ("div", {id: "bedrock-service-descriptor-hover-box-buffer"},"")
            );
        document.addEventListener('click', function(event) {
            let hoverBoxElement = document.getElementById ("bedrock-service-descriptor-hover-box");
            if (!hoverBoxElement.contains(event.target)) {
                hoverBoxElement.style.visibility = "hidden";
            }
        });

        return innerHTML;
    };

    // a little black raincloud, of course
    $.display = function (displayInDivId) {
        Bedrock.ServiceBase.get ({event: "help"}, function (response) {
            response = (response.response !== undefined) ? response.response : response;
            document.getElementById(displayInDivId).innerHTML = Bedrock.ServiceDescriptor.displaySpecification (response);
        });
    };

    // convert the names into camel-case names (dashes are removed and the following character is uppercased)
    let makeName = function (input) {
        return input.replace (/-([^-])/g, function replacer (match, p1, offset, string) {
            return p1.toUpperCase();
        });
    };

    $.translateResponse = function (response) {
        // internal function to copy the object as a response
        let copyAsResponse = function (object) {
            let copy = {};
            let keys = Object.keys (object);
            for (let key of keys) {
                copy[makeName(key)] = object[key];
            }
            return copy;
        };

        // make a decision based on the type
        if (Array.isArray(response)) {
            let copy = [];
            for (let entry of response) {
                copy.push (copyAsResponse(entry));
            }
            return copy;
        } else {
            return copyAsResponse(response);
        }
    };

    // create a client side object with all of the api's
    $.api = function (onSuccess, baseUrl = "", apiSource = "") {
        // condition the inputs
        baseUrl = (baseUrl === "") ? location.href.substr(0,location.href.lastIndexOf("/")) : baseUrl;
        baseUrl = baseUrl.replace (/\/$/g, "");

        // get the api
        const API_EVENT_HELP = "api?event=help";
        let url = (apiSource === "") ? (baseUrl + "/" + API_EVENT_HELP) : apiSource;
        $.get (url, function (response) {
            // if we retrieved the api.json from the service base, get the actual response
            response = (response.response !== undefined) ? response.response : response;

            // start with an empty build
            let api = Object.create (null);
            api.specification = response;

            // check that we got a response with events
            if ("events" in response) {
                let events = response.events;
                let eventNames = Object.keys (events);
                for (let eventName of eventNames) {
                    let event = events[eventName];

                    // set up the function name and an empty parameter list
                    let functionName = makeName (eventName);
                    let functionParameters = "(";
                    let functionBody = '    let url = "' + baseUrl + '/api?event=' + eventName + '";\n';

                    // if there are parameters, add them
                    let first = true;
                    if ("parameters" in event) {
                        let names = Object.keys (event.parameters);
                        if (names.length > 0) {
                            for (let name of names) {
                                let parameterName = makeName (name);
                                functionParameters += ((first !== true) ? ", " : "") + parameterName;
                                functionBody += '    url += "' + name + '=" + ' + parameterName + ';\n';
                                first = false;
                            }
                        }
                    }
                    functionParameters += ((first !== true) ? ", " : "") + "onSuccess";
                    functionBody += '    Bedrock.ServiceDescriptor.get (url, function (response) {\n';
                    functionBody += '        if (response.status === "ok") {\n';
                    functionBody += '            response = Bedrock.ServiceDescriptor.translateResponse (response.response);\n';
                    functionBody += '            onSuccess (response);\n';
                    functionBody += '        }\n';
                    functionBody += '    });\n';
                    functionParameters += ")";

                    Bedrock.LogLevel.say (Bedrock.LogLevel.INFO, functionName + " " + functionParameters + ";\n");

                    let functionString = "return function " + functionParameters + " {\n" +functionBody + "};\n";
                    api[functionName] = new Function (functionString) ();
                }
            }

            // call the completion routine
            onSuccess (api);
        });
    };

    return $;
} ();
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

Bedrock.PagedDisplay = function () {
    let $ = Object.create (null);

    // using
    let Html = Bedrock.Html;
    let Enum = Bedrock.Enum;

    /*
    $.Select = function () {
        let _ = Object.create(Bedrock.Base);

        _.init = function (parameters) {
            this.name = parameters.name;
        };

        return _;
    };
    */

    // 2 - encapsulate

    // 3 - dynamically compute the column widths

    // 3.5 - allow columns to be individually styled, including column widths

    // 4 - user selectable style classes based on input parameters

    let getAllFieldNames = $.getAllFieldNames = function (records) {
        let fields = Object.create (null);
        for (let record of records) {
            let keys = Object.keys (record);
            for (let key of keys) {
                fields[key] = key;
            }
        }
        return Object.keys (fields).sort ();
    };

    // entry types
    const EntryType = $.EntryType = Enum.create (
        "LEFT_JUSTIFY", // left-justified
        "CENTER_JUSTIFY", // centered
        "RIGHT_JUSTIFY", // right-justified
        "IMAGE" // a url for an image (center justified)
    );

    // style names and the default style names object
    const Style = $.Style = Enum.create (
        "HEADER",
        "HEADER_ROW",
        "HEADER_ENTRY",
        "HEADER_ENTRY_TEXT",
        "TABLE",
        "TABLE_ROW",
        "TABLE_ROW_ENTRY",
        "TABLE_ROW_ENTRY_TEXT",
        "ODD",
        "HOVER"
    );

    const defaultStyles = Object.create (null);
    defaultStyles[Style.HEADER] = "bedrock-paged-display-header";
    defaultStyles[Style.HEADER_ROW] = "bedrock-paged-display-header-row";
    defaultStyles[Style.HEADER_ENTRY] = "bedrock-paged-display-header-entry";
    defaultStyles[Style.HEADER_ENTRY_TEXT] = "bedrock-paged-display-header-entry-text";
    defaultStyles[Style.TABLE] = "bedrock-paged-display-table";
    defaultStyles[Style.TABLE_ROW] = "bedrock-paged-display-table-row";
    defaultStyles[Style.TABLE_ROW_ENTRY] = "bedrock-paged-display-table-row-entry";
    defaultStyles[Style.TABLE_ROW_ENTRY_TEXT] = "bedrock-paged-display-table-row-entry-text";
    defaultStyles[Style.ODD] = "bedrock-paged-display-odd";
    defaultStyles[Style.HOVER] = "bedrock-paged-display-hover";
    defaultStyles[EntryType.LEFT_JUSTIFY] = "bedrock-paged-display-entry-left-justify";
    defaultStyles[EntryType.CENTER_JUSTIFY] = "bedrock-paged-display-entry-center-justify";
    defaultStyles[EntryType.RIGHT_JUSTIFY] = "bedrock-paged-display-entry-right-justify";
    defaultStyles[EntryType.IMAGE] = "bedrock-paged-display-entry-image";

    $.Table = function () {
        let _ = Object.create (Bedrock.Base);

        _.init = function (parameters) {
            const records = this.records = parameters.records;

            // save the container that is passed in - it could be an element or
            // a valid elementId, which we reduce to an element (can get its id
            // from it at any time thereafter if we need it)
            if (parameters.container !== undefined) {
                const container = this.container = (typeof (parameters.container) === "string") ? document.getElementById (parameters.container) : parameters.container;
                if ((container.tagName.toLowerCase () === "div") && (container.id !== undefined)) {

                    // "select" should be an array of objects specifying the name
                    // of the field, its display name, and its type (in desired
                    // display order) - the user either supplies all columns, or
                    // none
                    let select;
                    if (parameters.select === undefined) {
                        select = this.select = [];
                        for (let selectName of getAllFieldNames (records)) {
                            select.push ({ name: selectName });
                        }
                    } else {
                        select = this.select = parameters.select;
                    }

                    // validate the entry names and the types
                    for (let entry of select) {
                        if (entry.displayName === undefined) {
                            entry.displayName = entry.name;
                        }
                        if ((entry.type === undefined) || (EntryType[entry.type] === undefined)) {
                            entry.type = EntryType.CENTER_JUSTIFY;
                        }
                        if (entry.width === undefined) {
                            entry.width = 1.0 / select.length;
                        }
                        entry.width = Math.floor (entry.width * 100) + "%";
                    }

                    // "styles" should be an object containing style names that will be
                    // applied to the components - it's treated as an override of a default
                    // set of values, so not all values must be supplied
                    this.styles = Object.create (defaultStyles);
                    if (parameters.styles !== undefined) {
                        for (let style of Object.keys (defaultStyles)) {
                            if (parameters.styles[style] !== undefined) {
                                this.styles[style] = parameters.styles[style];
                            }
                        }
                    }

                    // "callback" is a way for the display to send an event if a row is
                    // clicked on or selected by the user
                    if (parameters.onclick !== undefined) {
                        this.onclick = parameters.onclick;
                    }

                    // start off with no selected row, allowing mouseover
                    this.currentRow = null;
                    this.allowMouseover = true;
                } else {
                    Bedrock.LogLevel.say (Bedrock.LogLevel.ERROR, "'container' must be a valid element with an id (which is used as the base name for rows).");
                }
            } else {
                Bedrock.LogLevel.say (Bedrock.LogLevel.ERROR, "'container' is a required parameter. it may be an element or a valid element id.");
            }

            return this;
        };

        _.makeTable = function () {
            const container = this.container;
            const select = this.select;
            const styles = this.styles;
            const self = this;

            // utility function to compute the container height, just helps keep
            // the code a bit cleaner when I use it - this is a bit stilted code-
            // wise because the actual return value from some of these styles
            // might not be a number at all
            let getContainerHeight = (minHeight) => {
                let containerHeight = container.offsetHeight;
                if ((parseInt (containerHeight.toString ()) >= minHeight) === false) {
                    containerHeight = window.getComputedStyle (container).getPropertyValue ("height");
                }
                if ((parseInt (containerHeight.toString ()) >= minHeight) === false) {
                    containerHeight = window.getComputedStyle (container).getPropertyValue ("max-height");
                }
                if ((parseInt (containerHeight.toString ()) >= minHeight) === false) {
                    containerHeight = minHeight;
                }
                return parseInt (containerHeight.toString ());
            };

            // size the pages a bit larger than the actual view so that there can't be
            // more than two pages visible at any one time. this is also a bit of a
            // compromise as larger pages means more populated lines for display per
            // page, so we don't want to just blow the size way up.
            const records = this.records;
            const recordCount = records.length;
            const rowHeight = parseInt (Html.getCssSelectorStyle ("." + styles[Style.TABLE_ROW], "height"));
            const containerHeight = getContainerHeight (rowHeight);
            const pageSize = Math.max (Math.floor ((containerHeight / rowHeight) * 1.25), 1);
            const pageHeight = rowHeight * pageSize;
            const pageCount = Math.floor (recordCount / pageSize) + (((recordCount % pageSize) > 0) ? 1 : 0);

            // reset everything
            Html.removeAllChildren (container);
            container.scrollTop = 0;

            // utility functions that use special knowledge of the size of a
            // page to decide if the page or row is visible
            const Visible = Enum.create ( "NOT_VISIBLE", "PARTIALLY_VISIBLE", "COMPLETELY_VISIBLE" );
            let rangeIsVisible = function (start, end) {
                const scrollTop = container.scrollTop;
                start = (start * rowHeight) - scrollTop;
                end = (end * rowHeight) - scrollTop;
                return ((end >= 0) && (start <= container.clientHeight)) ?
                    (((start >= 0) && (end < container.clientHeight)) ? Visible.COMPLETELY_VISIBLE : Visible.PARTIALLY_VISIBLE) :
                    Visible.NOT_VISIBLE;
            };

            let getRowInfo = function (rowId) {
                return parseInt (rowId.toString ().split (/-/).slice(-1)[0]);
            };

            let rowIsVisible = function (rowId) {
                let row = getRowInfo (rowId);
                return (rangeIsVisible (row, row + 1) === Visible.COMPLETELY_VISIBLE);
            };

            let getPageInfo = function (pageId) {
                // extract the page range that we encoded into the id, like
                // this:"blah-blah-32-85"
                let pageInfo = pageId.toString ().split (/-/);
                return {
                    start: parseInt (pageInfo[pageInfo.length - 2]),
                    end: parseInt (pageInfo[pageInfo.length - 1])
                };
            };

            let pageIsVisible = function (page) {
                let pageInfo = getPageInfo (page.id);
                return (rangeIsVisible(pageInfo.start, pageInfo.end) !== Visible.NOT_VISIBLE);
            };

            let go = function (defaultRowId, add, scroll) {
                // default to row 0
                let rowId = defaultRowId;

                // deselect the current row if there is one
                if (self.currentRow !== null) {
                    // update the next row...
                    rowId = ((getRowInfo (self.currentRow.id) + add) + records.length) % records.length;
                    self.currentRow.classList.remove (styles[Style.HOVER]);
                }

                // what page is the new element on, and is it populated?
                let pageId = Math.floor (rowId / pageSize);
                let page = container.children[0].children[pageId];
                if (page.children.length === 0) {
                    populatePage(page);
                }

                // get the relative offset and get the actual row
                let relativeIndex = rowId - (pageId * pageSize);
                self.currentRow = page.children[0].children[relativeIndex];
                self.currentRow.classList.add (styles[Style.HOVER]);

                // and finally, check to see if the row is visible
                if (! rowIsVisible (rowId)) {
                    // gotta scroll to make it visible, and tell the rows not
                    // to respond to mouseover events until the mouse moves
                    self.allowMouseover = false;
                    container.scrollTop = scroll (rowId);
                }
            };

            // go next, go prev... for key-press access
            self.goNext = function () {
                go (0, 1, function (rowId) {
                    // optionsElement.scrollTop = (self.currentOption.offsetTop - optionsElement.offsetHeight) + self.currentOption.offsetHeight;
                    return ((rowId + 1) * rowHeight) - container.clientHeight
                    //return rowId * rowHeight;
                });
            };

            self.goPrev = function () {
                go (records.length - 1, -1, function (rowId) {
                    return rowId * rowHeight;
                });
            };

            self.select = function () {
                if (self.currentRow !== null) {
                    self.currentRow.onmousedown();
                }
            };

            // the main worker function - when the container is scrolled, figure out which
            // pages are visible and make sure they are populated. we try to do this in an
            // intelligent way, rather than iterate over all the pages. the point is to
            // reduce the amount of DOM manipulation we do, as those operations are VERY
            // slow.
            let lastVisiblePages = [];
            container.onscroll = function (/* event */) {
                let visiblePages = [];

                // clear the lastVisiblePages
                for (let page of lastVisiblePages) {
                    if (pageIsVisible (page)) {
                        visiblePages.push (page);
                    } else {
                        Html.removeAllChildren (page);
                    }
                }

                // figure out which pages to make visible
                let start = Math.floor (container.scrollTop / pageHeight);
                let end = Math.min (pageCount, start + 2);
                let pages = container.children[0].children;
                for (let i = start; i < end; ++i) {
                    let page = pages[i];
                    if ((page.children.length === 0) && pageIsVisible (page)) {
                        visiblePages.push (page);
                        populatePage (page);
                    }
                }

                // reset the visible pages for the next time
                lastVisiblePages = visiblePages;
            };

            // function to populate a page - build it out from the records
            let populatePage = function (pageElement) {
                // create a filler object to make add/remove quick
                let pageBuilder = Html.Builder.begin ("div");

                // extract the page range that we encoded into the id, like
                // this:"blah-blah-32-85"
                let pageInfo = getPageInfo (pageElement.id);
                for (let j = pageInfo.start, end = pageInfo.end; j < end; ++j) {
                    let record = records[j];
                    let rowBuilder = pageBuilder.begin ("div", {
                        id: container.id + "-row-" + j,
                        class: ((j & 0x01) === 1) ? [styles[Style.TABLE_ROW], styles[Style.ODD]] : [styles[Style.TABLE_ROW]],
                        onmousedown: function () {
                            if (self.onclick !== undefined) {
                                if (self.onclick (self.records[j])) {
                                    // if the called function returns true, we reset the
                                    // selected element
                                    this.classList.remove (styles[Style.HOVER]);
                                    self.currentRow = null;
                                }
                                return true;
                            }
                            return false;
                        },
                        onmouseover: function () {
                            //LOG (INFO, "onmouseover (" + ((self.allowMouseover === true) ? "YES" : "NO") + ")");
                            if (self.allowMouseover === true) {
                                if (self.currentRow !== null) {
                                    self.currentRow.classList.remove (styles[Style.HOVER]);
                                }
                                self.currentRow = this;
                                self.currentRow.classList.add (styles[Style.HOVER]);
                            }
                        },
                        onmousemove: function () {
                            //LOG (INFO, "onmousemove (" + ((self.allowMouseover === true) ? "YES" : "NO") + ")");
                            self.allowMouseover = true;
                        }
                    });

                    // populate the row entries
                    for (let entry of select) {
                        let value = (entry.name in record) ? record[entry.name] : "";
                        let entryClass = [styles[entry.type], styles[Style.TABLE_ROW_ENTRY_TEXT]];
                        if (entry.class !== undefined) {
                            entryClass = entryClass.concat(Array.isArray(entry.class) ? entry.class : entry.class.split (","));
                        }
                        let entryTextParams = {
                            class: entryClass,
                            innerHTML: (value !== undefined) ? value : ""
                        };
                        if (entry.style !== undefined) {
                            entryTextParams.style = entry.style;
                        }
                        rowBuilder
                            .begin ("div", { class: styles[Style.TABLE_ROW_ENTRY], style: { width: entry.width } })
                                .add ("div", entryTextParams)
                            .end ();
                    }
                    pageBuilder.end ();
                }
                pageElement.appendChild (pageBuilder.end ());
            };

            // loop over all of the records, page by page
            let pageContainerBuilder = Html.Builder.begin ("div");
            for (let pageIndex = 0; pageIndex < pageCount; ++pageIndex) {
                let start = pageIndex * pageSize;
                let end = Math.min (start + pageSize, recordCount);
                pageContainerBuilder.add ("div", {
                    id: container.id + "-page-" + start + "-" + end,
                    style: { height: ((end - start) * rowHeight) + "px" }
                });
            }
            container.appendChild (pageContainerBuilder.end ());
            container.onscroll (null);
            return this;
        };

        _.makeTableHeader = function () {
            const container = this.container;
            const select = this.select;
            const styles = this.styles;

            let headerBuilder = Html.Builder.begin ("div", { class: styles[Style.HEADER] });
            let headerRowBuilder = headerBuilder.begin ("div", { class: styles[Style.HEADER_ROW] });
            for (let entry of select) {
                headerRowBuilder
                    .begin ("div", { class: styles[Style.HEADER_ENTRY], style: { width: entry.width } })
                    .add ("div", { class: styles[Style.HEADER_ENTRY_TEXT], innerHTML: entry.displayName })
                    .end ();
            }
            container.appendChild (headerBuilder.end ());
        };

        _.makeTableWithHeader = function () {
            Html.removeAllChildren (this.container);

            // add the header
            this.makeTableHeader ();

            // add the table to a sub element
            this.container = Html.addElement (this.container, "div", { id: this.container.id + "-table", class: this.styles[Style.TABLE] });
            return this.makeTable ();
        };

        return _;
    } ();

    return $;
} ();
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
                        Bedrock.LogLevel.say (Bedrock.LogLevel.ERROR, "expected 'parentElementId' or 'parentElement'.");
                        return null;
                    }
                } else {
                    // the inputElement was found, let's retrieve its parent
                    parentElement = inputElement.parentNode;
                }
            } else {
                // fatal error, no id was supplied, and none was findable
                Bedrock.LogLevel.say (Bedrock.LogLevel.ERROR, "ERROR: expected 'inputElementId' or 'inputElement'.");
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
            Bedrock.LogLevel.say (Bedrock.LogLevel.ERROR, "ERROR: 'inputElementId' is required.");
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
    _.WILDCARD = "*";

    _.init = function (parameters) {
        // scope "this" as self so I can use it in closures
        let scope = this;

        // parameters.name - name of the form (and the event to use when submitting)
        let formName = this.name = parameters.name;

        // parameters.onEnter - function to call when the user hits the enter key on an input
        // the default behavior is to call onClickSubmit if the callback returns true
        this.onEnter = ("onEnter" in parameters) ? parameters.onEnter : function () { return true; }

        // parameters.onCompletion - function to call when the user clicks submit and all the
        // input values pass validation
        this.onCompletion = parameters.onCompletion;

        // parameters.onUpdate - function to call when any value changes in the form
        if ("onUpdate" in parameters) {
            this.onUpdate = parameters.onUpdate;
        }

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
                    events: {
                        change: function () { scope.handleOnUpdate (input.name); },
                        keyup: function (event) { if (event.keyCode === 13) scope.handleEnterKey (); }
                    }
                });
                // this is a value stored for reset
                inputObject.originalValue = value;
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
                        events: {
                            change: function () { scope.handleOnUpdate (input.name); },
                            keyup: function (event) { if (event.keyCode === 13) scope.handleEnterKey (); }
                        }
                    });
                    // this is a value stored for reset
                    inputObject.originalValue = checked;
                    break;
                }
                case _.SELECT: {
                    let inputElement = inputObject.inputElement = Html.addElement (parentDiv, _.SELECT, {
                        id: inputElementId,
                        class: "form-input",
                        events: {
                            change: function () { scope.handleOnUpdate (input.name); },
                            keyup: function (event) { if (event.keyCode === 13) scope.handleEnterKey (); }
                        }
                    });
                    for (let option of input.options) {
                        let value = (option === Object (option)) ? option.value : option;
                        let label = ((option === Object (option)) && ("label" in option)) ? option.label : value;
                        Html.addElement (inputElement, "option", { value: value, innerHTML: label });
                    }
                    let value = ("value" in input) ? input.value : inputObject.inputElement.value;
                    inputObject.inputElement.value = inputObject.originalValue = value;
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
                        events: {
                            change: function () { scope.handleOnUpdate (input.name); },
                            keyup: function (event) { if (event.keyCode === 13) scope.handleEnterKey (); }
                        }
                    });

                    // this is a value stored for reset
                    inputObject.originalValue = value;

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
        Html.addElement (formDivElement, "input", { type: "button", value: submitButtonTitle, class: "form-submit-button", onclick: function () { scope.handleClickSubmit (); } });

        // and call the onUpdate the first time through
        this.handleOnUpdate (_.WILDCARD);

        return this;
    };

    _.handleOnUpdate = function (updatedName) {
        if ("onUpdate" in this) {
            this.onUpdate (updatedName, this);
        }
        return this;
    };

    _.handleEnterKey = function () {
        // call the onEnter handler, and if it returns true, call the click submit handler
        if (this.onEnter ()) {
            this.handleClickSubmit ();
        }
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

        // call onCompletion if everything passes
        if (allValid === true) {
            this.onCompletion (this);
        }
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

    _.privateSetValue = function (key, value, callHandleOnUpdate) {
        let input = this.inputs[key];
        switch (input.type) {
            case _.CHECKBOX:
                input.inputElement.checked = value;
                break;
            case _.TEXT:
            case _.SECRET:
            case _.SELECT:
            case _.LIST:
                input.inputElement.value = value;
                break;
        }
        // call on update defaults to true
        return Bedrock.Utility.defaultTrue (callHandleOnUpdate) ? this.handleOnUpdate (key) : this;
    };

    _.setValue = function (key, value, callHandleOnUpdate) {
        if (key in this.inputs) {
            this.privateSetValue (key, value, callHandleOnUpdate);
        }
        return this;
    };

    _.setValues = function (values, callHandleOnUpdate, strictSet) {
        // strictSet defaults to true
        strictSet = Bedrock.Utility.defaultTrue (strictSet);
        let keys = Object.keys (this.inputs);
        for (let key of Object.keys (this.inputs)) {
            if (key in values) {
                this.privateSetValue(key, values[key], false);
            } else if (strictSet) {
                this.privateSetValue(key, this.inputs[key].originalValue, false);
            }
        }

        // call on update defaults to true
        return Bedrock.Utility.defaultTrue (callHandleOnUpdate) ? this.handleOnUpdate (_.WILDCARD) : this;
    };

    _.reset = function () {
        for (let inputName of Object.keys (this.inputs)) {
            this.privateSetValue(inputName, this.inputs[inputName].originalValue, false);
        }
        return this.handleOnUpdate(_.WILDCARD);
    };

    _.showInput = function (key, show) {
        let input = this.inputs[key];
        let elementStyle = input.inputElement.parentElement.parentElement.style;

        // all elements are visible when created, so this should happen the first time through
        if ((!("display" in input)) && (elementStyle.display !== "none")) {
            input.display = elementStyle.display;
        }

        // set the state
        show = Bedrock.Utility.defaultTrue (show);
        input.visible = show;
        elementStyle.display = show ? input.display : "none";
        return this;
    };

    _.hideInput = function (key) {
        return this.showInput(key, false);
    };

    _.showOnlyInputs = function (keys, show) {
        // make an object out of the keys array
        let showHide = {};
        for (let key of keys) {
            showHide[key] = 0;
        }

        // loop over all the inputs to show or hide them as requested
        for (let key in this.inputs) {
            this.showInput(key, (key in showHide) ? show : !show);
        }
    };

    _.hideOnlyInputs = function (keys) {
        return this.showOnlyInputs(keys, false);
    };

    return _;
} ();

// CompareFunctions are interfaces that take two values (a, b), and return a number as
// follows:
//     a < b : negative
//     a = b : zero
//     a > b : positive
Bedrock.CompareFunctions = function () {
    let $ = Bedrock.Enum.create ("NUMERIC", "ALPHABETIC", "CHRONOLOGIC", "AUTO");

 // this is repeated several times, but I don't want it to be a function call
 let compareNumeric = function (a, b, asc) {
  // compare the values as numeric entities
  return asc ? (a - b) : (b - a);
 };

 $.numeric = function (a = null, b = null, asc = true) {
  if (a === null) { return (b !== null) ? (asc ? -1 : 1) : 0; } if (b === null) { return (asc ? 1 : -1); };
  return compareNumeric (a, b, asc);
 };

 let compareAlphabetic = function (a, b, asc) {
  // compare case-insensitive strings with no spaces
  let ra = a.replace (/\s*/g, "").toLowerCase ();
  let rb = b.replace (/\s*/g, "").toLowerCase ();
  return asc ? ra.localeCompare (rb) : rb.localeCompare (ra);
 };

 $.alphabetic = function (a = null, b = null, asc = true) {
  if (a === null) { return (b !== null) ? (asc ? -1 : 1) : 0; } if (b === null) { return (asc ? 1 : -1); };
  return compareAlphabetic (a, b, asc);
 };

 $.chronologic = function (a = null, b = null, asc = true) {
  if (a === null) { return (b !== null) ? (asc ? -1 : 1) : 0; } if (b === null) { return (asc ? 1 : -1); };

  // convert the dates/timestamps to numerical values for comparison
  return compareNumeric (new Date (a).valueOf (), new Date (b).valueOf (), asc);
 };

 $.auto = function (a = null, b = null, asc = true) {
  if (a === null) { return (b !== null) ? (asc ? -1 : 1) : 0; } if (b === null) { return (asc ? 1 : -1); };

  // try to compare the values as numerical if we can
  let na = Number (a), nb = Number (b);
  if ((na.toString () === a.toString ()) && (nb.toString () === b.toString ())) {
   return compareNumeric (na, nb, asc);
  }

  // otherwise do it alphabetic
  return compareAlphabetic (a, b, asc);
 };

 $.get = function (type = $.AUTO) {
  switch (type) {
   case $.NUMERIC:
    return this.numeric;

   case $.ALPHABETIC:
    return this.alphabetic;

   case $.CHRONOLOGIC:
    return this.chronologic;

            default:
   case $.AUTO:
    return this.auto;
  }
  throw "Unknown type (" + type + ")";
 };

 $.compare = function (a, b, asc, type) {
  return this.get (type) (a, b, asc);
 };

 $.mask = function (compareResult) {
  return (compareResult < 0) ? 0b0001 : (compareResult > 0) ? 0b0100 : 0b0010;
 };

 $.operationMask = function (operation) {
  switch (operation.toLowerCase ()) {
   case "lt": case "<":
    return 0b0001;

   case "lte": case "<=":
    return 0b0011;

   case "eq": case "=": case "==":
    return 0b0010;

   case "gte": case ">=":
    return 0b0110;

   case "gt": case ">":
    return 0b0100;

   case "ne": case "neq": case "<>": case "!=": case "!":
    return 0b0101;
  }
  throw "Unknown operation (" + operation + ")";
 };

 return $;
} ();
Bedrock.Comparable = function () {
    let $ = Object.create(null);

    $.FieldComparable = function () {
        let _ = Object.create(Bedrock.Base);

        _.init = function (parameters) {
            this.compareFunction = Bedrock.CompareFunctions.get(parameters.type);
            // allow the user to specify either ascending or descending
            this.ascending = ("ascending" in parameters) ? parameters.ascending : true;
            this.ascending = ("descending" in parameters) ? (! parameters.descending) : this.ascending;
            this.name = parameters.name;
            return this;
        };

        _.compare = function (recordA, recordB) {
            return this.compareFunction(recordA[this.name], recordB[this.name], this.ascending);
        };

        return _;
    }();

    $.RecordComparable = function () {
        let _ = Object.create(Bedrock.Base);

        _.init = function (parameters) {
            let fc = this.fieldComparables = [];
            for (let field of parameters.fields) {
                fc.push(Bedrock.Comparable.FieldComparable.new(field));
            }
            return this;
        };

        _.compare = function (recordA, recordB) {
            for (let fieldComparable of this.fieldComparables) {
                let sortResult = fieldComparable.compare(recordA, recordB);
                if (sortResult != 0) {
                    return sortResult;
                }
            }
            return 0;
        };

        return _;
    }();

    return $;
} ();
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
