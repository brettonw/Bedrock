"use strict";

let addImageIcon = function () {

    // XXX this SHOULD be Bedrock code

    var h1s = Array.from (document.getElementsByTagName ("h1"));
    for (let h1 of h1s) {
        let div = document.createElement ("div");
        div.classList.add("header-wrapper");
        let root = h1.parentNode;
        root.insertBefore (div, h1);
        root.removeChild (h1);
        let internalDiv = document.createElement ("div");
        internalDiv.classList.add ("header-title");
        div.appendChild (internalDiv);
        internalDiv.appendChild (h1);

        let anchorDiv = document.createElement("div");
        anchorDiv.classList.add ("header-image");

        let anchorVersion = document.createElement("div");
        anchorVersion.innerHTML = "v.<%= Server.class.getPackage ().getImplementationVersion () %>";
        anchorVersion.classList.add ("header-version");
        anchorDiv.appendChild(anchorVersion);

        let a = document.createElement ("a");
        a.href = "<%= request.getContextPath() %>/";
        a.title = "Home";
        let img = document.createElement ("img");
        img.src = "img/icon.png";

        a.appendChild(img);
        anchorDiv.appendChild(a);
        div.appendChild (anchorDiv);
        return;
    }
    setTimeout (addImageIcon, 0.1);
};

setTimeout (addImageIcon, 0.1);
