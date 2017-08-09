package com.brettonw.bedrock.bag;

import com.brettonw.bedrock.bag.formats.MimeType;
import com.brettonw.bedrock.bag.test.TestClassA;
import com.brettonw.bedrock.bag.test.TestEnumXYZ;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertNotNull;

public class BagObjectTest {
    private static final Logger log = LogManager.getLogger (BagObject.class);

    @Test
    public void testBagObject() {
        BagObject bagObject = new BagObject ();
        bagObject.put ("name", "bretton wade");
        bagObject.put ("phone", "410.791.7108");
        bagObject.put ("address", "410 Charles St");
        bagObject.put ("city", "baltimore");
        bagObject.put ("state", "mx"); // note the typo that gets replaced...
        bagObject.put ("zip", "21201");
        bagObject.put ("state", "md");

        BagTest.report(bagObject.getCount (), 6, "BagObject simple count");

        String keys[] = bagObject.keys ();
        assertArrayEquals("Check keys", new String[]{"address", "city", "name", "phone", "state", "zip"}, keys);
        String state = bagObject.getString ("state");
        BagTest.report (state, "md", "Check state");

        // test removing an object
        bagObject.remove ("phone");
        BagTest.report(bagObject.getCount (), 5, "BagObject simple removed count");
        BagTest.report(bagObject.getString ("phone"), null, "BagObject simple retrieve removed element");

        // test a couple of exception cases
        BagTest.report(bagObject.getBagObject ("state"), null, "BagObject simple retrieve incorrect element type as BagObject");
        BagTest.report(bagObject.getBagArray ("state"), null, "BagObject simple retrieve incorrect element type as BagArray");
    }

    @Test
    public void testSimpleStringSerialization() {
            // first round, a simple string serialization example
            BagObject testObject = new BagObject ();
            testObject.put ("First Name", "Bretton");

            BagTest.report (testObject.getString ("First Name"), "Bretton", "BagObject simple string extraction");

            String testString = testObject.toString ();
            BagTest.report (testString, testString, "BagObject simple ToString exercise (" + testString + ")");

            BagObject recon = BagObjectFrom.string (testString);
            assertNotNull (recon);
            String reconString = recon.toString ();
            BagTest.report (reconString, testString, "BagObject simple reconstitution");
    }

    @Test
    public void testComplexStringSerialization() {
            // second round, a bit more sophisticated
            BagObject testObject = new BagObject();
            testObject.put("First Name", "Bretton");
            testObject.put("Last Name", "Wade");
            testObject.put("Weight", 220.5);
            testObject.put("Married", true);
            testObject.put("Children", "");

            BagTest.report (testObject.getString ("First Name"), "Bretton", "BagObject simple string extraction");
            BagTest.report (testObject.getString ("Last Name"), "Wade", "BagObject simple string extraction");
            BagTest.report (testObject.getBoolean ("Married"), true, "BagObject simple bool extraction");
            BagTest.report (testObject.getDouble ("Weight"), 220.5, "BagObject simple double extraction");
            BagTest.report (testObject.getFloat ("Weight"), 220.5f, "BagObject simple float extraction");
            BagTest.report (testObject.getString ("Children"), "", "BagObject simple empty extraction");

            String testString = testObject.toString ();
            BagTest.report (testString, testString, "BagObject simple ToString exercise (" + testString + ")");

            BagObject recon = BagObjectFrom.string (testString);
            assertNotNull (recon);
            String reconString = recon.toString ();
            BagTest.report (reconString, testString, "BagObject simple reconstitution");
    }

    @Test
    public void testEscapedStrings() {
            // test an escaped string
            String escapedString = "a longer string with a \\\"quote from shakespeare\\\" in \\\"it\\\"";
            BagObject testObject = BagObject.open  ("escaped", escapedString);
            BagTest.report (testObject.getString ("escaped"), escapedString, "BagObject simple test escaped string");
            String testString = testObject.toString ();
            BagObject recon = BagObjectFrom.string (testString);
            BagTest.report (recon.getString ("escaped"), escapedString, "BagObject simple test escaped string from reconstituted bagobject");
    }

