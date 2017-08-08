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
TARGET_DIR="$PROJECT_DIR/target";
RELEASE_TARGET="$TARGET_DIR/$RELEASE_NAME";

# the artifact names
DEBUG_ARTIFACT="$PROJECT_DIR/js/$DEBUG_NAME";
RELEASE_ARTIFACT="$PROJECT_DIR/js/$RELEASE_NAME";
if [ ! -d "$PROJECT_DIR/docs/" ]; then
    mkdir "$PROJECT_DIR/docs/";
fi;
DOCS_ARTIFACT="$PROJECT_DIR/docs/$PROJECT_NAME";
