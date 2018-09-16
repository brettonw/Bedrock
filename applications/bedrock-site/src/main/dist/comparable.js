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
