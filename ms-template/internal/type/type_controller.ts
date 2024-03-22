import { FastifyReply, FastifyRequest } from "fastify";
import { TypeService } from "./type_service";

export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  async getTypes(req: FastifyRequest, reply: FastifyReply) {
    const users = await this.typeService.getTypes();
    return reply.send(users);
  }
}
