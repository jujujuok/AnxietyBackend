import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { DwDController } from "../dwd/dwd_controller";
import { DwDService } from "../dwd/dwd_service";
import { DwDRepository } from "../dwd/dwd_repository";
import dotenv from "dotenv";
import { Pool } from "pg";

const start = async () => {
  dotenv.config();

  const server = await fastify({ logger: true });

  const db_pool = await setupDB(server);

  const typeService = await setupServices(db_pool);
  await setupRoutes(server, typeService);

  await setupLog(server);

  try {
    await server.listen({ port: 8000, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  gracefulShutdown(server);
};

const setupDB = async (server: FastifyInstance) => {
  const db_pool = new Pool({
    host: process.env.HOST || "",
    database: process.env.DATABASE || "",
    user: process.env.DWD_USER || "",
    password: process.env.DWD_PASSWORD || "",
  });

  server.addHook("onClose", async () => {
    await db_pool.end();
    console.log("DB connectionpool ended");
  });

  return db_pool;
};

const setupServices = async (db: Pool) => {
  const dwdRepository = new DwDRepository(db);
  const dwdService = new DwDService(dwdRepository);

  return dwdService;
};

const setupRoutes = async (server: FastifyInstance, service: DwDService) => {
  const dwdController = new DwDController(service);

  server.register(addTypeRoutes(dwdController), { prefix: "/dwd" });
};

const setupLog = async (server: FastifyInstance) => {
  server.log.info("### DWD Service started ###");

  server.addHook("onRequest", (request, reply, done) => {
    server.log.info({ req: request.raw });
    done();
  });
};

const addTypeRoutes = (controller: DwDController): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/fetchData", controller.fetchData.bind(controller));
    instance.get("/coast", controller.getCoastWarnings.bind(controller));
    instance.get("/sea", controller.getSeaWarnings.bind(controller));
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
