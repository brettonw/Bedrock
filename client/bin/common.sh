#! /usr/bin/env bash

# get the project dir
PROJECT_NAME="bedrock";
PROJECT_DIR="$(pwd)";

# define the targets
TARGET_DIR="$PROJECT_DIR/target";
DEBUG_TARGET="$TARGET_DIR/$PROJECT_NAME-debug.js";
RELEASE_TARGET="$TARGET_DIR/$PROJECT_NAME.js";

