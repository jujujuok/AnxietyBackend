import { FastifyReply, FastifyRequest } from "fastify";
import { NinaService } from "./nina_service";
import { updateRequest } from "../utils/fastifyRequests";

export class NinaController {
  constructor(private readonly ninaService: NinaService) {}

  async fetchData(req: FastifyRequest, reply: FastifyReply) {
    const response = await this.ninaService.fetchData();
    return reply.send(response);
  }

  async getData(req: updateRequest, reply: FastifyReply) {
    if (!req.query.timestamp) {
      const timestamp = null;
    }

    const timestamp = req.query.timestamp as number;
    const data = await this.ninaService.getData(timestamp);
    return reply.send(data);
  }
}
