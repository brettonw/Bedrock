package com.brettonw.bedrock;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class Base_Test extends Base {

    public Base_Test () {
    }

    @Test
    public void testBase () {
        assertTrue (true);
        assertFalse (false);
    }
}
