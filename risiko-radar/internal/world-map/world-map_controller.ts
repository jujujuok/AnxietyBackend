import { FastifyReply, FastifyRequest } from "fastify";
import { WorldMapService } from "./world-map_service";
import { detailsRequest, updateRequest } from "../utils/fastifyRequests";

/**
 * Controller for the WorldMap module
 */
export class WorldMapController {
  constructor(private readonly worldMapService: WorldMapService) {}

  /**
   * Get list of worldMap items
   * @param req FastifyRequest
   * @param reply FastifyReply
   * @returns List of WorldMap items
   */
  async getWorldMap(req: FastifyRequest, reply: FastifyReply) {
    const worldMapData = await this.worldMapService.getWorldMap();
    return reply.send(worldMapData);
  }

  /**
   * Get details of a WorldMap item
   * @param req FastifyRequest for details
   * @param reply FastifyReply
   * @returns Details of a WorldMap item
   */
  async getWorldMapDetails(req: detailsRequest, reply: FastifyReply) {
    if (!req.params.id) {
      return reply.status(400).send({
        message: "WorldMap ID is required",
      });
    }

    const worldMapId = req.params.id;
    const worldMapDetails =
      await this.worldMapService.getWorldMapDetails(worldMapId);

    return reply.send(worldMapDetails);
  }

  /**
   * Get update of the WorldMap list
   * @param req FastifyRequest for update
   * @param reply FastifyReply
   * @returns Update of the WorldMap list containing ids to remove and objects to add
   */
  async getWorldMapUpdate(req: updateRequest, reply: FastifyReply) {
    if (!req.query.timestamp) {
      return reply.status(400).send({
        message: "Timestamp is required",
      });
    }

    const timestamp = req.query.timestamp as number;
    const worldMapUpdate =
      await this.worldMapService.getWorldMapUpdate(timestamp);

    return reply.send(worldMapUpdate);
  }
}
