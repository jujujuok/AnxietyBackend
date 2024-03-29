import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { DashboardController } from "../dashboard/dashboard_controller";
import { DashboardService } from "../dashboard/dashboard_service";
import { DashboardRepository } from "../dashboard/dashboard_repository";
import { MapRepository } from "../map/map_repository";
import { MapController } from "../map/map_controller";
import { MapService } from "../map/map_service";

const start = async () => {
  //TODO: Add getting of env variables

  const server = await fastify({ logger: true });

  //TODO: Add middleware

  const [dashboardService, mapService] = await setupServices();
  await setupRoutes(
    server,
    dashboardService as DashboardService,
    mapService as MapService
  );

  await setupLog(server);

  try {
    await server.listen({ port: 8000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

const setupServices = async () => {
  const dashboardRepository: DashboardRepository = new DashboardRepository();
  const dashboardService: DashboardService = new DashboardService(
    dashboardRepository
  );

  const mapRepository: MapRepository = new MapRepository();
  const mapService: MapService = new MapService(mapRepository);

  return [dashboardService, mapService];
};

const setupRoutes = async (
  server: FastifyInstance,
  dashboardService: DashboardService,
  mapService: MapService
) => {
  const dashboardController = new DashboardController(dashboardService);
  const mapController = new MapController(mapService);

  server.register(addDashboardRoutes(dashboardController), {
    prefix: "/dashboard",
  });

  server.register(addMapRoutes(mapController), {
    prefix: "/map",
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
  dashboardController: DashboardController
): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get(
      "/",
      dashboardController.getDashboard.bind(dashboardController)
    );
    instance.get(
      "/:id",
      dashboardController.getDashboardDetails.bind(dashboardController)
    );
    instance.get(
      "/update",
      dashboardController.getDashboardUpdate.bind(dashboardController)
    );
    done();
  };
};

const addMapRoutes = (mapController: MapController): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/", mapController.getMap.bind(mapController));
    instance.get("/:id", mapController.getMapDetails.bind(mapController));
    instance.get("/update", mapController.getMapUpdate.bind(mapController));
    done();
  };
};

start();
