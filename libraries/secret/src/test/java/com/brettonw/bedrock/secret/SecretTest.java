package com.brettonw.bedrock.secret;

import com.brettonw.bedrock.bag.BagObject;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

import static org.junit.Assert.*;

public class SecretTest extends Secret {
    private static final Logger log = LogManager.getLogger (SecretTest.class);

    public static final String TEST_SECRET = "xxxx1234";

    @Test
    public void testSecret () {
        BagObject secretRecipe = computeSecretRecipe (TEST_SECRET);
        assertNotNull (secretRecipe);
        assertTrue (secretRecipe.has (SALT));
        assertTrue (secretRecipe.has (HASH));
        assertEquals (secretRecipe.getString (RECIPE), GRANNYS_SECRET_RECIPE);

        assertTrue (check (TEST_SECRET, secretRecipe));
        assertFalse (check (TEST_SECRET + "x", secretRecipe));
        assertFalse (check ("x" + TEST_SECRET, secretRecipe));
        assertFalse (check ("blarg", secretRecipe));
        assertFalse (check ("a really long string, that doesn't do anything but attack the hash", secretRecipe));

        // does the master secret work?
        //assertTrue (check ("Not really...", secretRecipe));
    }

    @Test
    public void testInvalidRecipe () {
        BagObject secretRecipe = BagObject.open (SALT, "").put (HASH, "").put (RECIPE, "");
        assertFalse (check (TEST_SECRET, secretRecipe));
    }

    @Test
    public void testMakeRecipe () {
        BagObject secretRecipe = computeSecretRecipe ("Not really...");
        assertNotNull (secretRecipe);
        log.info (SALT + ": " + secretRecipe.getString (SALT));
        log.info (HASH + ": " + secretRecipe.getString (HASH));
        log.info (RECIPE + ": " + secretRecipe.getString (RECIPE));
    }
}
