#! /usr/bin/env bash

. bin/clean.sh "$1"

# ensure the target directory is are present
echo "Generate Sources - create $TARGET_DIR";
if [ ! -d "$TARGET_DIR" ]; then
    mkdir -p "$TARGET_DIR"
fi
mkdir -p "$ARTIFACT_VERSION_DIR";
echo "Generate Sources - Created artifact dirs at $ARTIFACT_VERSION_DIR";

# generate the version file
VERSION_FILE="$TARGET_DIR/version.js";
echo "Bedrock.version = \"$PROJECT_VERSION\";" > "$VERSION_FILE";

# concatenate the files list into the target directory
echo "Generate JS - concatenate source files";
CONCAT="$TARGET_DIR/$PROJECT_NAME-concat.js";
pushd "$SRC_DIR";
cat                                 \
    bedrock.js                      \
    $VERSION_FILE                   \
    enum.js                         \
    log-level.js                    \
    base.js                         \
    utility.js                      \
    http.js                         \
    cookie.js                       \
    service-base.js                 \
    service-descriptor.js           \
    html.js                         \
    paged-display.js                \
    combobox.js                     \
    forms.js                        \
    compare-functions.js            \
    comparable.js                   \
    database-filters.js             \
    database.js                     \
    > "$CONCAT";
popd;


# preprocess the debug build out to the artifact
echo "Generate JS - Preprocess debug build to $DEBUG_ARTIFACT";
gcc -E -P -CC -xc++ -DDEBUG -o"$DEBUG_ARTIFACT" "$CONCAT"

# preprocess the release build
PREPROCESS_RELEASE_TARGET="$TARGET_DIR/preprocess-$PROJECT_NAME-release.js";
echo "Generate JS - Preprocess release build to $PREPROCESS_RELEASE_TARGET";
gcc -E -P -CC -xc++ -o"$PREPROCESS_RELEASE_TARGET" "$CONCAT"

# minify the release build
echo "Generate JS - Minify release build to $RELEASE_ARTIFACT";
uglifyjs "$PREPROCESS_RELEASE_TARGET" -o "$RELEASE_ARTIFACT"

echo "Generate JS - Done";

# copy the CSS file
echo "-----";
echo "Generate CSS";
cp "$SRC_DIR/bedrock.css" "$ARTIFACT_VERSION_DIR";
echo "Generate CSS - Done";

# copy the IMG directory
echo "-----";
echo "Generate IMG";
cp -r "$SRC_DIR/img" "$ARTIFACT_VERSION_DIR";
echo "Generate IMG - Done";

# and now build the docs
echo "-----";
echo "Generate Docs - Start";

# ensure the distribution directories are present and empty
DOCS_ARTIFACT_VERSION_DIR="$ARTIFACT_VERSION_DIR/docs";
if [ ! -d "$DOCS_ARTIFACT_VERSION_DIR" ]; then
    mkdir -p "$DOCS_ARTIFACT_VERSION_DIR";
fi;

echo "Generate Docs - Created doc artifact dirs at $DOCS_ARTIFACT_VERSION_DIR";

# make the docs (implicitly uses yuidoc.json)
echo "Generate Docs - Make docs";
yuidoc --config bin/yuidoc.json --project-version "$PROJECT_VERSION" --quiet --outdir "$DOCS_ARTIFACT_VERSION_DIR/$PROJECT_NAME" "$SRC_DIR";

# copy docs from dependent projects (maven aggregation goals don't seem to work for this)
echo "Generate Docs - Copy library docs";
pushd "$PROJECT_DIR/../../libraries";
for LIBRARY_NAME in *; do
    if [ -d "$LIBRARY_NAME" ]; then
        echo "$LIBRARY_NAME";
        cp -r "$LIBRARY_NAME/target/apidocs" "$DOCS_ARTIFACT_VERSION_DIR/$LIBRARY_NAME";
    fi
done
popd;

echo "Generate Docs - Done";

echo "-----";
echo "Generate Sources - Update \"latest\" from $PROJECT_VERSION";
cp -r "$ARTIFACT_VERSION_DIR" "$ARTIFACT_LATEST_DIR"

echo "Generate Sources - Done";
