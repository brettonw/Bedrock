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

. ~/.aws/bedrock.sh;

DOCKER_REPOSITORY_NAME=bedrock;
echo "Repository Name: $DOCKER_REPOSITORY_NAME";
DOCKER_REPOSITORY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$DOCKER_REPOSITORY_NAME;

aws --profile $AWS_PROFILE ecr create-repository --repository-name $DOCKER_REPOSITORY_NAME;
docker tag bedrock:$PROJECT_VERSION $DOCKER_REPOSITORY;
aws --profile $AWS_PROFILE ecr get-login-password | docker login --username AWS --password-stdin $DOCKER_REPOSITORY;
docker push $DOCKER_REPOSITORY;

#aws --profile $AWS_PROFILE ecr delete-repository --repository-name $DOCKER_REPOSITORY_NAME --force

