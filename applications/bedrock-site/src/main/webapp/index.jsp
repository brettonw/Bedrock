<%@include file="includes/header.jsp" %>
<h1>Bedrock</h1>
<div class="container-div">
    <h2>About</h2>
    <div class="description-div">
        <p>Bedrock is a tool for quickly building lightweight micro-services in Java, using JSON for communications.</p>
    </div>

    <h2>Developer</h2>
    <div class="description-div">
        <ul>
            <li><a href="interface.jsp">Test Interface</a> - an example of the bedrock service and the service descriptor. </li>
            <li>Find the sources on Github @ <a href="https://github.com/brettonw/bedrock">brettonw/Bedrock</a>.</li>
        </ul>
    </div>

    <h2>Documentation</h2>
    <div class="description-div">
        <h3>Java</h3>
        <ul>
            <li><a href="<%= request.getContextPath() %>/dist/<%= Service.getBedrockVersion() %>/docs/bag/">Bag</a></li>
            <li><a href="<%= request.getContextPath() %>/dist/<%= Service.getBedrockVersion() %>/docs/secret/">Secret</a></li>
            <li><a href="<%= request.getContextPath() %>/dist/<%= Service.getBedrockVersion() %>/docs/database/">Database</a></li>
            <li><a href="<%= request.getContextPath() %>/dist/<%= Service.getBedrockVersion() %>/docs/service-base/">Service-Base</a></li>
            <li><a href="<%= request.getContextPath() %>/dist/<%= Service.getBedrockVersion() %>/docs/servlet-tester/">Servlet-Tester</a></li>
        </ul>

        <h3>Javascript</h3>
        <ul>
            <li><a href="<%= request.getContextPath() %>/dist/<%= Service.getBedrockVersion() %>/docs/bedrock/">Bedrock</a></li>
        </ul>

        <p style="margin: 12px 0;">USAGE:</p>
        <pre class="code-pre">&lt;link rel="stylesheet" href="https://bedrock.brettonw.com/dist/<%=Service.getBedrockVersion ()%>/bedrock.css"/>
&lt;script src="https://bedrock.brettonw.com/dist/<%=Service.getBedrockVersion ()%>/bedrock.js">&lt;/script></pre>
    </div>

    <h2>Examples</h2>
    <div class="description-div">
        <ul>
            <li><a href="<%= request.getContextPath() %>/examples/combobox.jsp">ComboBox</a></li>
            <li><a href="<%= request.getContextPath() %>/examples/database">Database</a></li>
            <li><a href="<%= request.getContextPath() %>/examples/forms.jsp">Forms</a></li>
            <li><a href="<%= request.getContextPath() %>/examples/html.jsp">HTML</a></li>
            <li><a href="<%= request.getContextPath() %>/examples/http.jsp">HTTP</a></li>
        </ul>
    </div>

    <h2>Admin</h2>
    <div class="description-div">
        <ul>
            <li><a href="<%= request.getContextPath() %>/lock.jsp">Lock</a></li>
        </ul>
    </div>
</div>
<div class="content-center footer">Built with <a class="footer-link" href="https://bedrock.brettonw.com">Bedrock</a></div>
<%@include file="includes/footer.jsp" %>