    @Test
    public void testBarePojo() {
        // try to put a bare POJO into a bagObject
        try {
            BagObject bareBagObject = BagObject.open  ("barecheck", new TestClassA (2, false, 123.456, "pdq", TestEnumXYZ.DEF));
            BagTest.report (bareBagObject != null, false, "BagObject - test bare POJO rejection");
        } catch (UnsupportedTypeException exception) {
            BagTest.report (true, true, "BagObject - test bare POJO rejection");
        }
    }

    @Test
    public void testSubObject() {
            // on with the show
            BagObject dateObject = new BagObject ()
                    .put ("Year", 2015)
                    .put ("Month", 11)
                    .put ("Day", 18);

            BagTest.report (dateObject.getInteger ("Month"), 11, "BagObject simple int extraction");

            BagObject testObject = new BagObject()
                    .put("First Name", "Bretton")
                    .put("Last Name", "Wade")
                    .put("Weight", 220.5)
                    .put("Married", true)
                    .put("Children", "")
                    .put ("DOB", dateObject);
            String testString = testObject.toString ();
            BagTest.report (testString, testString, "BagObject complex ToString exercise (" + testString + ")");

            BagObject recon = BagObjectFrom.string (testString);
            String reconString = recon.toString ();
            BagTest.report (recon, testObject, "BagObject complex object equals");
            BagTest.report (reconString, testString, "BagObject complex reconsititution");

            BagTest.report (recon.getBoolean ("Married"), true, "BagObject complex bedrock/bool extraction");
            BagTest.report (recon.getDouble ("Weight"), 220.5, "BagObject complex bedrock/double extraction");
            BagTest.report (recon.getBagObject ("DOB").getInteger ("Year"), 2015, "BagObject complex bedrock/int extraction");

            BagTest.report (recon.getBoolean ("DOB"), null, "BagObject simple bad type request (should be null)");
            BagTest.report (recon.getString ("Joseph"), null, "BagObject simple bad key request (should be null)");
    }

    @Test
    public void testEmptyObject() {
            // test reconstruction of an empty object
            BagObject bagObject = new BagObject ();
            String testString = bagObject.toString ();
            BagObject reconBagObject = BagObjectFrom.string (testString);
            BagTest.report (reconBagObject.toString (), testString, "BagObject - reconstitute an empty object");
    }

    @Test
    public void testHandAuthoredJson() {
            // test a reconstruction from a hand-authored JSON string
            String jsonString = " { Married:\"true\",   \"Children\": [] ,       \"First Name\": \"Bretton\" , \"Last Name\" : \"Wade\" , \"Weight\":\"220.5\", Size:8 }";
            BagObject bagObject = BagObjectFrom.string (jsonString, MimeType.JSON);
            BagTest.report (bagObject.getString ("Last Name"), "Wade", "BagObject - reconstitute from a hand-crafted string should pass");
            BagTest.report (bagObject.has ("Married"), true, "BagObject - check that a tag is present");
            BagTest.report (bagObject.has ("Junk"), false, "BagObject - check that a tag is not present");
            BagTest.report (bagObject.getBoolean ("Married"), true, "BagObject - reconstitute from a hand-crafted string with bare names should pass");
            BagTest.report (bagObject.getInteger ("Size"), 8, "BagObject - reconstitute from a hand-crafted string with bare values should pass");
            BagTest.report (bagObject.getBagArray ("Children").getCount (), 0, "BagObject - reconstitute from a hand-crafted string with empty array should be size 0");
    }

