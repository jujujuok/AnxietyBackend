import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { DashboardController } from "../dashboard/dashboard_controller";
import { DashboardService } from "../dashboard/dashboard_service";
import { DashboardRepository } from "../dashboard/dashboard_repository";

const start = async () => {
  //TODO: Add getting of env variables

  const server = await fastify({ logger: true });

  //TODO: Add middleware

  const service = await setupServices();
  await setupRoutes(server, service);

  await setupLog(server);

  try {
    await server.listen({ port: 8000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

const setupServices = async () => {
  const repository: DashboardRepository = new DashboardRepository();
  const service: DashboardService = new DashboardService(repository);

  return service;
};

const setupRoutes = async (
  server: FastifyInstance,
  service: DashboardService
) => {
  const controller = new DashboardController(service);

  server.register(addDashboardRoutes(controller), {
    prefix: "/dashboard",
  });
};

const setupLog = async (server: FastifyInstance) => {
  server.log.info("### Anxiety started ###");

  server.addHook("onRequest", (request, reply, done) => {
    server.log.info({ req: request.raw });
    done();
  });
};

const addDashboardRoutes = (
  controller: DashboardController
): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/", controller.getDashboards.bind(controller));
    instance.get("/:id", controller.getDashboardDetails.bind(controller));
    instance.get("/update", controller.getDashboardUpdate.bind(controller));
    done();
  };
};

start();
