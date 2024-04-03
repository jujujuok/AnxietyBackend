import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { NinaController } from "../type/nina_controller";
import { NinaService } from "../type/nina_service";
import { NinaRepository } from "../type/nina_repository";
import dotenv from "dotenv";

const start = async () => {
  // Load environment variables from .env
  dotenv.config();

  //TODO: Add database connection

  const server = await fastify({ logger: true });

  //TODO: Add middleware

  const ninaService = await setupServices();
  await setupRoutes(server, ninaService);

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
  const ninaRepository = new NinaRepository();
  const ninaService = new NinaService(ninaRepository);

  return ninaService;
};

const setupRoutes = async (server: FastifyInstance, service: NinaService) => {
  const ninaController = new NinaController(service);

  server.register(addNinaRoutes(ninaController), { prefix: "/nina" });
};

const setupLog = async (server: FastifyInstance) => {
  server.log.info("### Type Service started ###");

  server.addHook("onRequest", (request, reply, done) => {
    server.log.info({ req: request.raw });
    done();
  });
};

const addNinaRoutes = (controller: NinaController): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/fetchData", controller.fetchData.bind(controller));
    done();
  };
};

start();
