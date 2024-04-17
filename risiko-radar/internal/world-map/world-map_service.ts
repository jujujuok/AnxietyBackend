import { IWorldMapItem } from "../models/world-map";
import { WorldMapRepository } from "./world-map_repository";

/**
 * WorldMap service
 */
export class WorldMapService {
  constructor(private readonly worldMapRepository: WorldMapRepository) {}

  /**
   * Get list of WorldMap items
   * @returns List of WorldMap items
   */
  async getWorldMap(): Promise<IWorldMapItem[]> {
    return this.worldMapRepository.getWorldMap();
  }

  /**
   * Get details of a WorldMap item
   * @param WorldMapId WorldMap ID
   * @returns Details of a WorldMap item
   */
  async getWorldMapDetails(WorldMapId: string) {
    return this.worldMapRepository.getWorldMapDetails(WorldMapId);
  }

  /**
   * Get update of the WorldMap list
   * @param timestamp Timestamp
   * @returns Update of the WorldMap list containing ids to remove and objects to add
   */
  async getWorldMapUpdate(timestamp: number) {
    return this.worldMapRepository.getWorldMapUpdate(timestamp);
  }
}
