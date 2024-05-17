import { IMapItem, IMapItemDetails, IMapUpdate } from "../models/map";
import { IDeleteItem } from "../utils/apiCalls";
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
  stripDetails(mapItems: IMapUpdate) {
    mapItems.add.forEach((item) => {
      if (item.details) {
        item.details.type = item.type;
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
    mapItems.delete.forEach((id: IDeleteItem | string) => {
      if (typeof id === "object") {
        this.mapRepository.delCacheItem(id.warning_id);
        return;
      }
      this.mapRepository.delCacheItem(id);
    });
  }

  /**
   * Add data to map items
   * @param mapItems Map items
   * @param data Data to add
   */
  concatData(mapItems: IMapUpdate, data: IMapUpdate) {
    mapItems.add = mapItems.add.concat(data.add);
    const ids = data.delete.map((item) =>
      typeof item === "object" ? item.warning_id : item,
    );
    mapItems.delete.push(...ids);
  }

  /**
   * Get object containing map items to add and ids to delete
   * @returns List of map items
   */
  async getMap(): Promise<IMapItem[]> {
    const mapItems: IMapUpdate = { add: [], delete: [] };

    //### DWD ###
    let dwdData = await this.mapRepository.getWarnings("dwd");
    dwdData = this.stripDetails(dwdData);
    this.concatData(mapItems, dwdData);

    //### NINA ###
    let ninaData = await this.mapRepository.getWarnings("nina");
    ninaData = this.stripDetails(ninaData);
    this.concatData(mapItems, ninaData);

    //### AUTOBAHN ###
    let autobahnData = await this.mapRepository.getWarnings("autobahn");
    autobahnData = this.stripDetails(autobahnData);
    this.concatData(mapItems, autobahnData);

    return mapItems.add;
  }

  /**
   * Get details of a map item
   * @param mapId Map ID
   * @returns Details of a map item
   */
  async getMapDetails(mapId: string): Promise<IMapItemDetails | null> {
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
    const mapItems: IMapUpdate = { add: [], delete: [] };

    //### NINA ###
    let ninaData = await this.mapRepository.getWarningUpdate("nina", timestamp);
    ninaData = this.stripDetails(ninaData);
    this.cleanCache(ninaData);
    this.concatData(mapItems, ninaData);

    //### AUTOBAHN ###
    let autobahnData = await this.mapRepository.getWarningUpdate(
      "autobahn",
      timestamp,
    );
    autobahnData = this.stripDetails(autobahnData);
    this.cleanCache(autobahnData);
    this.concatData(mapItems, autobahnData);

    //### DWD ###
    let dwdData = await this.mapRepository.getWarningUpdate("dwd", timestamp);
    dwdData = this.stripDetails(dwdData);
    this.cleanCache(dwdData);
    this.concatData(mapItems, dwdData);

    return mapItems;
  }
}
