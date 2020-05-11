<%@ page import="com.brettonw.bedrock.Service" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/png" href="../img/icon.png?v=1"/>
    <link rel="stylesheet" href="../dist/<%= Service.getBedrockVersion() %>/bedrock.css?1"/>
    <title>Bedrock Test</title>
</head>

<body>
<div id="help">
<h1>Bedrock Test</h1>
    <div class="container-div">
        <ul>
            <li><a href="combobox.jsp">ComboBox</a></li>
            <li><a href="database/">Database</a></li>
            <li><a href="forms.jsp">Forms</a></li>
            <li><a href="html.jsp">HTML</a></li>
            <li><a href="http.jsp">HTTP</a></li>
        </ul>
    </div>
</div>
<div class="content-center footer">Find it at <a class="footer-link" href="https://bedrock.brettonw.com">brettonw/Bedrock</a></div>

</body>
</html>
