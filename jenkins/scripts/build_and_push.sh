#!/usr/bin/env bash

# Export the node environment and build the deployment docker image using the Dockerfile from the deployment scripts
run_docker_build() {
  export NODE_ENV="${1}"
  docker build --build-arg NODE_ENV=${NODE_ENV} -t gcr.io/${GCP_PROJECT_ID}/${PROJECT_NAME}:${IMG_TAG} -f docker/release/Dockerfile .
}

# Run the docker build based on which branch the pipeline is being executed on
build_deployment_image(){
  # Get the first 7 characters from the sha of the last commit
  export IMG_TAG=$(echo $GIT_COMMIT | cut -c -7)

  # Build the docker image using the node environment based on which branch is being executed on the pipeline
  if [ "${GIT_BRANCH}" = "master" ]; then
    run_docker_build "production"
  elif [ "${GIT_BRANCH}" = "develop" ] || [ "${GIT_BRANCH}" = "deployment" ]; then
    run_docker_build "staging"
  fi
}

push_image_to_gcr(){
  # Authenticate docker access
  gcloud auth configure-docker --quiet

  # Push the image to GCR
  docker push gcr.io/${GCP_PROJECT_ID}/${PROJECT_NAME}:${IMG_TAG}
}

main (){
  # exit once there is non-zero exit code
  set -e

  build_deployment_image
  push_image_to_gcr
}

main