    @Test
    public void testBogusJson() {
            // test a reconstruction from a bogus string
            String bogusString = "{\"Children\":\"\",\"First Name\":\"Bretton\",\"\"Wade\",\"Married\":\"true\",\"Weight\":\"220.5\"}";
            BagObject bogusBagObject = BagObjectFrom.string (bogusString);
            BagTest.report (bogusBagObject, null, "BagObject - reconstitute from a bogus string should fail");
    }

    @Test
    public void testHierarchical() {
        // hierarchical values
        BagObject bagObject = BagObject.open  ("com/brettonw/bedrock/name", "test");
        BagTest.report (bagObject.has ("com/brettonw/test"), false, "BagObject - test that an incorrect path returns false");
        BagTest.report (bagObject.has ("com/brettonw/bedrock/name/xxx"), false, "BagObject - test that a longer incorrect path returns false");
        BagTest.report (bagObject.has ("com/brettonw/bedrock/name"), true, "BagObject - test that a correct path returns true");
        BagTest.report (bagObject.getString ("com/brettonw/bedrock/name"), "test", "BagObject - test that a hierarchical fetch yields the correct result");
        BagTest.report (bagObject.getBagObject ("com/bretton/bedrock"), null, "BagObject - test that an incorrect hierarchical fetch yields null");
        bagObject.remove ("com/brettonw/bedrock");
        BagTest.report (bagObject.has ("com/brettonw/bedrock/name"), false, "BagObject - test that a path is correctly removed");
    }

    @Test
    public void testAdd() {
        // add
        BagObject bagObject = new BagObject ().add ("com/bretton/testArray", 5).add ("com/bretton/testArray", 6).add ("com/bretton/testArray", 7).add ("com/bretton/testArray", null).add ("com/bretton/testArray", 9);
        BagTest.report (bagObject.getBagArray ("com/bretton/testArray").getInteger (2), 7, "BagObject - test array get");

        bagObject = new BagObject ().add ("null", null);
        BagTest.report (bagObject.getBagArray ("null").getCount (), 1, "BagObject - test case 1, add null to non existent key");

        bagObject = new BagObject ().add ("null", 5).add ("null", null);
        BagTest.report (bagObject.getBagArray ("null").getCount (), 2, "BagObject - test case 3, add null to non array key");
    }

    @Test
    public void testFileAndStream() {
        // file and stream tests
        try {
            File testFile = new File ("data", "bagObject.json");
            BagObject bagObject = BagObjectFrom.file (testFile);
            BagTest.report (bagObject != null, true, "BagObject - verify a successful load from a file - 1");

            testFile = new File ("data", "bagObject.txt");
            bagObject = BagObjectFrom.file (testFile);
            BagTest.report (bagObject != null, true, "BagObject - verify a successful load from a file - 1");

            bagObject = BagObjectFrom.file (testFile, MimeType.JSON);
            BagTest.report (bagObject != null, true, "BagObject - verify a successful load from a file - 2");
            bagObject = BagObjectFrom.inputStream (new FileInputStream (testFile), MimeType.JSON);
            BagTest.report (bagObject.getString ("glossary/title"), "example glossary", "BagObject - basic test that load from stream succeeds - 1");
            BagTest.report (bagObject.getString ("glossary/GlossDiv/GlossList/GlossEntry/ID"), "SGML", "BagObject - complex test that load from stream succeeds");
        } catch (IOException exception) {
            BagTest.report (false, true, exception.getMessage ());
        }

    }

    @Test
    public void testJohnF() {
            File testFile = new File ("data", "JohnF.json");
            BagObject bagObject = BagObjectFrom.file (testFile);
            BagTest.report (bagObject != null, true, "BagObject - test regression case on complex file successfully loaded");
    }

    @Test
    public void testJohnF2() {
            File testFile = new File ("data", "JohnF2.json");
            BagObject bagObject = BagObjectFrom.file (testFile);
            BagTest.report (bagObject != null, true, "BagObject - test regression case on complex file 2 successfully loaded");
    }

