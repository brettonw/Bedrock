Bedrock.ServiceDescriptor = function () {
    let _ = Object.create (null);

    // Helper functions for emitting HTML from Javascript
    let valid = function (value) {
        return (typeof (value) != "undefined") && (value !== null);
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

    _.get = function (queryString, onSuccess) {
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

    _.displaySpecification = function (specification) {
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
                let eventHTML = "";

                // if there is an example
                if ("example" in event) {
                    let url = "api?event=" + eventName;
                    let example = event.example;
                    let exampleKeys = Object.keys (example).sort ();
                    for (let exampleKey of exampleKeys) {
                        url += "&" + exampleKey + "=" + example[exampleKey];
                    }
                    //eventHTML = a ("try-it", url, " (" + url.replace (/&/g, "&amp;") + ")");
                    eventHTML = a ("try-it", url, "[example]");
                }
                eventHTML = div ("event-name", eventName + eventHTML);

                // if there is a description
                if ("description" in event) {
                    eventHTML += div ("event-description", event.description);
                }

                let odd;
                let evenOdd = function (title, object) {
                    odd = true;
                    let names = Object.keys (object);
                    if (names.length > 0) {
                        eventHTML += div ("even-odd-title", title);
                        for (let name of names) {
                            let element = object[name];
                            let required = ("required" in element) ? element.required : false;
                            eventHTML += div ("even-odd-div" + (odd ? " odd" : ""),
                                div ("even-odd-name", name) +
                                div ("even-odd-required", required ? "REQUIRED" : "OPTIONAL") +
                                div ("even-odd-description", element.description));
                            odd = !odd;
                        }
                    }
                    return odd;
                };

                if ("parameters" in event) {
                    evenOdd ("Parameters:", event.parameters);
                }

                if (("strict" in event) && (event.strict == "false")) {
                    eventHTML += div ("even-odd-div" + (odd ? " odd" : ""),
                        div ("even-odd-name", "(any)") +
                        div ("even-odd-required", "OPTIONAL") +
                        div ("even-odd-description", "Event allows unspecified parameters."));
                }

                if ("returns" in event) {
                    let returns = event.returns;
                    // return specification might be an array, indicating this event returns an
                    // array of something
                    if (Array.isArray(returns)) {
                        // return specification might be an empty array, or an array with a single
                        // proto object
                        if (returns.length > 0) {
                            evenOdd("Returns Array of:", returns[0]);
                        } else {
                            eventHTML += div ("even-odd-title", "Returns: Array");
                        }
                    } else {
                        evenOdd("Returns:", returns);
                    }
                }

                eventsHTML += div ("event-div", eventHTML);
            }
            innerHTML += div("events-div", eventsHTML);
        }

        if ("name" in specification) {
            document.title = specification.name;
            innerHTML = block ("h1", {}, specification.name) + div("container-div", innerHTML);
        }
        innerHTML += div ("content-center footer", "Built with " + a ("footer-link", "http://bedrock.brettonw.com", "Bedrock"));

        return innerHTML;
    };

    // a little black raincloud, of course
    _.display = function (displayInDivId, inputUrl) {
        let url = (typeof (inputUrl) !== "undefined") ? inputUrl : "api?event=help";
        _.get (url, function (db) {
            // if we retrieved the api.json from the service base, get the actual response
            if (typeof (inputUrl) === "undefined") { db = db.response; }

            document.getElementById(displayInDivId).innerHTML = Bedrock.ServiceDescriptor.displaySpecification (db);
        });
    };

    // convert the names into camel-case names (dashes are removed and the following character is uppercased)
    let makeName = function (input) {
        return input.replace (/-([^-])/g, function replacer (match, p1, offset, string) {
            return p1.toUpperCase();
        });
    };

    _.translateResponse = function (response) {
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

    _.api = function (onSuccess, baseUrl, apiSource) {
        // condition the inputs
        baseUrl = ((typeof baseUrl === "undefined") || (baseUrl === "")) ? location.href.substr(0,location.href.lastIndexOf("/")) : baseUrl;
        baseUrl = baseUrl.replace (/\/$/g, "");

        // get the api
        let url = ((typeof (apiSource) === "undefined") || (apiSource === "")) ? (baseUrl + "/api?event=help") : apiSource;
        _.get (url, function (response) {
            // if we retrieved the api.json from the service base, get the actual response
            if (typeof (apiSource) === "undefined") { response = response.response; }

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

                    console.log (functionName + " " + functionParameters + ";\n");

                    let functionString = "return function " + functionParameters + " {\n" +functionBody + "};\n";
                    api[functionName] = new Function (functionString) ();
                }
            }

            // call the completion routine
            onSuccess (api);
        });
    };

    return _;
} ();
