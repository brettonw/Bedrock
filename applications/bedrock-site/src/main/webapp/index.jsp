<%@ page import="com.brettonw.bedrock.Service" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/png" href="img/icon.png?v=1"/>
    <link rel="stylesheet" href="dist/latest/bedrock.css" />
    <meta name="viewport" content="width=920,initial-scale=1,user-scalable=yes"/>
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
            Usage:
            <pre style="font-size:10px;">&lt;link rel="stylesheet" href="https://bedrock.brettonw.com/dist/<%=Service.getBedrockVersion ()%>/bedrock.css"/>
&lt;script src="https://bedrock.brettonw.com/dist/<%=Service.getBedrockVersion ()%>/bedrock.js">&lt;/script></pre>
        </div>

        <h2>Examples</h2>
        <div class="description-div">
            <ul>
                <li><a href="examples/combobox.html">ComboBox</a></li>
                <li><a href="examples/database">Database</a></li>
                <li><a href="examples/forms.html">Forms</a></li>
                <li><a href="examples/html.html">HTML</a></li>
                <li><a href="examples/http.html">HTTP</a></li>
            </ul>
        </div>
    </div>
</div>
<div class="content-center footer">Find it at <a class="footer-link" href="https://github.com/brettonw/bedrock">brettonw/Bedrock</a></div>

</body>
</html>
