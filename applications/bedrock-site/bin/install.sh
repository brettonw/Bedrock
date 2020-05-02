#! /usr/bin/env bash

# exit on any error
set -e

# get the project dir
PROJECT_NAME="bedrock";
PROJECT_VERSION=$1;
PROJECT_DIR="$(pwd)";
echo "Project: $PROJECT_NAME@v$PROJECT_VERSION";

# the src and target dirs
SRC_DIR="$PROJECT_DIR/src/main";
TARGET_DIR="$PROJECT_DIR/target";

cp -r $SRC_DIR/docker $TARGET_DIR/docker
cp $TARGET_DIR/bedrock-site.war $TARGET_DIR/docker/ROOT.war
pushd $TARGET_DIR/docker
docker build --tag bedrock:$PROJECT_VERSION .
popd
