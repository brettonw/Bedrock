#! /usr/bin/env bash

. bin/clean.sh $1

# make the docs (implicitly uses yuidoc.json)
echo "Make docs";
yuidoc --project-version "$PROJECT_VERSION" --quiet --outdir "$DOCS_ARTIFACT" "$SRC_DIR" "$PROJECT_DIR/js";

# ensure the target directory is present and empty
echo "Compile - create $TARGET_DIR";
mkdir "$TARGET_DIR"

# concatenate the files list into the target directory
echo "Compile - concatenate source files";
SRC_DIR="$PROJECT_DIR/src";
CONCAT="$TARGET_DIR/$PROJECT_NAME-concat.js";
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

# preprocess the debug build out to the artifact
echo "Preprocess debug build to $DEBUG_ARTIFACT";
gcc -E -P -CC -xc++ -DDEBUG -o"$DEBUG_ARTIFACT" "$CONCAT"

# preprocess the release build
PREPROCESS_RELEASE_TARGET="$TARGET_DIR/preprocess-$PROJECT_NAME-release.js";
echo "Preprocess release build to $PREPROCESS_RELEASE_TARGET";
gcc -E -P -CC -xc++ -o"$PREPROCESS_RELEASE_TARGET" "$CONCAT"

# minify the release build
echo "Minify release build to $RELEASE_ARTIFACT";
uglifyjs "$PREPROCESS_RELEASE_TARGET" -o "$RELEASE_ARTIFACT"

echo "Done.";