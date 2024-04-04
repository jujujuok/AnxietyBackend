import { FastifyReply, FastifyRequest } from "fastify";
import { ProductWarningService } from "./product-warning_service";
import { updateRequest } from "../utils/fastifyRequests";

export class ProductWarningController {
  constructor(private readonly productWarningService: ProductWarningService) {}

  async fetchAll(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.productWarningService.fetchAll();
    return reply.send(result);
  }

  async fetchUpdate(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.productWarningService.fetchUpdate();
    return reply.send(result);
  }

  async fetchUpdateAll(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.productWarningService.fetchUpdateAll();
    return reply.send(result);
  }

  async getData(req: updateRequest, reply: FastifyReply) {
    if (!req.query.timestamp) {
      const timestamp = null;
    }

    const timestamp = req.query.timestamp as number;
    const data = await this.productWarningService.getData(timestamp);
    return reply.send(data);
  }
}
