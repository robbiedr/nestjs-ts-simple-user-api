<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Prerequisites

Before running the Simple User Management project, make sure you have the following dependencies installed:
- Docker: Install Docker from [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
- Node.js: Install Node.js from [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

## Getting Started

To run the Simple User Management project, you will need to have Docker installed on your system. Docker provides a containerization platform that simplifies the setup and deployment of the application's dependencies.

Follow the steps below to get started:

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/robbiedr/nestjs-ts-simple-user-api.git
   ```

2. Navigate to the project directory:
   ```bash
   cd simple-user-management
   ```

3. Create a `.env` file in the root directory and provide the necessary environment variables. You can use the provided `.env.example` file as a template.

4. Update the database connection configuration in the `app.js` file based on your setup:
   - If you are running the application locally without using Docker, set the `DB_HOST` environment variable to `127.0.0.1`.
   - If you are running the application using Docker, set the `DB_HOST` environment variable to the service name defined in the `docker-compose.yml` file.

5. Build and start the Docker containers using docker-compose:
   ```bash
   npm run docker
   ```

   This command will build the application and database containers and start them. You should see the application logs in the terminal.

6. Access the application:
   Once the containers are up and running, you can access the Simple User Management application by opening your web browser and navigating to [http://localhost:3000](http://localhost:3000).

   Replace `3000` with the actual port number specified in the environment variable `APP_PORT`.

7. Use the application:
   - Register a user.
   - Open MailDev browser (refer to step #8), then activate account.
   - Login the user account
   - Change password then re-login account
   - Retrieve user details and users list

8. MailDev:
   The application uses MailDev as a mock email server for sending emails. You can access the MailDev web interface by opening your web browser and navigating to http://localhost:1080. Emails sent by the application will be captured and displayed in the MailDev interface.

9. API Documentation:
   The Simple User Management API is documented using Swagger. You can access the API documentation by opening your web browser and navigating to http://localhost:${APP_PORT}/api-docs. The API documentation provides detailed information about the available endpoints, request bodies, responses, and more.

10. Stop the containers:
   To stop the application and the associated containers, press Ctrl+C in the terminal where you ran the docker-compose up command.


>**Note:** It is highly recommended to use Docker for running the application as it provides a consistent and isolated environment. If you choose to run the application without Docker, ensure that you have a compatible PostgreSQL database configured and update the database connection details accordingly.


That's it! You now have the Simple User Management project up and running using Docker. Feel free to explore the code, make modifications, and enhance the functionality as per your requirements.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Robbie del Rosario](https://github.com/robbiedr)

## License

Nest is [MIT licensed](LICENSE).
