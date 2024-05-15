import { FastifyReply, FastifyRequest } from "fastify";
import { NinaService } from "./nina_service";
import { updateRequest, detailsRequest } from "../utils/fastifyRequests";

export class NinaController {
  constructor(private readonly ninaService: NinaService) {}

  async fetchData(req: FastifyRequest, reply: FastifyReply) {
    const response = await this.ninaService.fetchData();
    return reply.send(response);
  }

  async getData(req: updateRequest, reply: FastifyReply) {
    const timestamp = req.query.timestamp as number;
    const data = await this.ninaService.getData(timestamp);
    return reply.send(data);
  }

  async getDetails(req: detailsRequest, reply: FastifyReply) {
    if (!req.params.id) {
      console.error("No id provided");
      return reply.status(400).send();
    }

    const id = req.params.id as string;
    const data = await this.ninaService.getDetails(id);
    return reply.send(data);
  }
}
