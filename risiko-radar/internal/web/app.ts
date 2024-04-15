import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { DashboardController } from "../dashboard/dashboard_controller";
import { DashboardService } from "../dashboard/dashboard_service";
import { DashboardRepository } from "../dashboard/dashboard_repository";
import { MapRepository } from "../map/map_repository";
import { MapController } from "../map/map_controller";
import { MapService } from "../map/map_service";
import { WorldMapController } from "../world-map/world-map_controller";
import { WorldMapRepository } from "../world-map/world-map_repository";
import { WorldMapService } from "../world-map/world-map_service";

/**
 * Start routine of the application
 */
const start = async () => {
  //TODO: Add getting of env variables

  // setup fastify instance
  const server = await fastify({ logger: true });

  setupCors(server);

  // setup services and routes for the different modules
  const [dashboardService, mapService, worldMapService] = await setupServices();
  await setupRoutes(
    server,
    dashboardService as DashboardService,
    mapService as MapService,
    worldMapService as WorldMapService
  );

  // setup logging
  await setupLog(server);

  // start the server
  try {
    await server.listen({ port: 8000, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

const setupCors = (server: FastifyInstance) => {
  server.register(require("@fastify/cors"), {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  });
};

/**
 * Initialize the services, including their repositories, for the different modules
 * @returns Array of the services for the different modules
 */
const setupServices = async () => {
  const dashboardRepository: DashboardRepository = new DashboardRepository();
  const dashboardService: DashboardService = new DashboardService(
    dashboardRepository
  );

  const mapRepository: MapRepository = new MapRepository();
  const mapService: MapService = new MapService(mapRepository);

  const worldMapRepository: WorldMapRepository = new WorldMapRepository();
  const worldMapService: WorldMapService = new WorldMapService(
    worldMapRepository
  );

  return [dashboardService, mapService, worldMapService];
};

/**
 *
 * @param server Instance of Fastify
 * @param dashboardService Service for dashboard module
 * @param mapService Service for map module
 * @param worldMapService Service for WorldMap module
 */
const setupRoutes = async (
  server: FastifyInstance,
  dashboardService: DashboardService,
  mapService: MapService,
  worldMapService: WorldMapService
) => {
  const dashboardController = new DashboardController(dashboardService);
  const mapController = new MapController(mapService);
  const worldMapController = new WorldMapController(worldMapService);

  server.register(addDashboardRoutes(dashboardController), {
    prefix: "/dashboard",
  });

  server.register(addMapRoutes(mapController), {
    prefix: "/map",
  });

  server.register(addWorldMapRoutes(worldMapController), {
    prefix: "/world-map",
  });
};

/**
 * Setup logging for the application
 * @param server Instance of Fastify
 */
const setupLog = async (server: FastifyInstance) => {
  server.log.info("### risiko-radar started ###");

  // log all requests
  server.addHook("onRequest", (request, reply, done) => {
    server.log.info({ req: request.raw });
    done();
  });
};

/**
 * Add routes for the dashboard module
 * @param dashboardController Controller for the dashboard module
 * @returns FastifyPluginCallback for registering the routes
 */
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

/**
 * Add routes for the map module
 * @param mapController Controller for the map module
 * @returns FastifyPluginCallback for registering the routes
 */
const addMapRoutes = (mapController: MapController): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/", mapController.getMap.bind(mapController));
    instance.get("/:id", mapController.getMapDetails.bind(mapController));
    instance.get("/update", mapController.getMapUpdate.bind(mapController));
    done();
  };
};

/**
 * Add routes for the WorldMap module
 * @param WorldMapController Controller for the WorldMap module
 * @returns FastifyPluginCallback for registering the routes
 */
const addWorldMapRoutes = (
  WorldMapController: WorldMapController
): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/", WorldMapController.getWorldMap.bind(WorldMapController));
    instance.get(
      "/:id",
      WorldMapController.getWorldMapDetails.bind(WorldMapController)
    );
    instance.get(
      "/update",
      WorldMapController.getWorldMapUpdate.bind(WorldMapController)
    );
    done();
  };
};

// Initial start call
start();
