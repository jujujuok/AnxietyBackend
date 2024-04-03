import { FastifyReply, FastifyRequest } from "fastify";
import { ProductWarningService } from "./product-warning_service";
import { updateRequest } from "../utils/fastifyRequests";

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

  async getData(req: updateRequest, reply: FastifyReply) {
    if (!req.query.timestamp) {
      return reply.status(400).send({
        message: "Timestamp is required",
      });
    }

    const timestamp = req.query.timestamp as number;
    const users = await this.productWarningService.getData(timestamp);
    return reply.send(users);
  }
}
