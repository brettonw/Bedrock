package com.brettonw.bedrock.secret;

import com.brettonw.bedrock.bag.BagObject;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

public class Secret {
    private static final Logger log = LogManager.getLogger (Secret.class);

    public static final String SALT = "salt";
    public static final String HASH = "hash";

    public static final String MASTER_SALT = "";
    public static final String MASTER_HASH = "";

    public static byte[] computeHash (String secret, byte[] salt) {
        try {
            MessageDigest messageDigest = MessageDigest.getInstance ("SHA-512");
            messageDigest.update (salt);
            return messageDigest.digest (secret.getBytes (StandardCharsets.UTF_8));
        } catch (Exception exception) {
            log.error (exception);
        }
        return null;
    }

    public static byte[] computeHash (String secret, String saltEncoded) {
        return computeHash (secret, Base64.getDecoder ().decode (saltEncoded));
    }

    public static BagObject computeSecretRecipe (String secret) {
        // make some salt
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);

        // compute the hash
        byte[] hash = computeHash (secret, salt);

        // encode the values
        return BagObject
                .open (SALT, Base64.getEncoder ().encodeToString (salt))
                .put (HASH, Base64.getEncoder ().encodeToString (hash));
    }

    public static boolean checkSecret (String trySecret, BagObject secretRecipe) {
        // check if the recipe is filled out...
        String saltEncoded = secretRecipe.getString (SALT);
        String targetHashEncoded = secretRecipe.getString (HASH);
        if ((saltEncoded != null) && (saltEncoded.trim().length () > 0) && (targetHashEncoded != null) && (targetHashEncoded.trim().length () > 0)) {
            byte[] targetHash = Base64.getDecoder ().decode (targetHashEncoded);
            byte[] tryHash = computeHash (trySecret, saltEncoded);
            return ((tryHash != null) && (targetHash != null) && Arrays.equals(tryHash, targetHash));
        }
        return false;
    }
}
