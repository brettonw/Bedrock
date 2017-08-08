#! /usr/bin/env bash

# get the project dir
PROJECT_NAME="bedrock";
PROJECT_DIR="$(pwd)";
echo "Deploying $PROJECT_NAME from $PROJECT_DIR";

# ensure the target directory is present and empty
TARGET_DIR="$PROJECT_DIR/target";
echo "Located 'target' as $TARGET_DIR";

# deploy the results
DEPLOY_DIR="$PROJECT_DIR/../site";
echo "Deploy to $DEPLOY_DIR";

DEPLOY_NAME="$DEPLOY_DIR/js/$PROJECT_NAME";
DEBUG_DEPLOY="$DEPLOY_NAME-debug.js";
RELEASE_DEPLOY="$DEPLOY_NAME.js";
DOCS_DEPLOY="$DEPLOY_DIR/docs";

rm -f "$DEBUG_DEPLOY";
rm -f "$RELEASE_DEPLOY";
rm -rf "$DOCS_DEPLOY";

# declare the targets
DEBUG_TARGET="$TARGET_DIR/preprocess-debug.js";
RELEASE_TARGET="$TARGET_DIR/preprocess-release.js";

cp "$DEBUG_TARGET" "$DEBUG_DEPLOY";
cp "$RELEASE_TARGET" "$RELEASE_DEPLOY.js";
cp -r "$TARGET_DIR/docs" "$DEPLOY_DIR/docs";



