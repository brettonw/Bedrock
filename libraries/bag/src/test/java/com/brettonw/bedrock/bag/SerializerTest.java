package com.brettonw.bedrock.bag;

import com.brettonw.bedrock.bag.test.*;
import com.brettonw.bedrock.logger.LogManager;
import com.brettonw.bedrock.logger.Logger;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;

public class SerializerTest {
    private static final Logger log = LogManager.getLogger (SerializerTest.class);

    @Test
    public void testBareType() {
        // serialize a bare type
        int x = 24;
        BagObject bagObject = Serializer.toBagObject (x);
        log.info (bagObject.toString ());
        int deserializedX = Serializer.fromBagObject (bagObject);
        BagTest.report (deserializedX, x, "Serializer - test bare type");
    }

    @Test
    public void testNewSerializer() {
        new Serializer ();
    }

    @Test
    public void testPojo() {
        // serialize a POJO
        TestClassA testClass = new TestClassA (5, true, 123.0, "pdq", TestEnumXYZ.ABC);
        BagObject bagObject = Serializer.toBagObject (testClass);
        log.info (bagObject.toString ());

        TestClassA reconClass = Serializer.fromBagObject (bagObject);
        BagObject reconBagObject = Serializer.toBagObject (reconClass);
        BagTest.report (reconBagObject.toString (),bagObject.toString (), "Serializer test round trip");
    }

    @Test
    public void testUnwrappedPojo() {
        // serialize a POJO
        TestClassA testClass = new TestClassA (5, true, 123.0, "pdq", TestEnumXYZ.ABC);
        BagObject serialized = Serializer.toBagObject (testClass);
        BagObject bagObject = Serializer.Unwrap (serialized);
        log.info (bagObject.toString ());

        TestClassA reconClass = Serializer.fromBagAsType (bagObject, TestClassA.class);
        BagObject reconBagObject = Serializer.toBagObject (reconClass);
        BagTest.report (reconBagObject.toString (), serialized.toString (), "Serializer test round trip");
    }

    @Test
    public void testArray() {
        Integer testArray[] = { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 };
        BagObject bagObject = Serializer.toBagObject (testArray);
        log.info (bagObject.toString ());
        Integer reconArray[] = Serializer.fromBagObject (bagObject);
        assertArrayEquals(testArray, reconArray, "Check array reconstitution");

        int testArray2[] = { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 };
        bagObject = Serializer.toBagObject (testArray2);
        log.info (bagObject.toString ());
        int reconArray2[] = Serializer.fromBagObject (bagObject);
        assertArrayEquals(testArray2, reconArray2, "Check array reconstitution");

        int testArray3[][] = { {0,0}, {1,1}, {2,2} };
        bagObject = Serializer.toBagObject (testArray3);
        log.info (bagObject.toString ());
        int reconArray3[][] = Serializer.fromBagObject (bagObject);
        assertArrayEquals(testArray3, reconArray3, "Check array reconstitution");
    }

    @Test
    public void testArrayList() {
        ArrayList<Integer> arrayList = new ArrayList<> (3);
        arrayList.add(1);
        arrayList.add (3);
        arrayList.add (5);
        BagObject bagObject = Serializer.toBagObject (arrayList);
        log.info (bagObject.toString ());
        ArrayList<Integer> reconArrayList = Serializer.fromBagObject (bagObject);
        assertArrayEquals (arrayList.toArray (), reconArrayList.toArray (), "Check array list reconstitution");
    }

    @Test
    public void testMap() {
        HashMap<String, Integer> hashMap = new HashMap<> (3);
        hashMap.put ("A", 1);
        hashMap.put ("B", 3);
        hashMap.put ("C", 5);
        BagObject bagObject = Serializer.toBagObject (hashMap);
        log.info (bagObject.toString ());
        HashMap<String, Integer> reconHashMap = Serializer.fromBagObject (bagObject);
        assertArrayEquals (hashMap.keySet ().toArray (), reconHashMap.keySet ().toArray (), "Check hash map reconstitution - keys");
        assertArrayEquals (hashMap.values ().toArray (), reconHashMap.values ().toArray (), "Check hash map reconstitution - values");

        // add a few other simple serializations...
        BagObject anotherBagObject = Serializer.toBagObject (bagObject);
        BagTest.report (Serializer.fromBagObject (anotherBagObject), bagObject, "Serializer test reconstituting a bedrock object");
    }

