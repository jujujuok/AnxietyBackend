import {
  IDashboardItem,
  IDashboardItemDetails,
  IDashboardUpdate,
} from "../models/dashboard";
import { getDataFromApi } from "../utils/apiCalls";
import { Cache } from "../utils/cache";

/**
 * Repository for the dashboard module
 */
export class DashboardRepository {
  constructor(private readonly redis: Cache) {}

  /**
   * Add a key-value pair to the cache
   * @param id Key of the cache item
   * @param value Value of the cache item
   */
  async setCacheItem(id: string, value: IDashboardItemDetails) {
    this.redis.set(id, value);
  }

  /**
   * Retrieve a cache item by key
   * @param id Key of the cache item
   * @returns Cache item
   */
  async getCacheItem(id: string): Promise<IDashboardItemDetails | null> {
    const cacheItem = await this.redis.get(id);

    if (cacheItem) {
      return cacheItem;
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

  findTypeById(id: string): string | undefined {
    // Product warnings have only numbers as id
    if (/^\d+$/.test(id)) {
      return "product-warning";
    }
    return undefined;
  }

  async getWarningDetails(id: string): Promise<IDashboardItemDetails | null> {
    const warningType = this.findTypeById(id);
    if (warningType) {
      return await getDataFromApi(
        `http://${warningType}.risiko-radar.info/${warningType}/getDetails/${id}`
      );
    }

    // If the warning type is not found, check all APIs
    for (let element of ["product-warning"]) {
      const detailsData = await getDataFromApi(
        `http://${element}.risiko-radar.info/${element}/getDetails/${id}`
      );
      if (detailsData) {
        return detailsData;
      }
    }

    return null;
  }

  /**
   * Get list of productwarnings
   * @returns List of dashboard items
   */
  async getProductWarnings(): Promise<IDashboardUpdate> {
    const productWarningData = await getDataFromApi(
      "http://212.132.100.147:8080/product-warning/getData"
    );

    return { add: productWarningData, delete: [] };
  }

  /**
   * Get update of the product warning list
   * @param timestamp Unix timestamp of the last update
   * @returns Update of the product warning list
   */
  async getProductWarningUpdate(timestamp: number): Promise<IDashboardUpdate> {
    const productWarningData = await getDataFromApi(
      "http://212.132.100.147:8080/product-warning/getData?timestamp=" +
        timestamp
    );

    return { add: productWarningData, delete: [] };
  }
}
