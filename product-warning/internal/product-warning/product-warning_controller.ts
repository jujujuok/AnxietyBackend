import { FastifyReply, FastifyRequest } from "fastify";
import { ProductWarningService } from "./product-warning_service";
import { updateRequest } from "../utils/fastifyRequests";

export class ProductWarningController {
  constructor(private readonly productWarningService: ProductWarningService) {}

  async getAll(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.productWarningService.getAll();
    return reply.send(result);
  }

  async getUpdate(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.productWarningService.getUpdate();
    return reply.send(result);
  }

  async getUpdateAll(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.productWarningService.getUpdateAll();
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
