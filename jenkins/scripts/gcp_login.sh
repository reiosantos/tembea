#!/usr/bin/env bash

# Exit immediately if a command exits with an non-zero status
set -e

# Get the root directory and store it in a variable
ROOT_DIR=$(pwd)

# Create a service account file for authentication
generateServiceAccountFile() {
  mkdir $ROOT_DIR/shared
  touch $ROOT_DIR/shared/account.json
  echo $SERVICE_ACCOUNT | base64 --decode > $ROOT_DIR/shared/account.json
}

# Activate the service account and login to GCP
activateServiceAccount() {
  gcloud auth activate-service-account --key-file $ROOT_DIR/shared/account.json
  echo $ROOT_DIR
  gcloud --quiet config set project ${GCP_PROJECT_ID}
  gcloud --quiet config set compute/zone ${COMPUTE_ZONE}
  if [ "${GIT_BRANCH}" = "master" ]; then
    gcloud --quiet container clusters get-credentials ${PROD_CLUSTER_NAME}
  elif [ "${GIT_BRANCH}" = "develop" ]; then
    gcloud --quiet container clusters get-credentials ${STAGING_CLUSTER_NAME}
  fi
  gcloud config list
}

main(){
  generateServiceAccountFile
  activateServiceAccount
}

main $@
