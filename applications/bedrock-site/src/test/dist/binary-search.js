//               0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
let database = [ 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5 ];
let end = database.length;

// find the lower bound of the search region
let findLowerBound = function (value, low, high) {
    while (low <= high) {
        let mid = (low + high) >>> 1;
        let cmp = (mid < end) ? (database[mid] - value) : 1;
        console.log (low + " " + high + " "  + mid + " " + database[mid] + " " + cmp);
        if (cmp < 0) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    console.log (low + " " + high);
    console.log ("Lower bound: " + low);
    return low;
};

// find the upper bound of the search region
let findUpperBound = function (value, low, high) {
    while (low <= high) {
        let mid = (low + high) >>> 1;
        let cmp = (mid < end) ? (database[mid] - value) : 1;
        console.log (low + " " + high + " "  + mid + " " + database[mid] + " " + cmp);
        if (cmp <= 0) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    console.log (low + " " + high);
    console.log ("Upper bound: " + low);
    return low;
};

let findBounds = function (value) {
    console.log ("-------------------------------------------------");
    console.log ("Find bounds of (" + value + ")");
    console.log ("Low High Mid @Mid cmp");
    let lower = findUpperBound (value, 0, end);
    let upper = findLowerBound (value, 0, end);
};

let compareFunction = function (a, b, asc) {
    return asc ? (a - b) :  (b - a);
};

let perform = function (operation, value) {
    // find the lower bound of the search region
    let findLowerBound = function (low, high) {
        while (low <= high) {
            let mid = (low + high) >>> 1;
            let cmp = (mid < end) ? compareFunction (database[mid], value, true) : 1;
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
            let cmp = (mid < end) ? compareFunction (database[mid], value, true) : 1;
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
    switch (operation) {
        case "<": // <
            // take from 0 to lower bound
            return database.slice (0, findLowerBound (0, end));
        case "<=": // <=
            // take from 0 to upper bound
            return database.slice (0, findUpperBound (0, end));
        case "=": // =
            // take from lower bound to upper bound
            upperBound = findUpperBound (0, end);
            return database.slice (findLowerBound (0, upperBound), upperBound);
        case ">=": // >=
            // take from lower bound to end
            return database.slice (findLowerBound (0, end));
        case ">": // >
            // take from upper bound to end
            return database.slice (findUpperBound (0, end));
        case "<>": // <>
            // take from 0 to lower bound, and upper bound to end
            upperBound = findUpperBound (0, end);
            return database.slice (0, findLowerBound (0, upperBound)).concat (database.slice (upperBound));
    }

    // return the result
    return result;
};

let arrayCompare = function (left, right) {
    if ((!left) || (!right)) {
        return false;
    }

    // compare lengths - can save a lot of time
    if (left.length !== right.length) {
        return false;
    }

    for (let i = 0, end = left.length; i < end; ++i) {
        // recurse if we have nested arrays, otherwise just compare the values with
        // the assumption that they are not objects themselves
        if ((left[i] instanceof Array) && (right[i] instanceof Array)) {
            if (!arrayCompare (left[i], right[i])) {
                return false;
            }
        } else if (left[i] !== right[i]) {
            return false;
        }
    }
    return true;
};

let performAll = function (value, expect) {
    console.log ("=================================================");

    let output = function (operation, value, expect) {
        let result = perform (operation, value);
        expect = expect[operation];
        let pass = arrayCompare (result, expect);
        Test.assertTrue (((operation.length > 1) ? "" : " ") + operation + " " + value + " : [" + result + "]", arrayCompare (result, expect));
    };
    console.log (" src : [" + database + "]");
    output ("<", value, expect);
    output ("<=", value, expect);
    output ("=", value, expect);
    output (">=", value, expect);
    output (">", value, expect);
    output ("<>", value, expect);
};


findBounds (0);
findBounds (1);
findBounds (1.5);
findBounds (2);
findBounds (3);
findBounds (4);
findBounds (5);
findBounds (6);

performAll (0, {
    "<": [],
    "<=": [],
    "=": [],
    ">=": [1,1,1,2,2,2,3,3,3,3,4,4,4,5,5,5,5],
    ">": [1,1,1,2,2,2,3,3,3,3,4,4,4,5,5,5,5],
    "<>": [1,1,1,2,2,2,3,3,3,3,4,4,4,5,5,5,5]
});
performAll (1, {
    "<": [],
    "<=": [1,1,1],
    "=": [1,1,1],
    ">=": [1,1,1,2,2,2,3,3,3,3,4,4,4,5,5,5,5],
    ">": [2,2,2,3,3,3,3,4,4,4,5,5,5,5],
    "<>": [2,2,2,3,3,3,3,4,4,4,5,5,5,5]
});
performAll (1.5, {
    "<": [1,1,1],
    "<=": [1,1,1],
    "=": [],
    ">=": [2,2,2,3,3,3,3,4,4,4,5,5,5,5],
    ">": [2,2,2,3,3,3,3,4,4,4,5,5,5,5],
    "<>": [1,1,1,2,2,2,3,3,3,3,4,4,4,5,5,5,5]
});
performAll (2, {
    "<": [1,1,1],
    "<=": [1,1,1,2,2,2],
    "=": [2,2,2],
    ">=": [2,2,2,3,3,3,3,4,4,4,5,5,5,5],
    ">": [3,3,3,3,4,4,4,5,5,5,5],
    "<>": [1,1,1,3,3,3,3,4,4,4,5,5,5,5]
});
performAll (3, {
    "<": [1,1,1,2,2,2],
    "<=": [1,1,1,2,2,2,3,3,3,3],
    "=": [3,3,3,3],
    ">=": [3,3,3,3,4,4,4,5,5,5,5],
    ">": [4,4,4,5,5,5,5],
    "<>": [1,1,1,2,2,2,4,4,4,5,5,5,5]
});
performAll (4, {
    "<": [1,1,1,2,2,2,3,3,3,3],
    "<=": [1,1,1,2,2,2,3,3,3,3,4,4,4],
    "=": [4,4,4],
    ">=": [4,4,4,5,5,5,5],
    ">": [5,5,5,5],
    "<>": [1,1,1,2,2,2,3,3,3,3,5,5,5,5]
});
performAll (5, {
    "<": [1,1,1,2,2,2,3,3,3,3,4,4,4],
    "<=": [1,1,1,2,2,2,3,3,3,3,4,4,4,5,5,5,5],
    "=": [5,5,5,5],
    ">=": [5,5,5,5],
    ">": [],
    "<>": [1,1,1,2,2,2,3,3,3,3,4,4,4]
});
performAll (6, {
    "<": [1,1,1,2,2,2,3,3,3,3,4,4,4,5,5,5,5],
    "<=": [1,1,1,2,2,2,3,3,3,3,4,4,4,5,5,5,5],
    "=": [],
    ">=": [],
    ">": [],
    "<>": [1,1,1,2,2,2,3,3,3,3,4,4,4,5,5,5,5]
});
