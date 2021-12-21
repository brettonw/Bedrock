package com.brettonw.bedrock.logger;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class LoggerTest extends Logger {
    private static final Logger log = LogManager.getLogger (LoggerTest.class);

    public LoggerTest(String name, String configuration) {
        super(name, configuration);
    }

    @Test
    public void testSecret () {
        // does the master secret work?
        //assertTrue (check ("Not really...", secretRecipe));
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
