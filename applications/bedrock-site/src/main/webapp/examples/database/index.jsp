<%@ page import="com.brettonw.bedrock.Service" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Database</title>
    <link rel="stylesheet" href="../../dist/<%= Service.getBedrockVersion() %>/bedrock.css?8"/>
    <link rel="stylesheet" href="index.css?8"/>
    <link rel="icon" type="image/png" href="../../img/icon.png?1"/>
</head>

<body class="noScroll" onload="main ();">
<div id="bedrock-database-container"></div>
<div id="bedrock-database-display"></div>
<div id="bedrock-record-display"></div>
</body>
</html>

<script src="../../dist/<%= Service.getBedrockVersion() %>/bedrock-debug.js?9"></script>
<script src="index.js?10"></script>
