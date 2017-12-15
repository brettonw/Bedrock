<%@ page import="com.brettonw.bedrock.Service" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/png" href="img/icon.png?v=1"/>
    <link rel="stylesheet" href="dist/latest/bedrock.css" />
    <title>Bedrock v.<%=Service.getBedrockVersion ()%></title>
</head>

<body>
<div id="help">
<h1>Bedrock v.<%=Service.getBedrockVersion ()%></h1>
    <div class="container-div">
        <h2>About</h2>
        <div class="description-div">
            Bedrock is a tool for quickly building lightweight micro-services in Java, using JSON for communications.
        </div>

        <h2>Test Interface</h2>
        <div class="description-div">
            This site features a <a href="interface.html">test interface</a> as an example of a simple Bedrock service.</p>
        </div>

        <h2>Documentation</h2>
        <div class="description-div">
            <h3>Java</h3>
            <ul>
                <li><a href="dist/latest/docs/bag/">Bag</a></li>
                <li><a href="dist/latest/docs/database/">Database</a></li>
                <li><a href="dist/latest/docs/service-base/">Service-Base</a></li>
                <li><a href="dist/latest/docs/servlet-tester/">Servlet-Tester</a></li>
            </ul>

            <h3>Javascript</h3>
            <ul>
                <li><a href="dist/latest/docs/bedrock/">Bedrock</a></li>
            </ul>
        </div>

        <h2>Examples</h2>
        <div class="description-div">
            Take a look at the <a href="examples">examples</a> of the usages for various Bedrock components.</p>
        </div>
    </div>
</div>
<div class="content-center footer">Find it at <a class="footer-link" href="https://github.com/brettonw/bedrock">brettonw/Bedrock</a></div>

</body>
</html>
