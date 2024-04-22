import { IMapItemDetails, IMapUpdate } from "../models/map";
import { getDataFromApi } from "../utils/apiCalls";
import { Cache } from "../utils/cache";

/**
 * Repository for the map module
 */
export class MapRepository {
  constructor(private readonly redis: Cache) {}

  /**
   * Add a key-value pair to the cache
   * @param id Key of the cache item
   * @param value Value of the cache item
   */
  async setCacheItem(id: string, value: IMapItemDetails) {
    this.redis.set(id, value);
  }

  /**
   * Retrieve a cache item by key
   * @param id Key of the cache item
   * @returns Cache item
   */
  async getCacheItem(id: string): Promise<IMapItemDetails | null> {
    const cacheItem = await this.redis.get(id);

    if (cacheItem) {
      return cacheItem as IMapItemDetails;
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
   * Get list of nina warnings
   * @returns MapUpdate Object
   */
  async getWarnings(api: string): Promise<IMapUpdate> {
    const warningResponseData = await getDataFromApi(
      `http://${api}.risiko-radar.info/${api}/getData`
    );

    const warningData: IMapUpdate = {
      add: warningResponseData[0],
      delete: [],
    };

    return warningData;
  }

  async getWarningUpdate(api: string, timestamp: number): Promise<IMapUpdate> {
    const warningResponseData = await getDataFromApi(
      `http://${api}.risiko-radar.info/${api}/getData?timestamp=${timestamp}`
    );

    const warningData: IMapUpdate = {
      add: warningResponseData[0],
      delete: warningResponseData[1],
    };

    return warningData;
  }

  findTypeById(id: string): string | undefined {
    // Autobahn
    if (id.includes("undefined--vi-hind")) {
      return "autobahn";
    }
    // DWD
    if (id.includes("DWD")) {
      return "dwd";
    }
    // Nina
    if (id.includes(".DE")) {
      return "nina";
    }

    return undefined;
  }

  async getWarningDetails(id: string): Promise<IMapItemDetails | null> {
    const warningType = this.findTypeById(id);
    if (warningType) {
      return await getDataFromApi(
        `http://${warningType}.risiko-radar.info/${warningType}/getDetails/${id}`
      );
    }

    // If the warning type is not found, try all types
    for (let element of ["autobahn", "dwd", "nina"]) {
      const detailsData = await getDataFromApi(
        `http://${element}.risiko-radar.info/${element}/getDetails/${id}`
      );
      if (detailsData) {
        return detailsData;
      }
    }

    return null;
  }
}
