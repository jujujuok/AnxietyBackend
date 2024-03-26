import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { DwDController } from "../dwd/dwd_controller";
import { DwDService } from "../dwd/dwd_service";
import { DwDRepository } from "../dwd/dwd_repository";

const start = async () => {
  //TODO: Add getting of env variables

  //TODO: Add database connection

  const server = await fastify({ logger: true });

  //TODO: Add middleware

  const typeService = await setupServices();
  await setupRoutes(server, typeService);

  await setupLog(server);

  try {
    await server.listen({ port: 8000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  //TODO: Add graceful shutdown including database connection
};

const setupServices = async () => {
  const dwdRepository = new DwDRepository();
  const dwdService = new DwDService(dwdRepository);

  return dwdService;
};

const setupRoutes = async (server: FastifyInstance, service: DwDService) => {
  const dwdController = new DwDController(service);

  server.register(addTypeRoutes(dwdController), { prefix: "/types" });
};

const setupLog = async (server: FastifyInstance) => {
  server.log.info("### Type Service started ###");

  server.addHook("onRequest", (request, reply, done) => {
    server.log.info({ req: request.raw });
    done();
  });
};

const addTypeRoutes = (controller: DwDController): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/type", controller.getTypes.bind(controller));
    done();
  };
};

start();
