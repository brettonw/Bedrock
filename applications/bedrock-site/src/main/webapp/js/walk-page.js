"use strict";

const VERSION = 2;

let setCookie = function (name, value, expireDays = 30) {
    let date = new Date ();
    date.setTime (date.getTime () + (expireDays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + date.toUTCString ();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

let getCookie = function (name) {
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

let deleteCookie = function (name) {
    setCookie (name, "", -1);
};

let replaceCookie = function (name, value, expireDays) {
    setCookie (name, "", -1);
    setCookie (name, value, expireDays);
};

let resetCookies = function () {
    let decodedCookie = decodeURIComponent (document.cookie);
    let cookieArray = decodedCookie.split (";");
    for (let cookie of cookieArray) {
        let name = cookie.split ("=")[0];
        name = name.replace (/^\s*/, "");
        name = name.replace (/\s*$/, "");
        setCookie (name, "", -1);
    }
};

let toggle = function (plus, minus, container, show) {
    //console.log ("Toggle: " + (show ? "ON" : "OFF"));
    if (show) {
        plus.style.display = "none";
        minus.style.display = "inline-block";
        container.style.display = "block";
    } else {
        minus.style.display = "none";
        plus.style.display = "inline-block";
        container.style.display = "none";
    }
};

let makeId = function (counterText, innerText) {
    return (counterText + " " + innerText + " v" + VERSION).toLowerCase ().replace (/ /g, "_");
};

const SHOW = "show";
const HIDE = "hide";

let defaults = {};
defaults[makeId ("1.", "about")] = SHOW;

let walkPage = function (page, prefix) {
    //console.log (page.tagName + "(" + page.childNodes.length + ")");
    if (page !== undefined) {
        if (page.childNodes !== undefined) {
            let counter = 0;
            for (let element of page.childNodes) {
                if (element.tagName !== undefined) {
                    switch (element.tagName) {
                        case "H2":
                        case "H3":
                        case "H4": {
                            // get the following element, which should be a container class
                            let container = element.nextElementSibling;
                            if ((container !== undefined) && (container !== null)) {
                                if (container.classList.contains ("container")) {
                                    let counterText = prefix + (++counter) + ".";
                                    let id = makeId (counterText, element.innerText);
                                    console.log ("ID: " + id);

                                    container.id = id + "-container";
                                    walkPage (container, counterText);

                                    // now replace the Hx... with a div that contains it
                                    let div = document.createElement ("div");
                                    div.classList.add ("header");

                                    let plus = document.createElement ("img");
                                    plus.src = "img/plus.png";
                                    plus.classList.add ("plus");
                                    plus.id = id + "-plus";
                                    div.appendChild (plus);

                                    let minus = document.createElement ("img");
                                    minus.src = "img/minus.png";
                                    minus.classList.add ("minus");
                                    minus.id = id + "-minus";
                                    div.appendChild (minus);

                                    plus.onclick = function (event) {
                                        toggle (plus, minus, container, true);
                                        replaceCookie (id, SHOW);
                                    };
                                    minus.onclick = function (event) {
                                        toggle (plus, minus, container, false);
                                        replaceCookie (id, HIDE);
                                    };

                                    element.parentNode.replaceChild (div, element);

                                    let h = document.createElement (element.tagName);
                                    h.innerHTML = counterText;
                                    h.classList.add ("counter");
                                    div.appendChild (h);

                                    div.appendChild (element);

                                    // everything is hidden by default, so only do this if the cookie is "show"
                                    let cookie = getCookie (id);
                                    if ((cookie === SHOW) || ((cookie === "") && (defaults[id] === SHOW))) {
                                        //console.log ("GOT COOKIE");
                                        toggle (plus, minus, container, true);
                                    }

                                } else {
                                    console.log ("ERROR IN DOCUMENT STRUCTURE");
                                }
                            }
                            break;
                        }
                    }
                }
            }
        } else {
            console.log ("invalid childNodes");
        }
    } else {
        console.log ("invalid page");
    }
};

let page = document.getElementById ("page-container");
walkPage (page, "");
