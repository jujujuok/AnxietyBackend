/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from "@faker-js/faker";
import {
  IWorldMapItem,
  IWorldMapItemDetails,
  IWorldMapUpdate,
} from "../models/world-map";
import { Cache } from "../utils/cache";
import { getDataFromApi } from "../utils/apiCalls";
import { IMapItem } from "../models/map";

/**
 * WorldMap repository
 */
export class WorldMapRepository {
  constructor(private readonly redis: Cache) {}

  /**
   * Add a key-value pair to the cache
   * @param id Key of the cache item
   * @param value Value of the cache item
   */
  async setCacheItem(id: string, value: IWorldMapItemDetails) {
    this.redis.set(id, value);
  }

  /**
   * Retrieve a cache item by key
   * @param id Key of the cache item
   * @returns Cache item
   */
  async getCacheItem(id: string): Promise<IWorldMapItemDetails | null> {
    const cacheItem = await this.redis.get(id);

    if (cacheItem) {
      return cacheItem as IWorldMapItemDetails;
    }
    return null;
  }

  /**
   * Delete a cache item by key
   * @param id Key of the cache item
   */
  async delCacheItem(id: string) {
    this.redis.del(id);
  }

  /**
   * Get list of warnings
   * @returns MapUpdate Object
   */
  async getWarnings(api: string): Promise<IWorldMapUpdate> {
    let warningResponseData = await getDataFromApi(
      `http://${api}.risiko-radar.info/getData`,
    );

    // awa returns an array of two arrays, where the first array contains worldmap items and the second one dashboard items
    if (api === "awa") {
      warningResponseData = warningResponseData[0];
    }

    const warningData: IWorldMapUpdate = {
      add: warningResponseData[0],
      delete: [],
    };

    return warningData;
  }

  async getWarningUpdate(
    api: string,
    timestamp: number,
  ): Promise<IWorldMapUpdate> {
    let warningResponseData = await getDataFromApi(
      `http://${api}.risiko-radar.info/getData?timestamp=${timestamp}`,
    );

    // awa returns an array of two arrays, where the first array contains worldmap items and the second one dashboard items
    if (api === "awa") {
      warningResponseData = warningResponseData[0];
    }

    const warningData: IWorldMapUpdate = {
      add: warningResponseData[0],
      delete: warningResponseData[1],
    };

    return warningData;
  }

  findTypeById(id: string): string | undefined {
    // awa warnings have only numbers as id
    if (id.includes("tra.")) {
      return "awa";
    }
    return undefined;
  }

  async getWarningDetails(id: string): Promise<IWorldMapItemDetails | null> {
    const warningType = this.findTypeById(id);
    if (warningType) {
      const detailsData = await getDataFromApi(
        `http://${warningType}.risiko-radar.info/getDetails/${id}`,
      );
      detailsData.type = warningType;
      return detailsData;
    }

    // If the warning type is not found, try all types
    for (const element of ["awa"]) {
      const detailsData = await getDataFromApi(
        `http://${element}.risiko-radar.info/getDetails/${id}`,
      );
      if (detailsData) {
        detailsData.type = element;
        return detailsData;
      }
    }

    return null;
  }
}
