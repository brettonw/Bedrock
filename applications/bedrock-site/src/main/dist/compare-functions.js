// CompareFunctions are interfaces that take two values (a, b), and return a number as
// follows:
//     a < b : negative
//     a = b : zero
//     a > b : positive
Bedrock.CompareFunctions = function () {
    let _ = Object.create (null);

    // constants for the interface
    _.NUMERIC = "numeric";
    _.ALPHABETIC = "alphabetic";
    _.CHRONOLOGIC = "chronologic";
    _.AUTO = "auto";
    _.WILDCARD = "*";

	// this is repeated several times, but I don't want it to be a function call
	#define	NULL_CHECK																	\
        if ((typeof (a) === "undefined") || (a == null)) {								\
            return ((typeof (b) !== "undefined") && (b != null)) ? (asc ? -1 : 1) : 0;	\
        }																				\
        if ((typeof (b) === "undefined") || (b == null)) {								\
            return (asc ? 1 : -1);														\
        }
		
	let compareNumeric = function (a, b, asc) {
		// compare the values as numeric entities
		return asc ? (a - b) : (b - a)
	};
		
	_.numeric = function (a, b, asc) {
		NULL_CHECK;
		return compareNumeric (a, b, asc);
	};
	
	let compareAlphabetic = function (a, b, asc) {
		// compare case-insensitive strings with no spaces
		let ra = a.replace (/\s*/g, "").toLowerCase ();
		let rb = b.replace (/\s*/g, "").toLowerCase ();
		return asc ? ra.localeCompare (rb) : rb.localeCompare (ra);
	};
	
	_.alphabetic = function (a, b, asc) {
		NULL_CHECK;
		return compareAlphabetic (a, b, asc);
	};
	
	_.date = function (a, b, asc) {
		NULL_CHECK;
		
		// convert the dates/timestamps to numerical values for comparison
		return compareNumeric (new Date (a).valueOf (), new Date (b).valueOf ());
	};
	
	_.auto = function (a, b, asc) {
		NULL_CHECK;
		
		// try to compare the values as numerical if we can
		let na = Number (a), nb = Number (b);
		if ((na == a.toString ()) && (nb == b.toString ())) {
			return compareNumeric (na, nb, asc);
		}
		
		// otherwise do it alphabetic
		return compareAlphabetic (a, b, asc);
	};
	
	_.get = function (type) {
		switch (type.toLowerCase ()) {
			case _.NUMERIC:
			case "number":
			case "digits":
				return this.numeric;
				
			case _.ALPHABETIC:
			case "text":
			case "string":
				return this.alphabetic;
				
			case _.CHRONOLOGIC:
			case "date":
			case "timestamp":
				return this.date;
				
			case _.AUTO:
			case "any":
			case _.WILDCARD:
				return this.auto;
		}
		throw "Unknown type (" + type + ")";
	};
	
	_.compare = function (a, b, asc, type) {
		return this.get (type) (a, b, asc);
	};
	
	_.mask = function (compareResult) {
		return (compareResult < 0) ? 0b0001 : (compareResult > 0) ? 0b0100 : 0b0010;
	};
	
	_.operationMask = function (operation) {
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
	
} ();