    @Test
    public void testBagArray() {
        BagArray    bagArray = new BagArray (2).add (1).add (7.0);
        BagObject anotherBagObject = Serializer.toBagObject (bagArray);
        BagTest.report (Serializer.fromBagObject (anotherBagObject), bagArray, "Serializer test reconstituting a bedrock array");
        log.info ("got here");
    }

    @Test
    public void testVersionHandler() {
        try {
            BagObject mockup = new BagObject ()
                    .put (Serializer.VERSION_KEY, "0.9")
                    .put (Serializer.VALUE_KEY, new BagObject ()
                            .put (Serializer.TYPE_KEY, "java.lang.String")
                            .put (Serializer.VALUE_KEY, "PDQ")
                    );
            String serializedString = mockup.toString ();
            BagObject serializedStringBagObject = BagObjectFrom.string (serializedString);
            String deserializedString = Serializer.fromBagObject (serializedStringBagObject);
            BagTest.report (serializedString, deserializedString, "Serializer test reconstituting a string with a bad version should throw exception");
        } catch (BadVersionException exception) {
            BagTest.report (false, false, "Serializer test reconstituting a string with a bad version should fail");
        }
    }

    @Test
    public void testError() {
        BagObject mockup = new BagObject ()
                .put (Serializer.VERSION_KEY, Serializer.SERIALIZER_VERSION)
                .put (Serializer.VALUE_KEY, new BagObject ()
                        .put (Serializer.TYPE_KEY, "java.lang.Sring")
                        .put (Serializer.VALUE_KEY, "PDQ")
                );
        String serializedString = mockup.toString ();
        BagObject serializedStringBagObject = BagObjectFrom.string (serializedString);
        String deserializedString = Serializer.fromBagObject (serializedStringBagObject);
        BagTest.report (deserializedString, null, "Serializer test reconstituting a modified source");
    }

    @Test
    public void testNonPojo() {
        TestClassC testClassC = new TestClassC (1, 2L, 3.0f, 10, 20L, 30.0f);
        BagObject bagObjectC = Serializer.toBagObject (testClassC);
        log.info (bagObjectC.toString ());
        TestClassC  reconClassC = Serializer.fromBagObject (bagObjectC);
        BagTest.report (reconClassC.test (1, 2L, 3.0f, 10, 20L, 30.0f), true, "Serializer - Confirm reconstituted object matches original");
    }

