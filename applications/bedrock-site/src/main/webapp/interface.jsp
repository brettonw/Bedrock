<%@ page import="com.brettonw.bedrock.Service" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/png" href="img/icon.png?v=1"/>
    <link rel="stylesheet" href="dist/<%= Service.getBedrockVersion() %>/bedrock.css?1"/>
    <title>Untitled</title>
</head>
<body>
<div id="service-descriptor-container"></div>
</body>
</html>

<script src="dist/<%= Service.getBedrockVersion() %>/bedrock-debug.js"></script>
<script>
    Bedrock.ServiceDescriptor.display ("service-descriptor-container");
</script>
