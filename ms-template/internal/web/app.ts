import fastify, { FastifyInstance, FastifyPluginCallback } from "fastify";
import { TypeController } from "../type/type_controller";
import { TypeService } from "../type/type_service";
import { TypeRepository } from "../type/type_repository";
import dotenv from "dotenv";
import { Pool } from "pg";

const start = async () => {
  // Load environment variables from .env
  dotenv.config();

  const server = await fastify({ logger: true });

  const db_pool = await setupDB(server);

  //TODO: Add middleware

  const typeService = await setupServices(db_pool);
  await setupRoutes(server, typeService);

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
    user: process.env.TEMPLATE_USER || "",
    password: process.env.TEMPLATE_PASSWORD || "",
  });

  server.addHook("onClose", async () => {
    await db_pool.end();
    console.log("DB connectionpool ended");
  });

  return db_pool;
};

const setupServices = async (db: Pool) => {
  const typeRepository = new TypeRepository(db);
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

const gracefulShutdown = async (server: FastifyInstance) => {
  // For stopping server running locally
  process.on("SIGINT", () => {
    console.log("Received SIGINT. Shutting down gracefully...");
    server.close().then(() => {
      console.log("### template service stopped ###");
    });
  });

  // For docker compose down
  process.on("SIGTERM", () => {
    console.log("Received SIGTERM. Shutting down gracefully...");
    server.close().then(() => {
      console.log("### template service stopped ###");
    });
  });
};

start();
