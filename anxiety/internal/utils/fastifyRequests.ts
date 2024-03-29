import { FastifyRequest } from "fastify";

export type detailsRequest = FastifyRequest<{
  Params: { id: number };
}>;

export type updateRequest = FastifyRequest<{
  Querystring: { timestamp: number };
}>;
