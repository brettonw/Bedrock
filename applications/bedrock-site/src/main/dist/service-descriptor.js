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
        Bedrock.ServiceBase.get ({ event : "help" }, function (response) {
            // get the example and explicitly set the event in it (it's typically omitted for simplicity in the configurations)
            let example = response.events[exampleName].example;
            example.event = exampleName;

            let handleExampleResponse = function (exampleResponse) {
                document.getElementById ("bedrock-service-descriptor-hover-box").style.visibility = "visible";
                document.getElementById ("bedrock-service-descriptor-hover-box-content").innerHTML = JSON.stringify (exampleResponse, null, 4);
            };

            // if the example includes post data...
            if ("post-data" in example) {
                // separate the post data and issue the example request as a post
                let postData = JSON.stringify (example["post-data"]);
                delete example["post-data"];
                Bedrock.Http.post (Bedrock.ServiceBase.getQuery (example), postData, handleExampleResponse);
            } else {
                // issue the example request as a get
                Bedrock.Http.get(Bedrock.ServiceBase.getQuery (example), handleExampleResponse);
            }
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
                            let required = ("required" in element) ? (element.required === "true") : false;
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

                    if (("strict" in object) && (object.strict === "false")) {
                        if (! ("parameters" in object)) {
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
                    if (Array.isArray(response)) {
                        // return specification might be an empty array, or an array with a single
                        // proto object
                        if (response.length > 0) {
                            evenOdd("Response (Array):", response[0]);
                        } else {
                            evenOddTitle ("Response (Array):");
                            eventHTML += div ("even-odd-div" + (odd ? " odd" : ""),
                                div ("even-odd-name", "(any)") +
                                div ("even-odd-required", "OPTIONAL") +
                                div ("even-odd-description", "Unspecified."));
                        }
                    } else {
                        evenOdd("Response:", response);
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

        // now add a floating pane that is invisible and install the click handler to hide it
        innerHTML +=
            block ("div", { id: "bedrock-service-descriptor-hover-box" },
                block ("div", {id: "bedrock-service-descriptor-hover-box-buffer"},
                    block("pre", {id: "bedrock-service-descriptor-hover-box-content"},"")
                )
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

                    LOG (INFO, functionName + " " + functionParameters + ";\n");

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
