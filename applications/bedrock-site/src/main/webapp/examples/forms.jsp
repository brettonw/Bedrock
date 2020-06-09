<%@ page import="com.brettonw.bedrock.Service" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Test</title>
    <link rel="stylesheet" href="../dist/<%= Service.getBedrockVersion() %>/bedrock.css?1"/>
    <link rel="icon" type="image/png" href="../img/icon.png?1"/>
</head>

<body>
<h1>Forms</h1>
<div class="page-container-div">
    <h2>Form A</h2>
    <div class="section-content-div">
        A simple form, A.
    </div>
    <div id="bedrock-form-container-A"></div>

    <h2>Form B</h2>
    <div class="section-content-div">
        A simple form, B. The description could be much longer, in fact it could be long enough
        to cause some basic wrapping to occur. That would be good for demonstration and testing
        purposes.
    </div>
    <div id="bedrock-form-container-B"></div>

    <h2>Form C</h2>
    <div class="section-content-div">
        A simple form, C, to demonstrate show/hide and required flags for hidden inputs.
    </div>
    <div id="bedrock-form-container-C"></div>
</div>
</body>
</html>

<script src="../dist/<%= Service.getBedrockVersion() %>/bedrock-debug.js"></script>
<script>
    let testResponse = function (form) {
        console.log (form.getValues ());
        form.reset ();
    };

    let Forms = Bedrock.Forms;

    Forms.new ({
        name: "testA",
        div: "bedrock-form-container-A",
        inputs: [
            { name: "a", type: Forms.TEXT, label: "A", required: true, placeholder: "YYYY-MM-DD", pattern: /\d\d\d\d-\d\d-\d\d/, value: "1970-01-01" },
            { name: "b", type: Forms.CHECKBOX, label: "B", required: true },
            { name: "c", type: Forms.CHECKBOX, label: "C", checked: true },
            { name: "d", type: Forms.LIST, label: "Enter One:", placeholder: "Something", value: "y", options: [{ value: "w", label: "Cap W" }, "X", "y", "z"] },
            { name: "e", type: Forms.LIST, label: "Enter Another:", required: true, placeholder: "Something", options: [{ value: "w", label: "Cap W" }, "X", "y", "z"] }
        ],
        onUpdate: function (updatedName, scope) {
            let values = scope.getValues();
            console.log ("updated: " + updatedName + ", " + values);
        },
        onCompletion: testResponse
    });

    Forms.new ({
        name: "testB",
        div: "bedrock-form-container-B",
        inputs: [
            { name: "a", type: Forms.TEXT, label: "A", required: true, placeholder: "YYYY", pattern: /\d+/ },
            { name: "b", type: Forms.CHECKBOX, label: "B", required: true },
            { name: "c", type: Forms.CHECKBOX, label: "C", checked: true },
            { name: "d", type: Forms.SELECT, label: "Select One:", value: "y", options: [{ value: "w", label: "W" }, "X", "y", "z"] }
        ],
        onCompletion: testResponse
    });

    Forms.new ({
        name: "testC",
        div: "bedrock-form-container-C",
        submitButtonValue: "DONE",
        inputs: [
            { name: "which", type: Forms.SELECT, label: "Choice:", required: true, options: [ { value: "", label: "(Select One)" }, "a", "b", "c", "d" ] },
            { name: "a", type: Forms.TEXT, label: "A", required: true, placeholder: "YYYY" },
            { name: "b", type: Forms.TEXT, label: "B", required: true, placeholder: "YYYY" },
            { name: "c", type: Forms.TEXT, label: "C", required: true, placeholder: "YYYY" },
            { name: "d", type: Forms.SECRET, label: "Secret", required: true, placeholder: "YYYY" }
        ],
        onCompletion: testResponse,
        onUpdate: function (updatedName, form) {
            if ((updatedName === "which") || (updatedName === Forms.WILDCARD)) {
                let values = form.getValues();
                switch (("which" in values) ? values.which : Forms.WILDCARD) {
                    case Forms.WILDCARD:
                        form.showOnlyInputs (["which"], true);
                        break;
                    case "a":
                        form.showOnlyInputs (["which", "a"], true);
                        break;
                    case "b":
                        form.showOnlyInputs (["which", "b"], true);
                        break;
                    case "c":
                        form.showOnlyInputs (["which", "c"], true);
                        break;
                    case "d":
                        form.showOnlyInputs (["which", "d"], true);
                        break;
                }
            }
        }
    });
</script>
