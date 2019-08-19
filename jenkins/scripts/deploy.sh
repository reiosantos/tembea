#!/usr/bin/env bash

# Exit immediately if a command exits with an non-zero status
set -e

# export environment variables shared by both the production and staging environments
export_env(){
  # export environment variables common to staging and production
  export TEMBEA_MAIL_USER="$TEMBEA_MAIL_USER"
  export TEMBEA_MAIL_PASSWORD="$TEMBEA_MAIL_PASSWORD"
  export TEMBEA_MAIL_SERVICE="$TEMBEA_MAIL_SERVICE"
  export TEMBEA_MAIL_ADDRESS="$TEMBEA_MAIL_ADDRESS"
  export FRONTEND_PROJECT_NAME="$FRONTEND_PROJECT_NAME"
  export SUPER_ADMIN_SLACK_ID="$SUPER_ADMIN_SLACK_ID"
  export SUPER_ADMIN_EMAIL="$SUPER_ADMIN_EMAIL"
  export JWT_TEMBEA_SECRET="$JWT_TEMBEA_SECRET"
  export THE_DOJO_ADDRESS="$THE_DOJO_ADDRESS"
  export PROJECT_NAME="$PROJECT_NAME"
  export NAMESPACE="$NAMESPACE"
  export IMG_TAG=$(echo $GIT_COMMIT | cut -c -7)
  export GCP_PROJECT_ID="$GCP_PROJECT_ID"
  export BUGSNAG_API_KEY="$BUGSNAG_API_KEY"
  export NODE_ENV="$NODE_ENV"
  export SLACK_OAUTH_TOKEN="$SLACK_OAUTH_TOKEN"
  export SLACK_BOT_OAUTH_TOKEN="$SLACK_BOT_OAUTH_TOKEN"
  export NGINX_INGRESS_LIMIT_RPS="$NGINX_INGRESS_LIMIT_RPS"
  export NGINX_INGRESS_LIMIT_CONNECTIONS="$NGINX_INGRESS_LIMIT_CONNECTIONS"
  export NGINX_INGRESS_BACKEND_PROTOCOL="$NGINX_INGRESS_BACKEND_PROTOCOL"

  # export production environment variables
  if [ "${GIT_BRANCH}" = "master" ]; then
    export SLACK_CLIENT_ID="$PROD_SLACK_CLIENT_ID"
    export SLACK_CLIENT_SECRET="$PROD_SLACK_CLIENT_SECRET"
    export SLACK_SIGNING_SECRET="$PROD_SLACK_SIGNING_SECRET"
    export INGRESS_REGIONAL_IP="$PROD_INGRESS_REGIONAL_IP"
    export TEMBEA_DOMAIN="$PROD_TEMBEA_DOMAIN"
    export TEMBEA_FRONTEND_DOMAIN="$PROD_TEMBEA_FRONTEND_DOMAIN"
    export AIS_API_KEY="$PROD_AIS_API_KEY"
    export AIS_BASE_URL="$PROD_AIS_BASE_URL"
    export JWT_ANDELA_KEY="$PROD_JWT_ANDELA_KEY"
    export REDIS_URL="$PROD_REDIS_URL"
    export APPRENTICESHIP_SUPER_ADMIN_EMAIL="$PROD_APPRENTICESHIP_SUPER_ADMIN_EMAIL"
    export APPRENTICESHIP_SUPER_ADMIN_SLACK_ID="$PROD_APPRENTICESHIP_SUPER_ADMIN_SLACK_ID"
    export GOOGLE_MAPS_API_KEY="$PROD_GOOGLE_MAPS_API_KEY"
    export KENYA_TRAVEL_TEAM_EMAIL="$PROD_KENYA_TRAVEL_TEAM_EMAIL"
    export MAILGUN_API_KEY="$PROD_MAILGUN_API_KEY"
    export MAILGUN_DOMAIN="$PROD_MAILGUN_DOMAIN"
    export INSTANCE_CONNECTION_NAME="$PROD_INSTANCE_CONNECTION_NAME"
    export DATABASE_URL="$PROD_DATABASE_URL"
    export NAMESPACE="production"
    export TEMBEA_PRIVATE_KEY="$PROD_TEMBEA_PRIVATE_KEY"
    export TEMBEA_PUBLIC_KEY="$PROD_TEMBEA_PUBLIC_KEY"

  elif [ "${GIT_BRANCH}" = "develop" ]; then
    # export staging environment variables
    export SLACK_CLIENT_ID="$STAGING_SLACK_CLIENT_ID"
    export SLACK_CLIENT_SECRET="$STAGING_SLACK_CLIENT_SECRET"
    export SLACK_SIGNING_SECRET="$STAGING_SLACK_SIGNING_SECRET"
    export INGRESS_REGIONAL_IP="$STAGING_INGRESS_REGIONAL_IP"
    export TEMBEA_DOMAIN="$STAGING_TEMBEA_DOMAIN"
    export TEMBEA_FRONTEND_DOMAIN="$STAGING_TEMBEA_FRONTEND_DOMAIN"
    export AIS_API_KEY="$STAGING_AIS_API_KEY"
    export AIS_BASE_URL="$STAGING_AIS_BASE_URL"
    export JWT_ANDELA_KEY="$STAGING_JWT_ANDELA_KEY"
    export REDIS_URL="$STAGING_REDIS_URL"
    export APPRENTICESHIP_SUPER_ADMIN_EMAIL="$STAGING_APPRENTICESHIP_SUPER_ADMIN_EMAIL"
    export APPRENTICESHIP_SUPER_ADMIN_SLACK_ID="$STAGING_APPRENTICESHIP_SUPER_ADMIN_SLACK_ID"
    export GOOGLE_MAPS_API_KEY="$STAGING_GOOGLE_MAPS_API_KEY"
    export KENYA_TRAVEL_TEAM_EMAIL="$STAGING_KENYA_TRAVEL_TEAM_EMAIL"
    export MAILGUN_API_KEY="$STAGING_MAILGUN_API_KEY"
    export MAILGUN_DOMAIN="$STAGING_MAILGUN_DOMAIN"
    export INSTANCE_CONNECTION_NAME="$STAGING_INSTANCE_CONNECTION_NAME"
    export DATABASE_URL="$STAGING_DATABASE_URL"
    export NAMESPACE="staging"
    export TEMBEA_PRIVATE_KEY="$STAGING_TEMBEA_PRIVATE_KEY"
    export TEMBEA_PUBLIC_KEY="$STAGING_TEMBEA_PUBLIC_KEY"
    export ANALYTICS_CLIENT_EMAIL="$STAGING_ANALYTICS_CLIENT_EMAIL"
    export ANALYTICS_PRIVATE_KEY="$STAGING_ANALYTICS_PRIVATE_KEY"
  fi

  export NODE_ENV=${NAMESPACE}
}

