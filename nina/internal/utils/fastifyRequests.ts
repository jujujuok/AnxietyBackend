import { FastifyRequest } from "fastify";

/**
 * Fastify request for details
 */
export type detailsRequest = FastifyRequest<{
  Params: { id: number };
}>;

/**
 * Fastify request for update
 */
export type updateRequest = FastifyRequest<{
  Querystring: { timestamp: number };
}>;
