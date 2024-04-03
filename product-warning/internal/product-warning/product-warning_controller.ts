import { FastifyReply, FastifyRequest } from "fastify";
import { ProductWarningService } from "./product-warning_service";

export class ProductWarningController {
  constructor(private readonly productWarningService: ProductWarningService) {}

  async getAll(req: FastifyRequest, reply: FastifyReply) {
    const users = await this.productWarningService.getAll();
    return reply.send(users);
  }

  async getUpdate(req: FastifyRequest, reply: FastifyReply) {
    const users = await this.productWarningService.getUpdate();
    return reply.send(users);
  }

  async getData(req: FastifyRequest, reply: FastifyReply) {
    const users = await this.productWarningService.getData();
    return reply.send(users);
  }
}
