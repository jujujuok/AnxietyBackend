import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { AutobahnController } from "../autobahn/autobahn_controller";
import { AutobahnService } from "../autobahn/autobahn_service";
import { AutobahnRepository } from "../autobahn/autobahn_repository";
import dotenv from "dotenv";
import { Pool } from "pg";

const start = async () => {
  // Load environment variables from .env
  dotenv.config();

  const server = await fastify({ logger: true });

  const db_pool = await setupDB(server);

  //TODO: Add middleware

  const autobahnService = await setupServices(db_pool);
  await setupRoutes(server, autobahnService);

  await setupLog(server);

  try {
    await server.listen({ port: 8000, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  await gracefulShutdown(server);
};

const setupDB = async (server: FastifyInstance) => {
  const db_pool = new Pool({
    host: process.env.HOST || "",
    database: process.env.DATABASE || "",
    user: process.env.AUTOBAHN_USER || "",
    password: process.env.AUTOBAHN_PASSWORD || "",
  });

  server.addHook("onClose", async () => {
    await db_pool.end();
    console.log("DB connectionpool ended");
  });

  return db_pool;
};

const setupServices = async (db: Pool) => {
  const autobahnRepository = new AutobahnRepository(db);
  const autobahnService = new AutobahnService(autobahnRepository);

  return autobahnService;
};

const setupRoutes = async (
  server: FastifyInstance,
  service: AutobahnService,
) => {
  const autobahnController = new AutobahnController(service);

  server.register(addAutobahnRoutes(autobahnController));
};

const setupLog = async (server: FastifyInstance) => {
  server.log.info("### Autobahn Service started ###");

  server.addHook("onRequest", (request, reply, done) => {
    server.log.info({ req: request.raw });
    done();
  });
};

const addAutobahnRoutes = (
  controller: AutobahnController,
): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/fetchData", controller.fetchData.bind(controller));
    instance.get("/getData", controller.getData.bind(controller));
    instance.get("/getDetails/:id", controller.getDetails.bind(controller));
    done();
  };
};

const gracefulShutdown = async (server: FastifyInstance) => {
  // For stopping server running locally
  process.on("SIGINT", () => {
    console.log("Received SIGINT. Shutting down gracefully...");
    server.close().then(() => {
      console.log("### autobahn service stopped ###");
    });
  });

  // For docker compose down
  process.on("SIGTERM", () => {
    console.log("Received SIGTERM. Shutting down gracefully...");
    server.close().then(() => {
      console.log("### autobahn service stopped ###");
    });
  });
};

start();
