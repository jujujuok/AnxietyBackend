import { FastifyReply, FastifyRequest } from "fastify";
import { TypeService } from "./type_service";

export class TypeController {
  constructor(private readonly typeService: TypeService) {
    console.log(this.typeService);
    console.log("Type Controller Created");
  }

  async getTypes(req: FastifyRequest, reply: FastifyReply) {
    console.log("Controller get: ", this);
    const users = await this.typeService.getTypes();
    return reply.send(users);
  }
}
