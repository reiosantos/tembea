#!/usr/bin/env bash

# Exit immediately if a command exits with an non-zero status
set -e

# Generate slack payload to be sent in the notification
generate_slack_payLoad() {
  cat <<EOF
  {
    "channel":"${TEMBEA_JENKINS_SLACK_CHANNEL}",
    "username": "PipelineNotification",
    "text": "${2}",
    "attachments": [
      {
        "title": "${1} >> $(git rev-parse --short HEAD)",
        "title_link": "https://github.com/andela/tembea/commit/$GIT_COMMIT",
        "color": "${3}",
        "actions": [
          {
            "text": "View Commit",
            "type": "button",
            "url": "https://github.com/andela/tembea/commit/${GIT_COMMIT}",
            "style": "${4}"
          },
          {
            "text": "View Build",
            "type": "button",
            "url": "${BUILD_URL}",
            "style": "${4}"
          },
          {
            "text": "View Job",
            "type": "button",
            "url": "${JOB_URL}",
            "style": "${4}"
          }
        ]
      }
    ]
  }
EOF
}

# Function to send the slack notification using CURL
send_notification() {
  curl -X POST -H 'Content-type: application/json' --data "$(generate_slack_payLoad "${1}" "${2}" "${3}" "${4}")" "${TEMBEA_JENKINS_SLACK_HOOK}"
}


# Function to send notification on success
send_success_notification(){
  if [ "${GIT_BRANCH}" == "master" ] \
  || [ "${GIT_BRANCH}" == "develop" ] \
  || [ "${GIT_BRANCH}" == "test-jenkins" ]
  then
    NOTIFICATION_TITLE="$GIT_BRANCH deployment success!"
    NOTIFICATION_BODY="Successfully deployed ${GIT_BRANCH} to ${NAMESPACE}."
  else
    NOTIFICATION_TITLE="$GIT_BRANCH pipeline success"
    NOTIFICATION_BODY="Jenkins pipeline for ${GIT_BRANCH} was successfully executed."
  fi

  TEXT=":aw-yeah: $NOTIFICATION_BODY :aw-yeah:"
  STYLE="primary"
  COLOR="good"
  send_notification "Backend: ${NOTIFICATION_TITLE}" "${TEXT}" "${COLOR}" "${STYLE}"
}

# Function to send notification on failure
send_failure_notification(){
  if [ "${GIT_BRANCH}" == "master" ] \
  || [ "${GIT_BRANCH}" == "develop" ] \
  || [ "${GIT_BRANCH}" == "test-jenkins" ]
  then
    NOTIFICATION_TITLE="Failed to deploy $GIT_BRANCH"
    NOTIFICATION_BODY="Tembea backend deployment for ${GIT_BRANCH} failed."
  else
    NOTIFICATION_TITLE="Pipeline failed for $GIT_BRANCH"
    NOTIFICATION_BODY="Jenkins pipeline for ${GIT_BRANCH} failed."
  fi

  TEXT=":man-sad: $NOTIFICATION_BODY :man-sad:"
  STYLE="danger"
  COLOR="danger"
  send_notification "Backend: ${NOTIFICATION_TITLE}" "${TEXT}" "${COLOR}" "${STYLE}"
}

$@
