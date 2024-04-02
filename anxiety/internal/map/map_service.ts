import { IMapItem } from "../models/map";
import { MapRepository } from "./map_repository";

/**
 * Map service
 */
export class MapService {
  constructor(private readonly mapRepository: MapRepository) {}

  /**
   * Get list of map items
   * @returns List of map items
   */
  async getMap(): Promise<IMapItem[]> {
    return this.mapRepository.getMap();
  }

  /**
   * Get details of a map item
   * @param mapId Map ID
   * @returns Details of a map item
   */
  async getMapDetails(mapId: number) {
    return this.mapRepository.getMapDetails(mapId);
  }

  /**
   * Get update of the map list
   * @param timestamp Timestamp
   * @returns Update of the map list containing ids to remove and objects to add
   */
  async getMapUpdate(timestamp: number) {
    return this.mapRepository.getMapUpdate(timestamp);
  }
}
