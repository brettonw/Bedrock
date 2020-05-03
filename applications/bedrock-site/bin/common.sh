#! /usr/bin/env bash

# get the project dir
PROJECT_NAME=$1;
PROJECT_VERSION=$2;
PROJECT_DIR="$(pwd)";
echo;
printf -v date '%(%Y-%m-%d %H:%M:%S)T' -1;
echo "Project: $PROJECT_NAME@v$PROJECT_VERSION ($date)";

# where are the sources
SRC_DIR="$PROJECT_DIR/src/main/dist";

# the final product names
DEBUG_NAME="$PROJECT_NAME-debug.js";
RELEASE_NAME="$PROJECT_NAME.js";

# the target names
TARGET_DIR="$PROJECT_DIR/target/dist";

# the artifact names
ARTIFACT_DIR="$PROJECT_DIR/src/main/webapp/dist";
ARTIFACT_VERSION_DIR="$ARTIFACT_DIR/$PROJECT_VERSION";
ARTIFACT_LATEST_DIR="$ARTIFACT_DIR/latest";

DEBUG_ARTIFACT="$ARTIFACT_VERSION_DIR/$DEBUG_NAME";
RELEASE_ARTIFACT="$ARTIFACT_VERSION_DIR/$RELEASE_NAME";

