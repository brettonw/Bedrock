Bedrock.Cookie = function () {
    let $ = Object.create (null);

    $.set = function (name, value, expireDays = 30) {
        let date = new Date ();
        date.setTime (date.getTime () + (expireDays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + date.toUTCString ();
        document.cookie = name + "=" + value + "; " + expires + "; SameSite=strict; path=/";
    };

    $.get = function (name) {
        let find = name + "=";
        let decodedCookie = decodeURIComponent (document.cookie);
        let cookieArray = decodedCookie.split (";");
        for (let cookie of cookieArray) {
            cookie = cookie.trim();
            let index = cookie.indexOf (find);
            if (index >= 0) {
                return cookie.substring (index + find.length);
            }
        }
        return "";
    };

    $.remove = function (name) {
        this.set (name, "", -1);
    };

    $.replace = function (name, value, expireDays) {
        this.set (name, "", -1);
        this.set (name, value, expireDays);
    };

    $.resetAll = function () {
        let decodedCookie = decodeURIComponent (document.cookie);
        let cookieArray = decodedCookie.split (";");
        for (let cookie of cookieArray) {
            let name = cookie.split ("=")[0];
            name = name.replace (/^\s*/, "");
            name = name.replace (/\s*$/, "");
            this.set (name, "", -1);
        }
    };

    return $;
} ();

