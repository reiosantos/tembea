# tembea

[![CircleCI](https://circleci.com/gh/andela/tembea/tree/develop.svg?style=svg)](https://circleci.com/gh/andela/tembea/tree/develop)

[![Maintainability](https://api.codeclimate.com/v1/badges/2c9375e12e9652a7ec9f/maintainability)](https://codeclimate.com/repos/5bf472b3752a29565a00c791/maintainability)

[![Test Coverage](https://api.codeclimate.com/v1/badges/2c9375e12e9652a7ec9f/test_coverage)](https://codeclimate.com/repos/5bf472b3752a29565a00c791/test_coverage)

Trip management at it's best for Andela.

## Description

**Tembea** is the our solution for making trip request, scheduling, reporting and analytics very easy at Andela.

## Table of Contents

- [Documentation](#documentation)
- [Setup](#setup)
  - [Database and ORM](#database-and-orm)
- [Testing](#testing)
- [Contribute](#contribute)
- [Deployment](#deployment)
- [License](#license)

## Documentation

`/api/v1/slack` : our slack integration is our MVP

## Setup

### Dependencies

- [NodeJS](https://github.com/nodejs/node) - A JavaScript runtime environment
- [Express](https://github.com/expressjs/express) - A web application framework for NodeJS
- [PostgreSQL](https://github.com/postgres/postgres) - A relational database management system that extends SQL
- [Sequelize](https://github.com/sequelize/sequelize) - A promise-based ORM for NodeJS

### Getting Started

Follow these steps to set up the project in development mode

- Install [Nodejs](https://nodejs.org/en/download/)
- Install and setup [PostgreSQL](https://www.postgresql.org/)
- Clone the repository by running the command

  ```[bash]
  git clone https://github.com/andela/tembea.git
  ```

- Run `cd tembea` to enter the application's directory
- Install the application's dependencies by running the command
  ```
  yarn install
  ```
- Create a `.env` file in the root of your directory using the `.env.example` file in the repository
- Setup the database and migrations (**_see [database setup](#database-and-orm, 'setting up database')_**)
- Start the application by running
  ```
  yarn run start:dev
  ```
  The application should now be running at `http://127.0.0.1:5000`

#### Database and ORM

- Create a database in `PostgreSQL` and name it `tembea`
- Set the following environment variables in `.env`:

  - `DATABASE_USERNAME` - this is the database username
  - `DATABASE_PASSWORD` - this is the database password. Ignore if you don't have a database password
  - `DATABASE_NAME` - set this to `tembea`

- Run database migrations
  ```
  yarn run db:migrate
  ```
- Check the database and confirm that the `users` table has been created

### More about environmental variables

After setting up your `.env` from the template provided in the `.env.sample` file,
to use these variables anywhere in the app;

- import the `dotenv` package

```[js]
import dotenv from 'dotenv'
```

- Make it available for use as early as possible in that file

```[js]
dotenv.config()
```

- Access any variable in the `.env`

```[js]
process.env.MY_ENV_VARIABLE
```

### Run the Service Using Docker

> NOTE: Make sure no service is running on port 5000.

To run the application just type: `make start`

this would run your application inside a container which you can easily access using `localhost:5000`.

To stop the application, you can just hit `^c`.

To delete the containers: `make stop`

> WARNING: Running below command will make you loose all your data including data in the database!

To cleanup all the containers + volumes: `make clean`

> NOTE: The below commands should be run when the application is running inside container

To migrate database: `make migrate`

To seed database: `make seed`

To rollback migrations: `make rollback`

To get inside the container: `make ssh`

## Testing

[Jest](https://jestjs.io) is used as the testing framework for both the unit tests and integration tests.
To execute all tests, run the command

```
  yarn test or make test
```

## Contribute

Contributions to the project are welcome! Before contributing, look through the branch naming, commit message and pull request conventions [here](https://github.com/andela/engineering-playbook/tree/master/5.%20Developing/Conventions). When you are all done, follow the guidelines below to raise a pull request:

- Identify the feature, chore or bug to be worked on from the [pivotal tracker board](https://www.pivotaltracker.com/n/projects/2223435). If the ticket does not exist on the board, consult the project owners for approval before adding the ticket to the board.
- Clone the repository and checkout from `develop` to a new branch to start working on the assigned task. Ensure branch names follow the convention linked above.
- Work on the task following the coding standards and [style guide](https://github.com/airbnb/javascript) used in the project.
- When task has been completed, make commits and raise a pull request against `develop` branch, also ensure to follow the conventions linked above.

If the pull request is accepted by the owners of the repository, then it is merged into the `develop` branch and closed.

## Deployment

TODO - add deployment commands

## License

I am not sure about this
