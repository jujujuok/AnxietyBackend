import { FastifyReply, FastifyRequest } from "fastify";
import { AwAService } from "./awa_service";

export class AwAController {
  constructor(private readonly awaService: AwAService) {}

  async fetchData(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.awaService.getTypes();
    return reply.send(result);
  }
}
