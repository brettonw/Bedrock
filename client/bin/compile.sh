#! /usr/bin/env bash

. bin/common.sh

echo "Compiling $PROJECT_NAME in $PROJECT_DIR";

# ensure the target directory is present and empty
rm -rf "$TARGET_DIR";
mkdir "$TARGET_DIR"
echo "Created 'target' as $TARGET_DIR";

# concatenate the files list into the target directory
echo "Concatenate source files";
SRC_DIR="$PROJECT_DIR/src/main/javascript";
CONCAT="$TARGET_DIR/concat";
pushd "$SRC_DIR";
cat                                 \
    bedrock.js                      \
    log-level.js                    \
    base.js                         \
    utility.js                      \
    http.js                         \
    service-base.js                 \
    service-descriptor.js           \
    html.js                         \
    combobox.js                     \
    forms.js                        \
    database.js                     \
    > "$CONCAT";
popd;

# preprocess the debug build
echo "Preprocess debug build to $DEBUG_TARGET";
gcc -E -P -CC -xc++ -DDEBUG -o"$DEBUG_TARGET" "$CONCAT"

# make the docs (implicitly uses yuidoc.json)
echo "Make docs";
yuidoc -o "$TARGET_DIR/docs";

# preprocess the release build
RELEASE_MINIFY_TARGET="$TARGET_DIR/$PROJECT_NAME-preprocess-release.js";
echo "Preprocess release build to $RELEASE_MINIFY_TARGET";
gcc -E -P -CC -xc++ -o"$RELEASE_MINIFY_TARGET" "$CONCAT"

# minify the release build
echo "Minify release build";
uglifyjs "$RELEASE_MINIFY_TARGET" -o "$RELEASE_TARGET"

