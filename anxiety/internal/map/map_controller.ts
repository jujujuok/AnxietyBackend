import { FastifyReply, FastifyRequest } from "fastify";
import { MapService } from "./map_service";
import { detailsRequest, updateRequest } from "../utils/fastifyRequests";

export class MapController {
  constructor(private readonly mapService: MapService) {}

  async getMap(req: FastifyRequest, reply: FastifyReply) {
    const mapData = await this.mapService.getMap();
    return reply.send(mapData);
  }

  async getMapDetails(req: detailsRequest, reply: FastifyReply) {
    if (!req.params.id) {
      return reply.status(400).send({
        message: "Map ID is required",
      });
    }

    const mapId = req.params.id as number;
    const mapDetails = await this.mapService.getMapDetails(mapId);

    return reply.send(mapDetails);
  }

  async getMapUpdate(req: updateRequest, reply: FastifyReply) {
    if (!req.query.timestamp) {
      return reply.status(400).send({
        message: "Timestamp is required",
      });
    }

    const timestamp = req.query.timestamp as number;
    const mapUpdate = await this.mapService.getMapUpdate(timestamp);

    return reply.send(mapUpdate);
  }
}
