import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { TypeController } from "../type/type_controller";
import { TypeService } from "../type/type_service";
import { TypeRepository } from "../type/type_repository";

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
  const typeRepository = new TypeRepository();
  const typeService = new TypeService(typeRepository);

  return typeService;
};

const setupRoutes = async (server: FastifyInstance, service: TypeService) => {
  const typeController = new TypeController(service);

  server.register(addTypeRoutes(typeController), { prefix: "/types" });
};

const setupLog = async (server: FastifyInstance) => {
  server.log.info("### Type Service started ###");

  server.addHook("onRequest", (request, reply, done) => {
    server.log.info({ req: request.raw });
    done();
  });
};

const addTypeRoutes = (controller: TypeController): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/type", controller.getTypes.bind(controller));
    done();
  };
};

start();
