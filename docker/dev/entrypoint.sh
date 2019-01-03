#!/bin/sh
printf "Waiting for postgres..."

while !nc -z database 5432; do
  sleep 0.1
done

printf "PostgreSQL started"
printf "\n\n======================================\n"
printf "Making database migrations"
printf "\n======================================\n\n"
export NODE_ENV=development
yarn db:migrate

printf "\n\n======================================\n"
printf "Start the application"
printf "\n======================================\n\n"
yarn start:dev

exit 0