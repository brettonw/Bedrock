#! /usr/bin/env bash

. bin/common.sh $1

echo "Clean - $PROJECT_NAME in $PROJECT_DIR";

# ensure the target directory is cleaned out
rm -rf "$TARGET_DIR";

# ensure the built artifacts have been removed
rm -rf "$ARTIFACT_VERSION_DIR";
rm -rf "$ARTIFACT_LATEST_DIR";

echo "Clean - Done";
