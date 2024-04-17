import { FastifyReply, FastifyRequest } from "fastify";
import { MapService } from "./map_service";
import { detailsRequest, updateRequest } from "../utils/fastifyRequests";

/**
 * Controller for the map module
 */
export class MapController {
  constructor(private readonly mapService: MapService) {}

  /**
   * Get list of map items
   * @param req FastifyRequest
   * @param reply FastifyReply
   * @returns List of map items
   */
  async getMap(req: FastifyRequest, reply: FastifyReply) {
    const mapData = await this.mapService.getMap();
    return reply.send(mapData);
  }

  /**
   * Get details of a map item
   * @param req FastifyRequest for details
   * @param reply FastifyReply
   * @returns Details of a map item
   */
  async getMapDetails(req: detailsRequest, reply: FastifyReply) {
    if (!req.params.id) {
      return reply.status(400).send({
        message: "Map ID is required",
      });
    }

    const mapId = req.params.id;
    const mapDetails = await this.mapService.getMapDetails(mapId);

    return reply.send(mapDetails);
  }

  /**
   * Get update of the map list
   * @param req FastifyRequest for update
   * @param reply FastifyReply
   * @returns Update of the map list containing ids to remove and objects to add
   */
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
