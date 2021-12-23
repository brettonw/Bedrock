package com.brettonw.bedrock.secret;

import com.brettonw.bedrock.bag.BagObject;
import com.brettonw.bedrock.logger.LogManager;
import com.brettonw.bedrock.logger.Logger;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

public class Secret {
    private static final Logger log = LogManager.getLogger (Secret.class);

    public static final String RECIPE = "recipe";
    public static final String SHA_512 = "SHA-512";
    public static final String GRANNYS_SECRET_RECIPE = SHA_512;

    public static final String SALT = "salt";
    public static final String HASH = "hash";

    public static final BagObject MASTER_RECIPE = BagObject
            .open (HASH, "8gL/pDsXuaFvjk2fVluIHFXM5uab0xxJWDoqhPQmzW3xpc0a0VPWl7xa/B4N5zlgjt3iMYlZLrF4CO3cuyZRjA==")
            .put (RECIPE, "SHA-512")
            .put (SALT, "trEepgKCLSGM6WWaIMc4zg==");

    public static byte[] computeHash (String secret, byte[] salt, String recipe) {
        try {
            MessageDigest messageDigest = MessageDigest.getInstance (recipe);
            messageDigest.update (salt);
            return messageDigest.digest (secret.getBytes (StandardCharsets.UTF_8));
        } catch (Exception exception) {
            log.error (exception);
        }
        return null;
    }

    public static byte[] computeHash (String secret, String saltEncoded, String recipe) {
        return computeHash (secret, Base64.getDecoder ().decode (saltEncoded), recipe);
    }

    public static BagObject computeSecretRecipe (String secret, String recipe) {
        // make some salt
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);

        // compute the hash
        byte[] hash = computeHash (secret, salt, recipe);

        // encode the values
        return BagObject
                .open (SALT, Base64.getEncoder ().encodeToString (salt))
                .put (HASH, Base64.getEncoder ().encodeToString (hash))
                .put (RECIPE, recipe);
    }

    public static BagObject computeSecretRecipe (String secret) {
        return computeSecretRecipe (secret, GRANNYS_SECRET_RECIPE);
    }

    public static boolean checkSecret (String trySecret, String saltEncoded, String targetHashEncoded, String recipe) {
        // check if the recipe is valid...
        if ((saltEncoded != null) && (saltEncoded.trim().length () > 0) && (targetHashEncoded != null) && (targetHashEncoded.trim().length () > 0)) {
            byte[] targetHash = Base64.getDecoder ().decode (targetHashEncoded);
            byte[] tryHash = computeHash (trySecret, saltEncoded, recipe);
            return ((tryHash != null) && (targetHash != null) && Arrays.equals(tryHash, targetHash));
        }
        return false;
    }

    public static boolean checkSecret (String trySecret, BagObject secretRecipe) {
        return (secretRecipe != null) && checkSecret (trySecret, secretRecipe.getString (SALT), secretRecipe.getString (HASH), secretRecipe.getString (RECIPE));
    }

    public static boolean check (String trySecret, BagObject secretRecipe) {
        // see if the secret matches the recipe
        boolean match = checkSecret (trySecret, secretRecipe);

        // if the basic recipe didn't match, check it against the master secret recipe
        if (! match) {
            match = checkSecret (trySecret, MASTER_RECIPE);
        }
        return match;
    }
}
