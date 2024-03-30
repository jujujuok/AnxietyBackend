import { IMapItem } from "../models/map";
import { MapRepository } from "./map_repository";

export class MapService {
  constructor(private readonly mapRepository: MapRepository) {}

  async getMap(): Promise<IMapItem[]> {
    return this.mapRepository.getMap();
  }

  async getMapDetails(mapId: number) {
    return this.mapRepository.getMapDetails(mapId);
  }

  async getMapUpdate(timestamp: number) {
    return this.mapRepository.getMapUpdate(timestamp);
  }
}
