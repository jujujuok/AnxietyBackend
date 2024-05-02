import { FastifyReply, FastifyRequest } from "fastify";
import { AwAService } from "./awa_service";
import { updateRequest, detailsRequest } from "../utils/fastifyRequests";

export class AwAController {
  constructor(private readonly awaService: AwAService) {}

  async fetchData(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.awaService.fetchData();
    return reply.send(result);
  }

  async getData(req: updateRequest, reply: FastifyReply) {
    if (!req.query.timestamp) {
      const timestamp = null;
    }

    const timestamp = req.query.timestamp as number;
    const data = await this.awaService.getData(timestamp);
    return reply.send(data);
  }
}
