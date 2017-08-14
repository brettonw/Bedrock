#! /usr/bin/env bash

. bin/clean.sh $1

# ensure the target directory and distribution directory are present and empty
echo "Compile - create $TARGET_DIR";
if [ ! -d "$TARGET_DIR" ]; then
    mkdir -p "$TARGET_DIR"
fi
mkdir -p "$ARTIFACT_VERSION_DIR";
mkdir -p "$ARTIFACT_LATEST_DIR";
echo "Created artifact dirs at $ARTIFACT_DIR";


# generate the version file
VERSION_FILE="$TARGET_DIR/version.js";
echo "Bedrock.version = \"$PROJECT_VERSION\";" > "$VERSION_FILE";

# concatenate the files list into the target directory
echo "Compile - concatenate source files";
CONCAT="$TARGET_DIR/$PROJECT_NAME-concat.js";
pushd "$SRC_DIR";
cat                                 \
    bedrock.js                      \
    $VERSION_FILE                   \
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
echo "Preprocess debug build to $DEBUG_ARTIFACT_VERSION";
gcc -E -P -CC -xc++ -DDEBUG -o"$DEBUG_ARTIFACT_VERSION" "$CONCAT"
cp "$DEBUG_ARTIFACT_VERSION" "$DEBUG_ARTIFACT_LATEST";

# preprocess the release build
PREPROCESS_RELEASE_TARGET="$TARGET_DIR/preprocess-$PROJECT_NAME-release.js";
echo "Preprocess release build to $PREPROCESS_RELEASE_TARGET";
gcc -E -P -CC -xc++ -o"$PREPROCESS_RELEASE_TARGET" "$CONCAT"

# minify the release build
echo "Minify release build to $RELEASE_ARTIFACT";
uglifyjs "$PREPROCESS_RELEASE_TARGET" -o "$RELEASE_ARTIFACT_VERSION"
cp "$RELEASE_ARTIFACT_VERSION" "$RELEASE_ARTIFACT_LATEST";

echo "Done.";
