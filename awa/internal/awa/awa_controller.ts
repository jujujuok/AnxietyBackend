import { FastifyReply, FastifyRequest } from "fastify";
import { AwAService } from "./awa_service";
import { updateRequest, detailsRequest } from "../utils/fastifyRequests";

export class AwAController {
  constructor(private readonly awaService: AwAService) {}

  async fetchWarnings(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.awaService.fetchWarnings();
    return reply.send(result);
  }

  async fetchEmbassys(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.awaService.fetchEmbassys();
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

  async getDetails(req: detailsRequest, reply: FastifyReply) {
    if (!req.params.id) {
      console.log("No id provided");
      return reply.status(400).send();
    }

    const id = req.params.id as string;
    const data = await this.awaService.getDetails(id);
    return reply.send(data);
  }
}
