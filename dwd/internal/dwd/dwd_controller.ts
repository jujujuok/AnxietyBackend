import { FastifyReply, FastifyRequest } from "fastify";
import { DwDService } from "./dwd_service";
import { updateRequest } from "../utils/fastifyRequests";

export class DwDController {
  constructor(private readonly dwdService: DwDService) {}

  async getCoastWarnings(req: FastifyRequest, reply: FastifyReply) {
    const types = await this.dwdService.getCoastWarnings();
    return reply.send(types);
  }

  async getSeaWarnings(req: FastifyRequest, reply: FastifyReply) {
    const types = await this.dwdService.getSeaWarnings();
    return reply.send(types);
  }

  async fetchData(req: FastifyRequest, reply: FastifyReply) {
    const response = await this.dwdService.fetchData();
    return reply.send(response);
  }

  async getData(req: updateRequest, reply: FastifyReply) {
    if (!req.query.timestamp) {
      const timestamp = null;
    }

    const timestamp = req.query.timestamp as number;
    const data = await this.dwdService.getData(timestamp);
    return reply.send(data);
  }
}
