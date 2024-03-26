import { FastifyReply, FastifyRequest } from "fastify";
import { DwDService } from "./dwd_service";

export class DwDController {
  constructor(private readonly dwdService: DwDService) {}

  async getNowcastWarnings(req: FastifyRequest, reply: FastifyReply) {
    const types = await this.dwdService.getNowcastWarnings();
    return reply.send(types);
  }

  async getGemeindeWarnings(req: FastifyRequest, reply: FastifyReply) {
    const types = await this.dwdService.getGemeindeWarnings();
    return reply.send(types);
  }

  async getCoastWarnings(req: FastifyRequest, reply: FastifyReply) {
    const types = await this.dwdService.getCoastWarnings();
    return reply.send(types);
  }

  async getSeaWarnings(req: FastifyRequest, reply: FastifyReply) {
    const types = await this.dwdService.getSeaWarnings();
    return reply.send(types);
  }

  async getAll(req: FastifyRequest, reply: FastifyReply) {
    const types = await this.dwdService.getAll();
    return reply.send(types);
  }
}
