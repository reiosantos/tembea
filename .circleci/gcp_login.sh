#!/bin/bash
ROOT_DIR=$(pwd)

generateServiceAccount() {
  mkdir $ROOT_DIR/shared
  touch $ROOT_DIR/shared/account.json
  echo ${SERVICE_ACCOUNT} > $ROOT_DIR/shared/account.json
  ls -la
  pwd
}

activateServiceAccount() {
  # setup kubectl auth
  gcloud auth activate-service-account --key-file $ROOT_DIR/shared/account.json
  echo $ROOT_DIR
  gcloud --quiet config set project ${GCP_PROJECT_ID}
  gcloud --quiet config set compute/zone ${COMPUTE_ZONE}
  if [ "${CIRCLE_BRANCH}" = "master" ]; then
    gcloud --quiet container clusters get-credentials ${PROD_CLUSTER_NAME}
  elif [ "${CIRCLE_BRANCH}" = "develop" ]; then
    gcloud --quiet container clusters get-credentials ${STAGING_CLUSTER_NAME}
  fi
  gcloud config list
}

main(){
  generateServiceAccount
  activateServiceAccount
}

main $@
