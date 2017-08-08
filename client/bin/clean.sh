#! /usr/bin/env bash

# get the project dir
PROJECT_NAME="bedrock";
PROJECT_DIR="$(pwd)";
echo "Cleaning $PROJECT_NAME in $PROJECT_DIR";

# ensure the target directory is present and empty
TARGET_DIR="$PROJECT_DIR/target";
rm -rf "$TARGET_DIR";
echo "Removed 'target' as $TARGET_DIR";
