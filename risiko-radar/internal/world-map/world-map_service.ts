import { IWorldMapItem, IWorldMapUpdate } from "../models/world-map";
import { IDeleteItem } from "../utils/apiCalls";
import { WorldMapRepository } from "./world-map_repository";

/**
 * WorldMap service
 */
export class WorldMapService {
  constructor(private readonly worldMapRepository: WorldMapRepository) {}

  /**
   * Strip details from worldmap items and save them to cache
   * @param worldMapItems
   * @returns
   */
  stripDetails(worldMapItems: IWorldMapUpdate) {
    worldMapItems.add.forEach((item) => {
      if (item.details) {
        item.details.type = item.type;
        this.worldMapRepository.setCacheItem(item.id.toString(), item.details);
        worldMapItems.add.find((mapItem) => mapItem.id === item.id)!.details =
          undefined;
      }
    });
    return worldMapItems;
  }

  /**
   * Remove cache items of deleted worldmap items
   * @param worldMapItems Map items to delete
   */
  async cleanCache(worldMapItems: IWorldMapUpdate) {
    worldMapItems.delete.forEach((id: IDeleteItem | string) => {
      if (typeof id === "object") {
        this.worldMapRepository.delCacheItem(id.warning_id);
        return;
      }
      this.worldMapRepository.delCacheItem(id);
    });
  }

  /**
   * Add data to worldmap items
   * @param worldMapItems Worldmap items
   * @param data Data to add
   */
  concatData(worldMapItems: IWorldMapUpdate, data: IWorldMapUpdate) {
    worldMapItems.add = worldMapItems.add.concat(data.add);
    const ids = data.delete.map((item) =>
      typeof item === "object" ? item.warning_id : item,
    );
    worldMapItems.delete.push(...ids);
  }

  /**
   * Get list of WorldMap items
   * @returns List of WorldMap items
   */
  async getWorldMap(): Promise<IWorldMapItem[]> {
    const worldMapItems: IWorldMapUpdate = { add: [], delete: [] };

    //### AWA ###
    let awaData = await this.worldMapRepository.getWarnings("awa");
    awaData = this.stripDetails(awaData);
    this.concatData(worldMapItems, awaData);

    return worldMapItems.add;
  }

  /**
   * Get details of a WorldMap item
   * @param WorldMapId WorldMap ID
   * @returns Details of a WorldMap item
   */
  async getWorldMapDetails(WorldMapId: string) {
    let detailsObject = await this.worldMapRepository.getCacheItem(WorldMapId);
    if (detailsObject) {
      return detailsObject;
    }

    detailsObject = await this.worldMapRepository.getWarningDetails(WorldMapId);
    if (detailsObject) {
      this.worldMapRepository.setCacheItem(WorldMapId, detailsObject);
      return detailsObject;
    }

    return null;
  }

  /**
   * Get update of the WorldMap list
   * @param timestamp Timestamp
   * @returns Update of the WorldMap list containing ids to remove and objects to add
   */
  async getWorldMapUpdate(timestamp: number) {
    const worldMapItems: IWorldMapUpdate = { add: [], delete: [] };

    //### AWA ###
    let awaData = await this.worldMapRepository.getWarningUpdate(
      "awa",
      timestamp,
    );
    awaData = this.stripDetails(awaData);
    this.cleanCache(awaData);
    this.concatData(worldMapItems, awaData);

    return worldMapItems;
  }
}
