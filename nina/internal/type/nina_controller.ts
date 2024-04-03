import { FastifyReply, FastifyRequest } from "fastify";
import { NinaService } from "./nina_service";

export class NinaController {
  constructor(private readonly ninaService: NinaService) {}

  async fetchData(req: FastifyRequest, reply: FastifyReply) {
    const types = await this.ninaService.fetchData();
    return reply.send(types);
  }
}