    @Test
    public void testArrayTypes() {
        long testArrayLong[] = {0L, 1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L, 9L};
        BagObject bagObject = Serializer.toBagObject (testArrayLong);
        assertArrayEquals (testArrayLong, Serializer.fromBagObject (bagObject));

        short testArrayShort[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
        bagObject = Serializer.toBagObject (testArrayShort);
        assertArrayEquals (testArrayShort, Serializer.fromBagObject (bagObject));

        byte testArrayByte[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
        bagObject = Serializer.toBagObject (testArrayByte);
        assertArrayEquals (testArrayByte, Serializer.fromBagObject (bagObject));

        double testArrayDouble[] = {0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0};
        bagObject = Serializer.toBagObject (testArrayDouble);
        assertArrayEquals (testArrayDouble, Serializer.fromBagObject (bagObject), 1.0e-9);

        float testArrayFloat[] = {0.0f, 1.0f, 2.0f, 3.0f, 4.0f, 5.0f, 6.0f, 7.0f, 8.0f, 9.0f};
        bagObject = Serializer.toBagObject (testArrayFloat);
        assertArrayEquals (testArrayFloat, Serializer.fromBagObject (bagObject), 1.0e-6f);

        boolean testArrayBoolean[] = {true, false, true, false, true, false, true, false};
        bagObject = Serializer.toBagObject (testArrayBoolean);
        assertArrayEquals (testArrayBoolean, Serializer.fromBagObject (bagObject));

        char testArrayCharacter[] = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'};
        bagObject = Serializer.toBagObject (testArrayCharacter);
        assertArrayEquals (testArrayCharacter, Serializer.fromBagObject (bagObject));
    }

    @Test
    public void testBoxedArrayTypes() {
        Long testArrayLong[] = {0L, 1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L, 9L};
        BagObject bagObject = Serializer.toBagObject (testArrayLong);
        assertArrayEquals (testArrayLong, Serializer.fromBagObject (bagObject));

        Short testArrayShort[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
        bagObject = Serializer.toBagObject (testArrayShort);
        assertArrayEquals (testArrayShort, Serializer.fromBagObject (bagObject));

        Byte testArrayByte[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
        bagObject = Serializer.toBagObject (testArrayByte);
        assertArrayEquals (testArrayByte, Serializer.fromBagObject (bagObject));

        Double testArrayDouble[] = {0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0};
        bagObject = Serializer.toBagObject (testArrayDouble);
        assertArrayEquals (testArrayDouble, Serializer.fromBagObject (bagObject));

        Float testArrayFloat[] = {0.0f, 1.0f, 2.0f, 3.0f, 4.0f, 5.0f, 6.0f, 7.0f, 8.0f, 9.0f};
        bagObject = Serializer.toBagObject (testArrayFloat);
        assertArrayEquals (testArrayFloat, Serializer.fromBagObject (bagObject));

        Boolean testArrayBoolean[] = {true, false, true, false, true, false, true, false};
        bagObject = Serializer.toBagObject (testArrayBoolean);
        assertArrayEquals (testArrayBoolean, Serializer.fromBagObject (bagObject));

        Character testArrayCharacter[] = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'};
        bagObject = Serializer.toBagObject (testArrayCharacter);
        assertArrayEquals (testArrayCharacter, Serializer.fromBagObject (bagObject));
    }

    @Test
    public void testPojoArray() {
        TestClassA  testArrayA[] = {
                new TestClassA (1, true, 3.5, "Joe", TestEnumXYZ.ABC),
                new TestClassA (2, true, 3.6, "Dave", TestEnumXYZ.DEF),
                new TestClassA (3, false, 19.2, "Bret", TestEnumXYZ.GHI),
                new TestClassA (4, true, 4.5, "Roxy", TestEnumXYZ.GHI)
        };
        BagObject bagObject = Serializer.toBagObject (testArrayA);
        log.info (bagObject.toString ());
        TestClassA reconTestArrayA[] = Serializer.fromBagObject (bagObject);
        boolean pass = true;
        for (int i = 0, end = testArrayA.length; i < end; ++i) {
            TestClassA left = testArrayA[i];
            TestClassA right = reconTestArrayA[i];

            // not a *COMPLETE* test, but spot checking
            pass = pass && (left.abc.equals (right.abc)) && (left.sub.b == right.sub.b);
        }
        BagTest.report (pass, true, "Serializer - test array of complex POJOs");
    }

    @Test
    public void testBogusArrayString() {
        BagObject mockup = new BagObject ()
                .put (Serializer.VERSION_KEY, Serializer.SERIALIZER_VERSION)
                .put (Serializer.VALUE_KEY, new BagObject ()
                        .put (Serializer.TYPE_KEY, "[java.lang.Integer;")
                        .put (Serializer.VALUE_KEY, new BagArray ()
                                .add (BagObject.open  (Serializer.TYPE_KEY, "java.lang.Integer").put (Serializer.VALUE_KEY, 0))
                                .add (BagObject.open  (Serializer.TYPE_KEY, "java.lang.Integer").put (Serializer.VALUE_KEY, 1))
                                .add (BagObject.open  (Serializer.TYPE_KEY, "java.lang.Integer").put (Serializer.VALUE_KEY, 2))
                                .add (BagObject.open  (Serializer.TYPE_KEY, "java.lang.Integer").put (Serializer.VALUE_KEY, 3))
                                .add (BagObject.open  (Serializer.TYPE_KEY, "java.lang.Integer").put (Serializer.VALUE_KEY, 4))
                                .add (BagObject.open  (Serializer.TYPE_KEY, "java.lang.Integer").put (Serializer.VALUE_KEY, 5))
                                .add (BagObject.open  (Serializer.TYPE_KEY, "java.lang.Integer").put (Serializer.VALUE_KEY, 6))
                                .add (BagObject.open  (Serializer.TYPE_KEY, "java.lang.Integer").put (Serializer.VALUE_KEY, 7))
                                .add (BagObject.open  (Serializer.TYPE_KEY, "java.lang.Integer").put (Serializer.VALUE_KEY, 8))
                                .add (BagObject.open  (Serializer.TYPE_KEY, "java.lang.Integer").put (Serializer.VALUE_KEY, 9))
                        )
                );
        //String bogusArrayString = "{\"type\":\"[java.lang.Integer;\",\"v\":\"1.0\",\"value\":[{\"type\":\"java.lang.Integer\",\"v\":\"1.0\",\"value\":\"0\"},{\"type\":\"java.lang.Integer\",\"v\":\"1.0\",\"value\":\"1\"},{\"type\":\"java.lang.Integer\",\"v\":\"1.0\",\"value\":\"2\"},{\"type\":\"java.lang.Integer\",\"v\":\"1.0\",\"value\":\"3\"},{\"type\":\"java.lang.Integer\",\"v\":\"1.0\",\"value\":\"4\"},{\"type\":\"java.lang.Integer\",\"v\":\"1.0\",\"value\":\"5\"},{\"type\":\"java.lang.Integer\",\"v\":\"1.0\",\"value\":\"6\"},{\"type\":\"java.lang.Integer\",\"v\":\"1.0\",\"value\":\"7\"},{\"type\":\"java.lang.Integer\",\"v\":\"1.0\",\"value\":\"8\"},{\"type\":\"java.lang.Integer\",\"v\":\"1.0\",\"value\":\"9\"}]}";
        String bogusArrayString = mockup.toString ();
        BagObject bogusArray = BagObjectFrom.string (bogusArrayString);
        Object result = Serializer.fromBagObject (bogusArray);
        BagTest.report (result, null, "Serializer - test bogus array string");
    }

    @Test
    public void testTypeWithNoDefaultConstructor () {
        // deal with a type that has a no default constructor?
        TestClassD  tcd = new TestClassD ("x");
        BagObject bagObject = Serializer.toBagObject (tcd);
        log.info (bagObject.toString ());
        TestClassD  reconTcd = Serializer.fromBagObject (bagObject);
        BagTest.report (tcd, reconTcd, "Reconstructed TestClassD should match the original");
    }

    @Test
    public void testBogusType () {
        TestClassD  tcd = new TestClassD ("x");
        BagObject bagObject = Serializer.toBagObject (tcd);
        log.info (bagObject.toString ());
        try {
            TestClassE reconE = Serializer.fromBagObject (bagObject);
            BagTest.report  (tcd, reconE, "This should fail");
        } catch (ClassCastException exception) {
            BagTest.report (false, false, "Properly throw an exception if we can't cast the value");
        }
    }

    @Test
    public void testBadConstructorHandling () {
        // deal with a type that has a no default constructor and no registered extension
        TestClassD d = new TestClassD ("Hello");
        BagObject bagObject = Serializer.toBagObject (d);
        log.info (bagObject.toString ());
        TestClassD xxx = Serializer.fromBagObject (bagObject);
        BagTest.report (d.equals (xxx), true, "Properly construct on a type without a default constructor");
    }

    @Test
    public void testClassE () {
        TestClassE d = new TestClassE ("Hello");
        BagObject bagObject = Serializer.toBagObject (d);
        log.info (bagObject.toString ());
        TestClassE xxx = Serializer.fromBagObject (bagObject);
        BagTest.report (d, xxx, "Properly handle a serialized typen");
    }

    @Test
    public void testNull () {
        BagObject bagObject = Serializer.toBagObject (null);
        BagTest.report (bagObject, null, "Serialize null results in null");
        Object object = Serializer.fromBagObject (null);
        BagTest.report (object, null, "Deserialize null results in null");
    }

    @Test
    public void testSimpleSerializer () {
        BagObject testClassC = new BagObject ()
                .put ("a", 1).put ("b", 2).put ("c", 3.0).put ("d", 10).put ("e", 20).put ("f", 30.0).put ("g", 30);
        TestClassC reconC = Serializer.fromBagAsType (testClassC, TestClassC.class);
        BagTest.report (reconC.getF (), testClassC.getFloat ("f"), "Simple deserialization - f");
    }

    @Test
    public void testMapTypeSerialization () {
        Map<String, String> map = new HashMap<> (5);
        map.put ("he", "she");
        map.put ("whe", "when");
        map.put ("the", "they");
        map.put ("che", "chen");
        BagObject bagObject = Serializer.toBagObject (map);
        Map<String, String> recon = Serializer.fromBagObject (bagObject);
    }

    @Test
    public void testIncompleteSimpleSerializer () {
        BagObject testClassC = new BagObject ()
                // int a, long b, float c, int d, long e, float f
                .put ("a", 5).put ("b", 7).put ("c", 9).put ("e", 600).put ("f", 3.5f);
        TestClassC c = Serializer.fromBagAsType (testClassC, TestClassC.class);
        TestClassC xxx = new TestClassC ();
        BagTest.report (c.getD (), xxx.getD (), "Simple deserialization with missing items");
    }
}
