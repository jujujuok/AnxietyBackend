import { FastifyReply, FastifyRequest } from "fastify";
import { DwDService } from "./dwd_service";
import { updateRequest, detailsRequest } from "../utils/fastifyRequests";

export class DwDController {
  constructor(private readonly dwdService: DwDService) {}

  async fetchData(req: FastifyRequest, reply: FastifyReply) {
    const response = await this.dwdService.fetchData();
    return reply.send(response);
  }

  async getData(req: updateRequest, reply: FastifyReply) {
    const timestamp = req.query.timestamp as number;
    const data = await this.dwdService.getData(timestamp);
    return reply.send(data);
  }

  async getDetails(req: detailsRequest, reply: FastifyReply) {
    if (!req.params.id) {
      console.error("No id provided");
      return reply.status(400).send();
    }

    const id = req.params.id as string;
    const data = await this.dwdService.getDetails(id);
    return reply.send(data);
  }
}
