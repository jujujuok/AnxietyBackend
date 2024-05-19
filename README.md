![Website](https://img.shields.io/website?url=https%3A%2F%2Fapi.risiko-radar.info%2Fhealth&label=API%20Status&link=https%3A%2F%2Frisiko-radar.info%2F)

# Risiko Radar Backend

A set of services collecting warnings from different APIs.
These warnings are then processed and stored in a database.
The data is then served to the frontend via a Main REST API (risiko-radar).

_See the openapi documentation for more information on the endpoints._

This solves the problem of having to access different apps and websites to access information regarding your security.

## Table of Contents
* [Clone the repository](#clone-the-repository)
* [Requirements](#requirements)
* [Local Development Setup](#local-development-setup)
* [Access the production environment](#access-the-production-environment)
* [Technologies used](#technologies-used)

## Clone the repository

```bash
git clone https://github.com/jujujuok/AnxietyBackend.git
```

## Requirements

- Node.js/NPM
- Docker
- Docker Compose

## Local Development Setup

Create a `.env` file in the root directory of the repository with content based on the `.env.example` file.

The values for the .env file can be copied from the server.

### Microserivce Template

The ./ms-template directory contains a template for a microservice.
This can be copied and used as a base for new services.

### Start single service

Copy the `.env` file to the directory of the service you want to start. 
Then enter the directory and run the following command:

```bash
npm i
npm build
npm start
```

Alternatively, you can use the following command to start the service in development mode (with hot reload):

```bash
npm run dev
```

### Start all services
To start all services, run the following command in the root directory of the repository:

```bash
docker compose up -d
```

**!This does not perfectly reflect the architecture running on the Server!**

_Since all of the services are dependent on the database and it's content, there wouldn't be much sense in using a local db with blank tables. Therefore the services will connect to postgres and redis running on the server, allthough the docker compose services will start locally._

_Also the `docker-compose.yml` has the same content as the server and will try to setup traefik routes for the domain and an ssl certificate, which will fail locally._

## Access the production environment

The production environment is running on a server with the following IP: `212.132.100.147`.
You can access it via ssh if you have the correct permissions.

### Update Images on Server

To do this, you will need to have your ssh key added to the server.

You can make a clean update of the images on the server by running the following script:

```bash
./updateImages.sh
```

Alternatively, you can manually update one service:
```bash
./updateService.sh <service-name>
```

## Technologies used

### API Services
- TypeScript (language)
- Node.js (runtime)
- Fastify (framework for API services)
- Axios (HTTP client)
- Faker.js (mock data generator)

### Architecture
- Docker (containerization)
- Traefik (reverse proxy)
- PostgreSQL (database)
- PostGIS (database extension for geospatial data)
- Redis (cache)
