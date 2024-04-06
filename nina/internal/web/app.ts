import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { NinaController } from "../nina/nina_controller";
import { NinaService } from "../nina/nina_service";
import { NinaRepository } from "../nina/nina_repository";
import dotenv from "dotenv";
import { Pool } from "pg";

const start = async () => {
  // Load environment variables from .env
  dotenv.config();

  const server = await fastify({ logger: true });

  const db_pool = await setupDB(server);

  //TODO: Add middleware

  const ninaService = await setupServices(db_pool);
  await setupRoutes(server, ninaService);

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
    user: process.env.NINA_USER || "",
    password: process.env.NINA_PASSWORD || "",
  });

  server.addHook("onClose", async () => {
    await db_pool.end();
    console.log("DB connectionpool ended");
  });

  return db_pool;
};

const setupServices = async (db: Pool) => {
  const ninaRepository = new NinaRepository(db);
  const ninaService = new NinaService(ninaRepository);

  return ninaService;
};

const setupRoutes = async (server: FastifyInstance, service: NinaService) => {
  const ninaController = new NinaController(service);

  server.register(addNinaRoutes(ninaController), { prefix: "/nina" });
};

const setupLog = async (server: FastifyInstance) => {
  server.log.info("### Nina service started ###");

  server.addHook("onRequest", (request, reply, done) => {
    server.log.info({ req: request.raw });
    done();
  });
};

const addNinaRoutes = (controller: NinaController): FastifyPluginCallback => {
  return (instance, options, done) => {
    instance.get("/fetchData", controller.fetchData.bind(controller));
    instance.get("/getData", controller.getData.bind(controller));
    done();
  };
};

const gracefulShutdown = async (server: FastifyInstance) => {
  // For stopping server running locally
  process.on("SIGINT", () => {
    console.log("Received SIGINT. Shutting down gracefully...");
    server.close().then(() => {
      console.log("### nina service stopped ###");
    });
  });

  // For docker compose down
  process.on("SIGTERM", () => {
    console.log("Received SIGTERM. Shutting down gracefully...");
    server.close().then(() => {
      console.log("### nina service stopped ###");
    });
  });
};

start();
