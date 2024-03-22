import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { ProductWarningController } from "../product-warning/product-warning_controller";
import { ProductWarningService } from "../product-warning/product-warning_service";
import { ProductWarningRepository } from "../product-warning/product-warning_repository";

const start = async () => {
  //TODO: Add getting of env variables

  //TODO: Add database connection

  const server = await fastify({ logger: true });

  //TODO: Add middleware

  const productWarningService = await setupServices();
  await setupRoutes(server, productWarningService);

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
  const productWarningRepository = new ProductWarningRepository();
  const productWarningService = new ProductWarningService(productWarningRepository);

  return productWarningService;
};

const setupRoutes = async (server: FastifyInstance, service: ProductWarningService) => {
  const productWarningController = new ProductWarningController(service);

  server.register(addProductWarningRoutes(productWarningController), { prefix: "/product-warning"});
};

const setupLog = async (server: FastifyInstance) => {
  server.log.info("### Type Service started ###");

  server.addHook("onRequest", (request, reply, done) => {
    server.log.info({ req: request.raw });
    done();
  });
};

const addProductWarningRoutes = (controller: ProductWarningController): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/all", controller.getAll.bind(controller));
    done();
  };
};

start();
