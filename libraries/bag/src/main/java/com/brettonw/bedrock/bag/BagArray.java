package com.brettonw.bedrock.bag;

import com.brettonw.bedrock.bag.expr.BooleanExpr;
import com.brettonw.bedrock.bag.formats.FormatReader;
import com.brettonw.bedrock.bag.formats.FormatWriter;
import com.brettonw.bedrock.bag.formats.MimeType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.lang.reflect.Array;
import java.lang.reflect.Constructor;
import java.util.Arrays;
import java.util.Iterator;
import java.util.function.Function;
import java.util.function.Predicate;

/**
 * A collection of text-based values stored in a zero-based indexed array.
 * <p>
 * Note: the BagArray class, from a memory allocation standpoint, is not designed to work
 * efficiently with dynamic storage of very large numbers of elements (more than 1,000s). It will
 * work, but we have not chosen to focus on this as a potential use-case.
 */
public class BagArray extends Bag implements Selectable<BagArray>, Iterable<Object> {
    private static final Logger log = LogManager.getLogger (BagArray.class);

    private static final int UNKNOWN_SIZE = -1;
    private static final int DEFAULT_CONTAINER_SIZE = 1;
    private static final int DOUBLING_CAP = 128;
    private Object[] container;
    private int count;

    /**
     * Create a new BagArray with a default underlying storage size.
     */
    public BagArray () {
        this (UNKNOWN_SIZE);
    }

    /**
     * Create a new BagArray with hint for the underlying storage size.
     *
     * @param size The expected number of elements in the BagArray, treated as a hint to optimize
     *             memory allocation. If additional elements are stored, the BagArray will revert
     *             to normal allocation behavior.
     */
    public BagArray (int size) {
        count = 0;
        container = new Object[Math.max (size, DEFAULT_CONTAINER_SIZE)];
    }

    BagArray (SourceAdapter sourceAdapter) throws ReadException {
        // make the victim
        BagArray victim = FormatReader.readBagArray (sourceAdapter);
        if (victim == null) {
            throw new ReadException ();
        }

        // now steal the victim's soul and leave them to die
        container = victim.container;
        count = victim.count;
    }

    /**
     * Create a new BagArray as deep copy of another BagArray
     */
    public BagArray (BagArray bagArray) {
        this (new SourceAdapter (bagArray.toString (MimeType.DEFAULT), MimeType.DEFAULT));
    }

    /**
     * Return the number of elements stored in the BagArray.
     *
     * @return the count of elements in the underlying store. This is distinct from the capacity of
     * the underlying store.
     */
    public int getCount () {
        return count;
    }

    private void grow (int gapIndex) {
        // save the existing container
        Object[] src = container;

        // compute the number of values that will have to move, and from it, the new count - and
        // therefore the new size needed to include all of the elements of the array. the cases are:
        //
        // 1) the gapIndex is in the area of the array already in use, some elements will have to be
        //    moved to make room for the new element, and the array might need to be expanded to
        //    accommodate that
        //
        // 2) the gapIndex is at the end of the array already in use, no elements will have to be
        //    moved to make room for it, but the array might need to be expanded to accommodate the
        //    new element
        //
        // 3) the gapIndex is outside of the range of the array already in use, no elements will
        //    have to be moved o make room for it, but the array might need to be expanded to
        //    accommodate the new element
        int moveCount = count - gapIndex;
        count = 1 + ((moveCount > 0) ? count : gapIndex);

        // get the size of the array and resize it if necessary (copying the existing elements to
        // the new array - note that this means a sparse insertion will result in null elements in
        // the array
        int size = container.length;
        if (count > size) {
            do {
                // if the array is smaller than the cap then double its size, otherwise just add the block
                size = (size > DOUBLING_CAP) ? (size + DOUBLING_CAP) : (size * 2);
            }
            while (count > size);
            container = new Object[size];
            System.arraycopy (src, 0, container, 0, Math.min (gapIndex, src.length));
        }

        // if needed, copy elements after the gapIndex
        if (moveCount > 0) {
            System.arraycopy (src, gapIndex, container, gapIndex + 1, moveCount);
        }
    }

