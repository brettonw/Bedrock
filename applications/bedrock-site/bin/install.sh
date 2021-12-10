#! /usr/bin/env bash

. bin/common.sh $1

# exit on any error
set -e

# the src and target dirs
TARGET_DIR="$PROJECT_DIR/target";

# docker setup
DOCKER_COUNT=$(docker system info | grep -i images | awk '{print $2}');

echo "Install: building docker tag $PROJECT_NAME:${PROJECT_VERSION,,} using machine ($DOCKER_MACHINE_NAME)";

cp -r $PROJECT_DIR/src/main/docker $TARGET_DIR/docker
cp $TARGET_DIR/bedrock.war $TARGET_DIR/docker/ROOT.war
pushd $TARGET_DIR/docker
docker build --tag "$PROJECT_NAME:${PROJECT_VERSION,,}" .
popd

echo "Install: Finished";
