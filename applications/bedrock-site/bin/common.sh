#! /usr/bin/env bash

# get the project dir
PROJECT_NAME="bedrock";
PROJECT_VERSION=$1;
PROJECT_DIR="$(pwd)";
echo "Project: $PROJECT_NAME@v$PROJECT_VERSION";

# the final product names
DEBUG_NAME="$PROJECT_NAME-debug.js";
RELEASE_NAME="$PROJECT_NAME.js";

# the target names
TARGET_DIR="$PROJECT_DIR/target/js";
RELEASE_TARGET="$TARGET_DIR/$RELEASE_NAME";

# the artifact names
ARTIFACT_DIR="$PROJECT_DIR/src/main/webapp";
DEBUG_ARTIFACT="$ARTIFACT_DIR/js/$DEBUG_NAME";
RELEASE_ARTIFACT="$ARTIFACT_DIR/js/$RELEASE_NAME";
if [ ! -d "$ARTIFACT_DIR/docs/" ]; then
    mkdir "$ARTIFACT_DIR/docs/";
fi;
DOCS_ARTIFACT="$ARTIFACT_DIR/docs/$PROJECT_NAME-js";