    @Test
    public void testBadFiles() {
        BagTest.report (BagObjectFrom.file (new File ("data", "badFile.json")), null, "BagObject - Test that a bad file fails to parse 1 (check error message in log)");
        BagTest.report (BagObjectFrom.file (new File ("data", "badFile2.json")), null, "BagObject - Test that a bad file fails to parse 2 (check error message in log)");
        BagTest.report (BagObjectFrom.file (new File ("data", "badFile3.json")), null, "BagObject - Test that a bad file fails to parse 3 (check error message in log)");
    }

    @Test
    public void testNotFound() {
        try {
            BagObject bagObject = new BagObject ()
                    .put ("x", "y")
                    .put ("a", "b")
                    .put ("c", true)
                    .put ("d", 3.141592654)
                    .put ("e", 1234567L)
                    .put ("f", BagObject.open  ("hello", "world"))
                    .put ("g", BagArray.open (123));

            // test the copy
            bagObject = new BagObject (bagObject);

            BagTest.report (bagObject.getString ("x"), "y", "BagObject - Test that 'notFound' method still correctly returns requested string value");
            BagTest.report (bagObject.getString ("x", () -> "xxx"), "y", "BagObject - Test that 'notFound' method still correctly returns requested string value");
            BagTest.report (bagObject.getString ("xxx", () -> "yyy"), "yyy", "BagObject - Test that 'notFound' method correctly returns notFound string value");

            BagTest.report (bagObject.getBoolean ("c"), true, "BagObject - Test that 'notFound' method still correctly returns requested boolean value");
            BagTest.report (bagObject.getBoolean ("c", () -> false), true, "BagObject - Test that 'notFound' method still correctly returns requested boolean value");
            BagTest.report (bagObject.getBoolean ("ccc", () -> true), true, "BagObject - Test that 'notFound' method correctly returns notFound boolean value");

            BagTest.report (bagObject.getInteger ("e"), 1234567, "BagObject - Test that 'notFound' method still correctly returns requested integer value");
            BagTest.report (bagObject.getInteger ("e", () -> 345), 1234567, "BagObject - Test that 'notFound' method still correctly returns requested integer value");
            BagTest.report (bagObject.getInteger ("eee", () -> 345), 345, "BagObject - Test that 'notFound' method correctly returns notFound integer value");

            BagTest.report (bagObject.getLong ("e"), 1234567L, "BagObject - Test that 'notFound' method still correctly returns requested long value");
            BagTest.report (bagObject.getLong ("e", () -> 345L), 1234567L, "BagObject - Test that 'notFound' method still correctly returns requested long value");
            BagTest.report (bagObject.getLong ("eee", () -> 345L), 345L, "BagObject - Test that 'notFound' method correctly returns notFound long value");

            BagTest.report (bagObject.getFloat ("d"), 3.141592654f, "BagObject - Test that 'notFound' method still correctly returns requested float value");
            BagTest.report (bagObject.getFloat ("d", () -> 6.28f), 3.141592654f, "BagObject - Test that 'notFound' method still correctly returns requested float value");
            BagTest.report (bagObject.getFloat ("ddd", () -> 6.28f), 6.28f, "BagObject - Test that 'notFound' method correctly returns notFound float value");

            BagTest.report (bagObject.getDouble ("d"), 3.141592654, "BagObject - Test that 'notFound' method still correctly returns requested double value");
            BagTest.report (bagObject.getDouble ("d", () -> 6.28), 3.141592654, "BagObject - Test that 'notFound' method still correctly returns requested double value");
            BagTest.report (bagObject.getDouble ("ddd", () -> 6.28), 6.28, "BagObject - Test that 'notFound' method correctly returns notFound double value");

            BagTest.report (bagObject.getBagObject ("q"), null, "BagObject - test that method correctly fails on not found BagObject");
            BagTest.report (bagObject.getBagObject ("f", () -> BagObject.open  ("hello", "moto")).getString ("hello"), "world", "BagObject - test that 'notFound' method correctly returns found BagObject");
            BagTest.report (bagObject.getBagObject ("fff", () -> BagObject.open  ("hello", "moto")).getString ("hello"), "moto", "BagObject - test that 'notFound' method correctly returns notFound BagObject");

            BagTest.report (bagObject.getBagArray ("q"), null, "BagObject - test that method correctly fails on not found BagObject");
            BagTest.report (bagObject.getBagArray ("g", () -> BagArray.open (345)).getInteger (0), 123, "BagObject - test that 'notFound' method correctly returns found BagArray");
            BagTest.report (bagObject.getBagArray ("ggg", () -> BagArray.open (345)).getInteger (0), 345, "BagObject - test that 'notFound' method correctly returns notFound BagArray");

            try {
                bagObject = new BagObject ((BagObject) null);
                BagTest.report (false, true, "BagObject - clone of null should fail");
            } catch (Exception exception) {
                //assertEquals (bagObject, null);
                BagTest.report (false, false, "BagObject - clone of null should fail");
            }
        } catch (Exception exception) {
            BagTest.report (true, false, "BagObject - any exception is a failure");
        }
    }