    /**
     * Inserts the element at the given index of the underlying array store. The underlying store is
     * shifted to make space for the new element. The shift might cause the underlying store to be
     * resized if there is insufficient room.
     * <p>
     * Note that null values for the element ARE stored, as the underlying store is not a sparse
     * array.
     *
     * @param index An integer value specifying the offset from the beginning of the array.
     * @param object The element to store.
     * @return The BagArray, so that operations can be chained together.
     */
    public BagArray insert (int index, Object object) {
        grow (index);
        // note that arrays can store null objects, unlike bags
        container[index] = objectify (object);
        return this;
    }

    /**
     * Adds the element at the end of the underlying array store. The underlying store might be
     * resized if there is insufficient room.
     * <p>
     * Note that null values for the element ARE stored, as the underlying store is not a sparse
     * array.
     *
     * @param object The element to store.
     * @return The BagArray, so that operations can be chained together.
     */
    public BagArray add (Object object) {
        return insert (count, object);
    }

    /**
     * Create a new BagArray and "add" the object.
     * @param object The element to store.
     * @return The newly created BagArray.
     */
    public static BagArray open (Object object) {
        return new BagArray ().insert (0, object);
    }

    /**
     *
     * @param left
     * @param right
     * @return
     */
    public static BagArray concat (BagArray left, BagArray right) {
        int count = left.count + right.count;
        BagArray bagArray = new BagArray (count);
        bagArray.count = count;
        System.arraycopy (left.container, 0, bagArray.container, 0, left.count);
        System.arraycopy (right.container, 0, bagArray.container, left.count, right.count);
        return bagArray;
    }

    /**
     * Replaces the element at the given index of the underlying array store. The underlying store
     * is not shifted, and will not be resized.
     * <p>
     * Note that null values for the element ARE stored, as the underlying store is not a sparse
     * array.
     *
     * @param index An integer value specifying the offset from the beginning of the array.
     * @param object The element to store.
     * @return The BagArray, so that operations can be chained together.
     */
    public BagArray replace (int index, Object object) {
        // note that arrays can store null objects, unlike bags
        container[index] = objectify (object);
        return this;
    }

    private void removeIndex (int index) {
        // assumes index has already been checked for validity
        int gapIndex = index + 1;
        System.arraycopy (container, gapIndex, container, index, count - gapIndex);
        --count;
    }

    /**
     * Removes the element at the given index of the underlying array store. The underlying store
     * is shifted to cover the removed item. The underlying store will not be resized. Using invalid
     * indices is ignored.
     *
     * @param index An integer value specifying the offset from the beginning of the array.
     * @return The BagArray, so that operations can be chained together.
     */
    public BagArray remove (int index) {
        if ((index >= 0) && (index < count)) {
            removeIndex (index);
        }
        return this;
    }

    public Object getObject (int index) {
        return ((index >= 0) && (index < count)) ? container[index] : null;
    }

    /**
     *
     * @param index
     * @return
     */
    public Object getAndRemove (int index) {
        if ((index >= 0) && (index < count)) {
            Object object = container[index];
            removeIndex (index);
            return object;
        }
        return null;
    }

    /**
     *
     * @return
     */
    public Object pop () {
        return getAndRemove (count - 1);
    }

    /**
     *
     * @return
     */
    public Object dequeue () {
        return getAndRemove (0);
    }

    private int keyToIndex (String key) {
        switch (key) {
            case "#first": return 0;
            case "#last": return count - 1;
            //case "#add": return count;
            default: return Integer.parseInt (key);
        }
    }

