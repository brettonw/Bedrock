#! /usr/bin/env bash

. bin/common.sh $1

# exit on any error

# docker setup
set -e
DOCKER_COUNT=$(docker system info | grep -i images | awk '{print $2}');
set +e

echo "Deploy: pushing docker tag $PROJECT_NAME:$PROJECT_VERSION to AWS";

# get a few user params (AWS_ACCOUNT_ID, AWS_REGION, AWS_PROFILE)
. ~/.aws/bedrock.sh;

DOCKER_REPOSITORY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME;
echo "Deploy: Repository ($DOCKER_REPOSITORY)";
aws --profile $AWS_PROFILE ecr create-repository --repository-name $PROJECT_NAME || echo "Deploy: Repository for $PROJECT_NAME exists";

echo "Deploy: docker tag";
docker tag $PROJECT_NAME:$PROJECT_VERSION $DOCKER_REPOSITORY;

echo "Deploy: get login password";
LOGIN_PASSWORD=$(aws --profile $AWS_PROFILE ecr get-login-password);
#echo "Login password: $LOGIN_PASSWORD";

echo "Deploy: set login";
echo $LOGIN_PASSWORD | docker login --username AWS --password-stdin $DOCKER_REPOSITORY;

echo "Deploy: push repository";
docker push $DOCKER_REPOSITORY;

echo "Deploy: Finished";
