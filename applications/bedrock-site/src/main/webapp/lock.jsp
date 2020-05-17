<%@include file="includes/header.jsp" %>
<h1>Bedrock</h1>
<div class="container-div">
    <h2>Admin Console</h2>

    <hr>
    <h3>Lock</h3>
    <div id="lock-form-container"></div>

</div>
<div class="content-center footer">Built with <a class="footer-link" href="https://bedrock.brettonw.com">Bedrock</a></div>
<%@include file="includes/footer.jsp" %>

<script>
    const LOCK = "lock";
    const SECRET = "secret";

    Bedrock.Forms.new ({
        name: LOCK,
        div: "lock-form-container",
        inputs: [
            { name: SECRET, type: Bedrock.Forms.SECRET, label: "Secret:", required: true, placeholder: "xxxx1234" }
        ],
        completion: function (form) {
            let postData = form.getValues ();
            Bedrock.ServiceBase.post ({ event: LOCK }, JSON.stringify (postData), function (response) {
                if (typeof (response) !== "undefined") {
                    alert (JSON.stringify (response, null, 4));
                } else {
                    // this is the success function, but these events may not have a response...
                    alert ("OK");
                }
                form.reset ();
            });
        }
    });
</script>