    /**
     * Return an object stored at the requested key value. The key may be a simple number, or a
     * special keyword indicating the #first or #last element in the array, #add for putting at the
     * end of the array, or it may be a path (with keys separated by "/") to create a hierarchical
     * "bedrock-of-bags" that is indexed recursively.
     * <p>
     *
     * @param key A string value used to index the element, using "/" as separators, for example:
     *             "12/com/brettonw" or "#last/completed"
     * @return The indexed element (if found), or null
     */
    @Override
    public Object getObject (String key) {
        // separate the key into path components, the "local" key value is the first component, so
        // use that to conduct the search. We are only interested in values that indicate the search
        // found the requested key
        String[] path = Key.split (key);
        int index = keyToIndex (path[0]);
        if ((index >= 0) && (index < count)) {
            // grab the found element... if the path was only one element long, this is the element
            // we were looking for, otherwise recur on the found element as another BagObject
            Object found = container[index];
            return (path.length == 1) ? found : ((Bag) found).getObject (path[1]);
        }
        return null;
    }

    /**
     * Retrieve an indexed element and return it as a String.
     *
     * @param index An integer value specifying the offset from the beginning of the array.
     * @return The element as a string, or null if the element is not found (or not a String).
     */
    public String getString (int index) {
        Object object = getObject (index);
        try {
            return (String) object;
        } catch (ClassCastException exception) {
            log.warn ("Cannot cast value type (" + object.getClass ().getName () + ") to String for index (" + index + ")");
        }
        return null;
    }

    /**
     * Retrieve an indexed element and return it as a Boolean.
     *
     * @param index An integer value specifying the offset from the beginning of the array.
     * @return The element as a Boolean, or null if the element is not found.
     */
    public Boolean getBoolean (int index) {
        String string = getString (index);
        return (string != null) ? Boolean.parseBoolean (string) : null;
    }

    /**
     * Retrieve an indexed element and return it as a Long.
     *
     * @param index An integer value specifying the offset from the beginning of the array.
     * @return The element as a Long, or null if the element is not found.
     */
    @SuppressWarnings ("WeakerAccess")
    public Long getLong (int index) {
        String string = getString (index);
        return (string != null) ? Long.parseLong (string) : null;
    }

    /**
     * Retrieve an indexed element and return it as an Integer.
     *
     * @param index An integer value specifying the offset from the beginning of the array.
     * @return The element as an Integer, or null if the element is not found.
     */
    public Integer getInteger (int index) {
        Long value = getLong (index);
        return (value != null) ? value.intValue () : null;
    }

    /**
     * Retrieve an indexed element and return it as a Double.
     *
     * @param index An integer value specifying the offset from the beginning of the array.
     * @return The element as a Double, or null if the element is not found.
     */
    public Double getDouble (int index) {
        String string = getString (index);
        return (string != null) ? Double.parseDouble (string) : null;
    }

    /**
     * Retrieve an indexed element and return it as a Float.
     *
     * @param index An integer value specifying the offset from the beginning of the array.
     * @return The element as a Float, or null if the element is not found.
     */
    public Float getFloat (int index) {
        Double value = getDouble (index);
        return (value != null) ? value.floatValue () : null;
    }

    /**
     * Retrieve an indexed element and return it as a BagObject.
     *
     * @param index An integer value specifying the offset from the beginning of the array.
     * @return The element as a BagObject, or null if the element is not found.
     */
    public BagObject getBagObject (int index) {
        Object object = getObject (index);
        try {
            return (BagObject) object;
        } catch (ClassCastException exception) {
            log.warn ("Cannot cast value type (" + object.getClass ().getName () + ") to BagObject for index (" + index + ")");
        }
        return null;
    }

    /**
     * Retrieve an indexed element and return it as a BagArray.
     *
     * @param index An integer value specifying the offset from the beginning of the array.
     * @return The element as a BagArray, or null if the element is not found.
     */
    public BagArray getBagArray (int index) {
        Object object = getObject (index);
        try {
            return (BagArray) object;
        } catch (ClassCastException exception) {
            log.warn ("Cannot cast value type (" + object.getClass ().getName () + ") to BagArray for index (" + index + ")");
        }
        return null;
    }

    @Override
    public String toString (String format) {
        return FormatWriter.write (this, format);
    }

