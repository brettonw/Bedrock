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
