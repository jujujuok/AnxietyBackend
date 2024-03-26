import { FastifyReply, FastifyRequest } from "fastify";
import { DwDService } from "./dwd_service";

export class DwDController {
  constructor(private readonly dwdService: DwDService) {}

  async getNowcastWarnings(req: FastifyRequest, reply: FastifyReply) {
    const types = await this.dwdService.getNowcastWarnings();
    return reply.send(types);
  }
}
