"use strict;"

let console = {
    log : function (text) {
        print (text);
    }
};

let Test = {
    assertTrue : function (message, pass) {
        print ((pass ? "PASS" : "FAIL") + " - " + message);
        if (pass === false) {
            exit (1);
        }
    }
};

