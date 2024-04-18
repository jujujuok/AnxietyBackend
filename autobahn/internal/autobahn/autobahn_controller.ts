import { FastifyReply, FastifyRequest } from "fastify";
import { AutobahnService } from "./autobahn_service";
import { updateRequest, detailsRequest } from "../utils/fastifyRequests";

export class AutobahnController {
  constructor(private readonly autobahnService: AutobahnService) {}

  async fetchData(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.autobahnService.fetchData();
    return reply.send(result);
  }

  async getData(req: updateRequest, reply: FastifyReply) {
    if (!req.query.timestamp) {
      const timestamp = null;
    }

    const timestamp = req.query.timestamp as number;
    const data = await this.autobahnService.getData(timestamp);
    return reply.send(data);
  }

  async getDetails(req: detailsRequest, reply: FastifyReply) {
    if (!req.params.id) {
      console.log("No id provided");
      return reply.status(400).send();
    }

    const id = req.params.id as string;
    const data = await this.autobahnService.getDetails(id);
    return reply.send(data);
  }
}
