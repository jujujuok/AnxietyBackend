import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { DashboardController } from "../dashboard/dashboard_controller";
import { DashboardService } from "../dashboard/dashboard_service";
import { DashboardRepository } from "../dashboard/dashboard_repository";
import { MapRepository } from "../map/map_repository";
import { MapController } from "../map/map_controller";
import { MapService } from "../map/map_service";
import { CountryController } from "../country/country_controller";
import { CountryRepository } from "../country/country_repository";
import { CountryService } from "../country/country_service";

/**
 * Start routine of the application
 */
const start = async () => {
  //TODO: Add getting of env variables

  // setup fastify instance
  const server = await fastify({ logger: true });

  //TODO: Add middleware

  // setup services and routes for the different modules
  const [dashboardService, mapService, countryService] = await setupServices();
  await setupRoutes(
    server,
    dashboardService as DashboardService,
    mapService as MapService,
    countryService as CountryService
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

  const countryRepository: CountryRepository = new CountryRepository();
  const countryService: CountryService = new CountryService(countryRepository);

  return [dashboardService, mapService, countryService];
};

/**
 *
 * @param server Instance of Fastify
 * @param dashboardService Service for dashboard module
 * @param mapService Service for map module
 * @param countryService Service for country module
 */
const setupRoutes = async (
  server: FastifyInstance,
  dashboardService: DashboardService,
  mapService: MapService,
  countryService: CountryService
) => {
  const dashboardController = new DashboardController(dashboardService);
  const mapController = new MapController(mapService);
  const countryController = new CountryController(countryService);

  server.register(addDashboardRoutes(dashboardController), {
    prefix: "/dashboard",
  });

  server.register(addMapRoutes(mapController), {
    prefix: "/map",
  });

  server.register(addCountryRoutes(countryController), {
    prefix: "/world-map",
  });
};

/**
 * Setup logging for the application
 * @param server Instance of Fastify
 */
const setupLog = async (server: FastifyInstance) => {
  server.log.info("### Anxiety started ###");

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
 * Add routes for the country module
 * @param countryController Controller for the country module
 * @returns FastifyPluginCallback for registering the routes
 */
const addCountryRoutes = (
  countryController: CountryController
): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/", countryController.getCountry.bind(countryController));
    instance.get(
      "/:id",
      countryController.getCountryDetails.bind(countryController)
    );
    instance.get(
      "/update",
      countryController.getCountryUpdate.bind(countryController)
    );
    done();
  };
};

// Initial start call
start();