    @Test
    public void testCopyOfEmptyObject () {
        try {
            BagObject emptyObject = new BagObject ();
            BagObject copy = new BagObject (emptyObject);
            BagTest.report (emptyObject, copy, "Copy of empty object should succeed");
            copy.put ("test", "x");
            BagTest.report (copy.getString ("test"), "x", "Copy of empty object should yield usable object");
        } catch (Exception exception) {
            BagTest.report (true, false, "Copy of empty object should succeed");
        }
    }

    @Test
    public void testHashCode () {
        BagObject bagObject = BagObject.open  ("x", "abcdegoldfish");
        int hash = bagObject.hashCode ();
        BagTest.report (hash != 0, true, "test hash code (" + hash + ")");
    }

    @Test
    public void testGetWithCopyConstructorFallback () throws IOException {
        BagObject bagObject = BagObject.open  ("x", "y");
        BagObject bagObject2 = BagObject.open  ("m", "n");
        BagObject fetched = bagObject.getBagObject ("q", () -> new BagObject (bagObject2));
        BagTest.report (fetched.getString ("m"), "n", "copy constructor doesn't throw");
    }

    @Test
    public void testBogusInstantiationFallback () {
        BagObject bagObject = BagObject.open  ("x", "y");
        BagObject fetched = bagObject.getBagObject ("q", () -> BagObjectFrom.file (new File ("bogus.txt")));
        BagTest.report (fetched, null, "BagObject should fail quietly");
    }

    @Test
    public void testEquals () {
        BagObject bagObject = BagObject.open ("x", "y" );
        BagObject bagObject2 = BagObject.open ("x", "y" );
        BagObject bagObject3 = BagObject.open ("x", "x" );
        BagTest.report (bagObject.equals (bagObject), true, "BagObject should be equal to itself" );
        BagTest.report (bagObject.equals (bagObject2), true, "BagObject should be equal to an equivalent bedrock" );
        BagTest.report (bagObject.equals (bagObject3), false, "BagObject should not be equal to a different bedrock" );
        BagTest.report (bagObject.equals (null), false, "BagObject should not be equal to null" );
        BagTest.report (bagObject.equals (new Integer (5)), false, "BagObject should not be equal to a non-bedrock object" );
    }

    @Test
    public void testMerge () {
        BagObject bagObject = BagObject.open ("x", "X" );
        BagObject bagObject2 = BagObject.open ("y", "Y" );
        BagObject bagObject3 = BagObject.open ("z", "Z" );

        BagObject mergedBagObject = BagObject.merge (bagObject, bagObject2, bagObject3);
        BagObject expectBagObject = BagObject.open ("x", "X" ).put ("y", "Y" ).put ("z", "Z" );
        BagTest.report (mergedBagObject.equals (expectBagObject), true, "Merged BagObject matches Expected BgObject");
    }
}
