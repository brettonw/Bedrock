<%@ page import="com.brettonw.bedrock.Service" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Html</title>
    <link rel="stylesheet" href="../dist/<%= Service.getBedrockVersion() %>/bedrock.css?1"/>
    <link rel="icon" type="image/png" href="../img/icon.png?1"/>
</head>

<style>
    .row {
        margin: 5px auto;
    }

    .row-element {
        display: inline-block;
        width: 50px;
        text-align: center;
    }
</style>

<body>
</body>
</html>

<script src="../dist/<%= Service.getBedrockVersion() %>/bedrock-debug.js"></script>
<script>
    let Bldr = Bedrock.Html.Builder;
    let body = document.getElementsByTagName("body")[0];
    body.appendChild(Bldr
        .begin("div", {})

        .begin ("div", { class: "row" })
        .add ("div", { class: "row-element", innerHTML: "1" })
        .add ("div", { class: "row-element", innerHTML: "left" })
        .add ("div", { class: "row-element", innerHTML: "right" })
        .end ()

        .begin ("div", { class: "row" })
        .add ("div", { class: "row-element", innerHTML: "2" })
        .add ("div", { class: "row-element", innerHTML: "left" })
        .add ("div", { class: "row-element", innerHTML: "right" })
        .end ()

        .begin ("div", { class: "row" })
        .add ("div", { class: "row-element", innerHTML: "3" })
        .add ("div", { class: "row-element", innerHTML: "left" })
        .add ("div", { class: "row-element", innerHTML: "right" })
        .end ()

        .begin ("div", { class: "row" })
        .add ("div", { class: "row-element", innerHTML: "4" })
        .add ("div", { class: "row-element", innerHTML: "left" })
        .add ("div", { class: "row-element", innerHTML: "right" })
        .end ()

        .begin ("div", { class: "row" })
        .add ("div", { class: "row-element", innerHTML: "5" })
        .add ("div", { class: "row-element", innerHTML: "left" })
        .add ("div", { class: "row-element", innerHTML: "right" })
        .end ()
        .end ()
    );
</script>
