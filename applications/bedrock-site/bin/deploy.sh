#! /usr/bin/env bash

# exit on any error
#set -e

# get the project dir
PROJECT_NAME="bedrock";
PROJECT_VERSION=$1;
PROJECT_DIR="$(pwd)";
echo "Project: $PROJECT_NAME@v$PROJECT_VERSION";

# docker setup
DOCKER_COUNT=$(docker-machine ls | grep default | wc -l | xargs);
if [ "$DOCKER_COUNT" -eq "1" ]; then
  eval $(docker-machine env)
  echo "Deploy: pushing docker tag $PROJECT_NAME:$PROJECT_VERSION from machine ($DOCKER_MACHINE_NAME) to AWS";

  # get a few user params (AWS_ACCOUNT_ID, AWS_REGION, AWS_PROFILE)
  . ~/.aws/bedrock.sh;

  DOCKER_REPOSITORY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME;
  echo "Deploy: Repository = $DOCKER_REPOSITORY";

  aws --profile $AWS_PROFILE ecr describe-repositories --repository-names $PROJECT_NAME || aws --profile $AWS_PROFILE ecr create-repository --repository-name $PROJECT_NAME
  docker tag $PROJECT_NAME:$PROJECT_VERSION $DOCKER_REPOSITORY;
  aws --profile $AWS_PROFILE ecr get-login-password | docker login --username AWS --password-stdin $DOCKER_REPOSITORY;
  docker push $DOCKER_REPOSITORY;

  echo "Deploy: Finished";
else
  echo "Deploy: FAILED to deploy from docker";
fi
