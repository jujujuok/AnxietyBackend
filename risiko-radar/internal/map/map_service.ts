import { IMapItem, IMapUpdate } from "../models/map";
import { MapRepository } from "./map_repository";

/**
 * Map service
 */
export class MapService {
  constructor(private readonly mapRepository: MapRepository) {}

  /**
   * Strip details from map items and save them to cache
   * @param mapItems
   * @returns
   */
  async stripDetails(mapItems: IMapUpdate) {
    mapItems.add.forEach((item) => {
      if (item.details) {
        this.mapRepository.setCacheItem(item.id.toString(), item.details);
        mapItems.add.find((mapItem) => mapItem.id === item.id)!.details =
          undefined;
      }
    });
    return mapItems;
  }

  /**
   * Remove cache items of deleted map items
   * @param mapItems Map items to delete
   */
  async cleanCache(mapItems: IMapUpdate) {
    mapItems.delete.forEach((id: string) => {
      this.mapRepository.delCacheItem(id);
    });
  }

  /**
   * Add data to map items
   * @param mapItems Map items
   * @param data Data to add
   */
  async concatData(mapItems: IMapUpdate, data: IMapUpdate) {
    mapItems.add = mapItems.add.concat(data.add);
    mapItems.delete = mapItems.delete.concat(data.delete);
  }

  /**
   * Get object containing map items to add and ids to delete
   * @returns List of map items
   */
  async getMap(): Promise<IMapUpdate> {
    let mapItems: IMapUpdate = { add: [], delete: [] };

    //### NINA ###
    let ninaData = await this.mapRepository.getWarnings("nina");
    ninaData = await this.stripDetails(ninaData);
    this.concatData(mapItems, ninaData);

    //### AUTOBAHN ###
    let autobahnData = await this.mapRepository.getWarnings("autobahn");
    autobahnData = await this.stripDetails(autobahnData);
    this.concatData(mapItems, autobahnData);

    //### DWD ###
    let dwdData = await this.mapRepository.getWarnings("dwd");
    dwdData = await this.stripDetails(dwdData);
    this.concatData(mapItems, dwdData);

    return mapItems;
  }

  /**
   * Get details of a map item
   * @param mapId Map ID
   * @returns Details of a map item
   */
  async getMapDetails(mapId: string) {
    let detailsObject = await this.mapRepository.getCacheItem(mapId);
    if (detailsObject) {
      return detailsObject;
    }

    detailsObject = await this.mapRepository.getWarningDetails(mapId);
    if (detailsObject) {
      this.mapRepository.setCacheItem(mapId, detailsObject);
      return detailsObject;
    }

    return null;
  }

  /**
   * Get update of the map list
   * @param timestamp Timestamp
   * @returns Update of the map list containing ids to remove and objects to add
   */
  async getMapUpdate(timestamp: number) {
    let mapItems: IMapUpdate = { add: [], delete: [] };

    //### NINA ###
    let ninaData = await this.mapRepository.getWarningUpdate("nina", timestamp);
    ninaData = await this.stripDetails(ninaData);
    this.cleanCache(ninaData);
    this.concatData(mapItems, ninaData);

    //### AUTOBAHN ###
    let autobahnData = await this.mapRepository.getWarningUpdate(
      "autobahn",
      timestamp
    );
    autobahnData = await this.stripDetails(autobahnData);
    this.cleanCache(autobahnData);
    this.concatData(mapItems, autobahnData);

    //### DWD ###
    let dwdData = await this.mapRepository.getWarningUpdate("dwd", timestamp);
    dwdData = await this.stripDetails(dwdData);
    this.cleanCache(dwdData);
    this.concatData(mapItems, dwdData);

    return mapItems;
  }
}
