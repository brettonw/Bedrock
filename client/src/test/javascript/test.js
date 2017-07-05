var TestContainer = function () {
    var _ = Object.create (null);

    // test design philosophy is to be verbose on failure, and silent on pass
    let assertEquals = function (msg, a, b) {
        a = (!isNaN (a)) ? Utility.fixNum (a) : a;
        b = (!isNaN (b)) ? Utility.fixNum (b) : b;
        if (a != b) {
            LOG (LogLevel.ERROR, "(FAIL ASSERTION) " + msg + " (" + a + " == " + b + ")");
            return false;
        }
        return true;
    };

    let assertArrayEquals = function (msg, a, b) {
        if (a.length == b.length) {
            for (let i = 0; i < a.length; ++i) {
                if (!assertEquals(msg + "[" + i + "]", a[i], b[i])) {
                    return false;
                }
            }
            return true;
        } else {
            LOG (LogLevel.ERROR, msg + " (mismatched arrays, FAIL ASSERTION)");
            return false;
        }
    };

    let tests = [
        function () {
            LOG (LogLevel.INFO, "Test...");
            assertEquals("One", 1, 1);
            assertEquals("Two", 2.0, 2.0);
        },
        function () {
            LOG (LogLevel.INFO, "Test...");
            assertEquals ("One", 1, 1);
            assertEquals ("Two", 2.0, 2.0);
        }
    ];

    _.runTests = function () {
        LOG (LogLevel.INFO, "Running Tests...");
        for (let test of tests) {
            test ();
        }
        LOG (LogLevel.INFO, "Finished Running Tests.");
    };

    return _;
} ();

TestContainer.runTests();
