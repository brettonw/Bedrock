// CompareFunctions are interfaces that take two values (a, b), and return a number as
// follows:
//     a < b : negative
//     a = b : zero
//     a > b : positive
Bedrock.CompareFunctions = function () {
    let $ = Bedrock.Enum.create ("NUMERIC", "ALPHABETIC", "CHRONOLOGIC", "AUTO");

	// this is repeated several times, but I don't want it to be a function call
	#define	NULL_CHECK															\
        if (a === null) {														\
            return (b !== null) ? (asc ? -1 : 1) : 0;							\
        }																		\
        if (b === null) {														\
            return (asc ? 1 : -1);												\
        }
		
	let compareNumeric = function (a, b, asc) {
		// compare the values as numeric entities
		return asc ? (a - b) : (b - a);
	};
		
	$.numeric = function (a = null, b = null, asc = true) {
		NULL_CHECK;
		return compareNumeric (a, b, asc);
	};
	
	let compareAlphabetic = function (a, b, asc) {
		// compare case-insensitive strings with no spaces
		let ra = a.replace (/\s*/g, "").toLowerCase ();
		let rb = b.replace (/\s*/g, "").toLowerCase ();
		return asc ? ra.localeCompare (rb) : rb.localeCompare (ra);
	};
	
	$.alphabetic = function (a = null, b = null, asc = true) {
		NULL_CHECK;
		return compareAlphabetic (a, b, asc);
	};
	
	$.chronologic = function (a = null, b = null, asc = true) {
		NULL_CHECK;
		
		// convert the dates/timestamps to numerical values for comparison
		return compareNumeric (new Date (a).valueOf (), new Date (b).valueOf (), asc);
	};
	
	$.auto = function (a = null, b = null, asc = true) {
		NULL_CHECK;
		
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
