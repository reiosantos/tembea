#!/usr/bin/env bash

export_namespace(){
  sleep 1m

  # set the namespace
  if [ "${GIT_BRANCH}" = "master" ]; then
    export NAMESPACE="production"
  elif [ "${GIT_BRANCH}" = "develop" ]; then
    export NAMESPACE="staging"
  fi
}

export_job_status(){
  # set the name of the job
  export JOB_NAME=${PROJECT_NAME}-${NAMESPACE}

  # get the currently active job
  export ACTIVE=$(kubectl get job -o 'jsonpath={.status.active}' ${JOB_NAME} --namespace ${NAMESPACE})

  # get the status of the completed job
  export SUCCEEDED=$(kubectl get job -o 'jsonpath={.status.succeeded}' ${JOB_NAME} --namespace ${NAMESPACE})
}

delete_job(){
  # if the job is completed, delete the job
  if ([ "${ACTIVE}" == "null" ] || [[ -z "${ACTIVE}" ]] ) && [ "${SUCCEEDED}" == "1" ]; then
    echo "Blocking job ${JOB_NAME} succesfully completed, deleting"
    kubectl delete job ${JOB_NAME} --namespace=${NAMESPACE}
  fi
}

main(){
  export_namespace
  export_job_status
  delete_job
}

main
