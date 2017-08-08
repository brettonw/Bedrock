#! /usr/bin/env bash

. bin/common.sh

echo "Cleaning $PROJECT_NAME in $PROJECT_DIR";

rm -rf "$TARGET_DIR";
echo "Removed 'target' as $TARGET_DIR";
