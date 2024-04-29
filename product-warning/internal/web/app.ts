import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { ProductWarningController } from "../product-warning/product-warning_controller";
import { ProductWarningService } from "../product-warning/product-warning_service";
import { ProductWarningRepository } from "../product-warning/product-warning_repository";
import dotenv from "dotenv";
import { Pool } from "pg";

const start = async () => {
  dotenv.config();

  const server = await fastify({ logger: true });

  const db_pool = await setupDB(server);

  //TODO: Add middleware

  const productWarningService = await setupServices(db_pool);
  await setupRoutes(server, productWarningService);

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
    user: process.env.PRODUCTWARNING_USER || "",
    password: process.env.PRODUCTWARNING_PASSWORD || "",
  });

  server.addHook("onClose", async () => {
    await db_pool.end();
    console.log("DB connectionpool ended");
  });

  return db_pool;
};

const setupServices = async (db: Pool) => {
  const productWarningRepository = new ProductWarningRepository(db);
  const productWarningService = new ProductWarningService(
    productWarningRepository,
  );

  return productWarningService;
};

const setupRoutes = async (
  server: FastifyInstance,
  service: ProductWarningService,
) => {
  const productWarningController = new ProductWarningController(service);

  server.register(addProductWarningRoutes(productWarningController), {
    prefix: "/product-warning",
  });
};

const setupLog = async (server: FastifyInstance) => {
  server.log.info("### productwarning service started ###");

  server.addHook("onRequest", (request, reply, done) => {
    server.log.info({ req: request.raw });
    done();
  });
};

const addProductWarningRoutes = (
  controller: ProductWarningController,
): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/fetchAll", controller.fetchAll.bind(controller)); // fetch all warnings from external API
    instance.get("/fetchUpdate", controller.fetchUpdate.bind(controller)); // fetch only new warnings from external API (last 600min)
    instance.get("/fetchUpdateAll", controller.fetchUpdateAll.bind(controller)); // fetch all warnings from external API, but don't override existing ones (last 6min)
    instance.get("/getData", controller.getData.bind(controller)); // get warnings from DB
    instance.get("/getDetails/:id", controller.getDetails.bind(controller)); // get warning by ID from DB
    done();
  };
};

const gracefulShutdown = async (server: FastifyInstance) => {
  // For stopping server running locally
  process.on("SIGINT", () => {
    console.log("Received SIGINT. Shutting down gracefully...");
    server.close().then(() => {
      console.log("### productwarning service stopped ###");
    });
  });

  // For docker compose down
  process.on("SIGTERM", () => {
    console.log("Received SIGTERM. Shutting down gracefully...");
    server.close().then(() => {
      console.log("### productwarning service stopped ###");
    });
  });
};

start();
