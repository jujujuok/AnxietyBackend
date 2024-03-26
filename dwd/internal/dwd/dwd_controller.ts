import { FastifyReply, FastifyRequest } from "fastify";
import { DwDService } from "./dwd_service";

export class DwDController {
  constructor(private readonly dwdService: DwDService) {}

  async getTypes(req: FastifyRequest, reply: FastifyReply) {
    const types = await this.dwdService.getTypes();
    return reply.send(types);
  }
}