# Clone the deployment repository using an sshkey added to the repository
clone_deployment_repo(){
  # Disable strict host key checking
  mkdir ~/.ssh/ && echo "Host github.com\n\tStrictHostKeyChecking no\n" > ~/.ssh/config
  echo $SSH_PRIVATE_KEY | base64 --decode >> ~/.ssh/id_rsa
  sudo chmod 400 ~/.ssh/id_rsa

  # Clone the the specific branch for the current node environment
  if [ "${GIT_BRANCH}" = "master" ]; then
    git clone -b master ${DEPLOYMENT_SCRIPTS_REPO}
  elif [ "${GIT_BRANCH}" = "develop" ]; then
    git clone -b develop ${DEPLOYMENT_SCRIPTS_REPO} -vvv
  fi
}

# Install gettext to enable environment variable substitution in the deployment yaml files
install_gettext(){
  apt-get install gettext -y
}

# Substitute the variables with the values of their corresponding environment variables
substitute_env(){
  cd tembea-deployment-scripts/ansible/jenkins-backend
  envsubst < ./roles/db_migrations/templates/tembea-migrations-job.yml > tembea-migrations-job.yml
  envsubst < ./roles/deployment/templates/tembea-backend-deployment.yml > tembea-backend-deployment.yml
  envsubst < ./roles/service/templates/tembea-backend-service.yml > tembea-backend-service.yml
  envsubst < ./roles/ingress/templates/nginx-service.yml > nginx-service.yml
  envsubst < ./roles/ingress/templates/ingress.yml > ingress.yml
}

deploy(){
  chmod +x deploy.sh
  bash deploy.sh
}

main(){
  clone_deployment_repo
  install_gettext
  export_env
  substitute_env
  deploy
}

main

$@
