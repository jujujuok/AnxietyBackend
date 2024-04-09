import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { AutobahnController } from "../autobahn/autobahn_controller";
import { AutobahnService } from "../autobahn/autobahn_service";
import { AutobahnRepository } from "../autobahn/autobahn_repository";
import dotenv from "dotenv";
import { Pool } from "pg";

const start = async () => {
  // Load environment variables from .env
  dotenv.config();

  //TODO: Add database connection

  const server = await fastify({ logger: true });

  //TODO: Add middleware

  const autobahnService = await setupServices();
  await setupRoutes(server, autobahnService);

  await setupLog(server);

  try {
    await server.listen({ port: 8000, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  //TODO: Add graceful shutdown including database connection
};

const setupServices = async () => {

  const db = new Pool({
    
  });

  const autobahnRepository = new AutobahnRepository(db);
  const autobahnService = new AutobahnService(autobahnRepository);

  return autobahnService;
};

const setupRoutes = async (server: FastifyInstance, service: AutobahnService) => {
  const autobahnController = new AutobahnController(service);

  server.register(addAutobahnRoutes(autobahnController), { prefix: "/autobahn" });
};

const setupLog = async (server: FastifyInstance) => {
  server.log.info("### Autobahn Service started ###");

  server.addHook("onRequest", (request, reply, done) => {
    server.log.info({ req: request.raw });
    done();
  });
};

const addAutobahnRoutes = (controller: AutobahnController): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/fetchData", controller.fetchData.bind(controller));
    instance.get("/getData", controller.getData.bind(controller));
    done();
  };
};

start();
