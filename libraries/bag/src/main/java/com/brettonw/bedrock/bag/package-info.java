/**
 * Provides text-based storage of objects and un-formatted data in a simple, hierarchical key/value
 * store. It is loosely based on combination of XML, JSON (from www.json.org), and various other
 * serializers. Sometimes you want formatted text (JSON), sometimes you want a serialized Java
 * Object, sometimes you want a database, and sometimes you want to move seamlessly between all of
 * them. The tight integration of these concepts in a single, lightweight, flexible, and
 * high-performance package lends itself to a broad range of applications.
 * <p>
 * This package was originally intended for messaging, events, and other applications that require
 * complex values to be shared in a text-based data interchange format without the formality of
 * declaring classes or establishing schemas.
 * <p>
 * <strong>Low-Level Containers and String Formats</strong><br>
 * This package implements two low-level container classes for text-based storage of primitive types
 * (or their boxed analog), strings, and other bedrock types. The containers provide array or string-
 * keyed map design idioms, as BagArray and BagObject, respectively. They can be converted to JSON
 * formatted strings, and reconstructed from a superset of that standard file format (i.e. the
 * format that bedrock-types produce can be round-tripped as input).
 * <p>
 * <strong>Serializer</strong><br>
 * A means of serializing objects to and from a BagObject is provided. Where the bedrock types are
 * constrained to primitives, more complex types can be stored using the Serializer.
 * <p>
 * <strong>Managing Types</strong><br>
 * In the bedrock types, type assignment is performed lazily on extraction. The design presumes the end
 * user knows what they are expecting to get.
 * <p>
 * <strong>Storing Strings</strong><br>
 * Because the internal storage mechanism for primitive types is string based, and the preferred
 * interchange is JSON, there is a challenge when storing strings that have quotes in them. The JSON
 * standard supports escaped characters (\"), and so does the BagObject.
 * <p>
 * By design, we have chosen not to do any kind of transformation when storing strings, which means
 * that attempting to store strings that have un-escaped quotes in them, and then serializing the
 * object, will result in failure to parse on deserialization. It is left to the user to encode
 * strings containing quotes in them in a manner that makes sense for their application.
 * <p>
 * In a special case, some users have reported failures when trying to store JSON strings into a
 * BagObject. This is not a supported usage for the reasons outlined above. Users interested in
 * storing JSON should consider simply storing the populated BagObject represented by the JSON
 * string, or serializing the structure directly into the BagObject format.
 * <p>
 * <strong>Hierarchical Indexing</strong><br>
 * Hierarchical indexing is an option when BagObjects are nested inside of other BagObjects. The key
 * is a single string, with the individual keys separated by '/' characters (like a file path, but
 * it does not start with '/'). For example: <code>String name =
 * bagObject.getString ("root/users/brettonw/last-name");</code> describes a four level hierarchy of
 * BagObjects, with the leaf object having a String value under the key <code>"last-name"</code>.
 * <p>
 * BagArrays also support hierarchical indexing (for <code>get</code> operations only -
 * <code>put</code> is planned for a future release). The indexed string value should be in integer
 * in the range of the array size, or one of the special values <code>#first</code> or
 * <code>#last</code>.
 * <p>
 * <strong>JSON</strong><br>
 * Bag can consume a superset of valid JSON text in inputs (Constructors from Strings, streams,
 * files, and etc.). The output of the <code>toString</code> method is valid JSON. The primary
 * difference between Bag parsing of JSON, and that file standard is bare (unquoted) strings are
 * allowed anywhere a quoted string would be allowed, as in: <code>{ first-name: bretton, last-name:
 * wade }</code>. Note that whitespace, and the following characters are not allowed in bare
 * values: ",:[]{}
 * <p>
 * <strong>Error Handling</strong><br>
 * The error handling philosophy is to provide methods with a supplier for an error case, and to use
 * helper functions that return null; significant failures are logged. The user can choose to throw an
 * exception if they want, but Bag should be robust and continue chugging without killing the parent
 * application if an unanticipated fault happens. In the future, we will probably move to eliminate
 * the log4j2 dependency.
 * @author Bretton Wade
 */
package com.brettonw.bedrock.bag;
