#! /usr/bin/env bash

. bin/common.sh $1

echo "Cleaning $PROJECT_NAME in $PROJECT_DIR";

# ensure the target directory is present and empty
rm -rf "$TARGET_DIR";

# ensure the built artifacts have been removed
rm -f "$DEBUG_ARTIFACT";
rm -f "$RELEASE_ARTIFACT";
rm -rf "$DOCS_ARTIFACT";

