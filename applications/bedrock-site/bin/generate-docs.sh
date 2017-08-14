#! /usr/bin/env bash

. bin/common.sh $1

exit 0;

# ensure the distribution directories are present and empty
if [ ! -d "$ARTIFACT_VERSION_DIR/docs/" ]; then
    mkdir -p "$ARTIFACT_VERSION_DIR/docs/";
fi;
if [ ! -d "$ARTIFACT_LATEST_DIR/docs/" ]; then
    mkdir -p "$ARTIFACT_LATEST_DIR/docs/";
fi;
DOCS_ARTIFACT_VERSION="$ARTIFACT_VERSION_DIR/docs/$PROJECT_NAME";
DOCS_ARTIFACT_LATEST="$ARTIFACT_LATEST_DIR/docs/$PROJECT_NAME";
echo "Created doc artifact dirs at $ARTIFACT_DIR";

# make the docs (implicitly uses yuidoc.json)
echo "Make docs";
yuidoc --project-version "$PROJECT_VERSION" --quiet --outdir "$DOCS_ARTIFACT" "$SRC_DIR" "$PROJECT_DIR/js";

# copy docs from dependent projects (maven aggregation goals don't seem to work for this)
pushd "$PROJECT_DIR/../../libraries";
for FILE in *; do
    if [ -d "$FILE" ]; then
        echo "$FILE";
        rm -rf "$ARTIFACT_DIR/docs/$FILE";
        cp -r "$FILE/target/apidocs" "$ARTIFACT_DIR/docs/$FILE";
    fi
done
popd;

echo "Done.";