    /**
     *
     * @param function
     * @return
     */
    public BagArray map (Function<Object, Object> function) {
        final BagArray bagArray = new BagArray (count);
        for (int i = 0; i < count; ++i) {
            bagArray.add (function.apply (container[i]));
        }
        return bagArray;
    }

    public BagArray filter (Predicate<Object> predicate) {
        final BagArray bagArray = new BagArray ();
        for (int i = 0; i < count; ++i) {
            if (predicate.test (container[i])) {
                bagArray.add (container[i]);
            }
        }
        return bagArray;
    }

    @Override
    public Iterator<Object> iterator () {
        return new Iterator<Object> () {
            private int i;

            @Override
            public boolean hasNext() {
                return (i < count);
            }

            @Override
            public Object next() {
                return container[i++];
            }

            @Override
            public void remove() {
                throw new UnsupportedOperationException("no changes allowed");
            }
        };
    }

    @Override
    public BagArray select (SelectKey selectKey) {
        if (selectKey != null) {
            BagArray bagArray = new BagArray ();
            for (int i = 0; i < count; ++i) {
                String key = Integer.toString (i);
                if ((key = selectKey.select (key)) != null) {
                    Object object = getObject (key);
                    bagArray.add (object);
                }
            }
            return bagArray;
        }
        return this;
    }

    /**
     *
     * @param keys array of SortKey
     * @return
     */
    public BagArray sort (SortKey... keys) {
        // final value, so that lambda expressions can reference it
        final SortKey[] sortKeys = (keys != null) ? keys : SortKey.DEFAULT;

        // if there is no key
        if (sortKeys[0].getKey () == null) {
            // we'll treat the array as strings or bare value, and just sort it
            Arrays.sort (container, 0, count, (a, b) -> {
                return sortKeys[0].compare ((String) a, (String) b);
            });
        } else {
            // we'll sort using the keys hierarchically...
            Arrays.sort (container, 0, count, (a, b) -> {
                for (int i = 0, end = sortKeys.length; i < end; ++i) {
                    String key = sortKeys[i].getKey ();
                    Object objectA = (a != null) ? ((Bag) a).getObject (key) : null;
                    Object objectB = (b != null) ? ((Bag) b).getObject (key) : null;
                    int cmp = sortKeys[i].compare ((String) objectA, (String) objectB);
                    if (cmp != 0) {
                        return cmp;
                    }
                }
                return 0;
            } );
        }
        return this;
    }

    /**
     *
     * @param match a BooleanExpr describing the match criteria
     * @param selectKey a SelectKey with the values to extract
     * @return
     */
    public BagArray query (BooleanExpr match, SelectKey selectKey) {
        // create the destination

        BagArray bagArray = new BagArray ();

        // loop over all of the objects
        for (Object object : container) {
            if (object instanceof Bag) {
                // try to match the 'match' clause
                Bag bag = (Bag) object;
                boolean matches = (match == null) || bag.match (match);
                if (matches) {
                    // select the desired parts
                    object = ((Selectable) bag).select (selectKey);
                    bagArray.add (object);
                }
            } else if (object instanceof String){
                // XXX TODO
                // it's a string, 'match' needs to be { field:"*",... } or not have field
            } else {
                // skip it, don't know what it is
            }
        }
        return bagArray;
    }

    public BagArray subset (int start, int count) {
        count = Math.min (count, getCount () - start);
        BagArray bagArray = new BagArray (count);
        for (int i = 0; i < count; ++i) {
            bagArray.add (container[i + start]);
        }
        return bagArray;
    }

    public <Type> Type[] toArray (Class<Type> type) {
        try {
            Constructor constructor = type.getConstructor (String.class);
            Type[] target = (Type[]) Array.newInstance (type, new int[] { count });
            for (int i = 0; i < count; ++i) {
                target[i] = (Type) constructor.newInstance (getString (i));
            }
            return target;
        } catch (Exception exception) {
            // yeah, we really aren't going to support any other types - it must have a constructor
            // from a string
            log.error (exception);
        }
        return null;
    }
}
