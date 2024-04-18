import { IDashboardItem, IDashboardItemDetails } from "../models/dashboard";
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

  /**
   * Get list of productwarnings
   * @returns List of dashboard items
   */
  async getProductWarnings(): Promise<Array<IDashboardItem>> {
    const productWarningData = await getDataFromApi(
      "http://212.132.100.147:8080/product-warning/getData"
    );

    return productWarningData;
  }

  /**
   * Get details of a product warning from the API
   * @param dashboardId ID of the product warning
   * @returns Details of a product warning
   */
  async getProductWarningDetails(
    warningId: string
  ): Promise<IDashboardItemDetails> {
    const productWarningDetails = await getDataFromApi(
      `http://212.132.100.147:8080/product-warning/getDetails/${warningId}`
    );

    this.setCacheItem(warningId, productWarningDetails);

    return productWarningDetails;
  }

  /**
   * Get update of the product warning list
   * @param timestamp Unix timestamp of the last update
   * @returns Update of the product warning list
   */
  async getProductWarningUpdate(timestamp: number) {
    const productWarningData = await getDataFromApi(
      "http://212.132.100.147:8080/product-warning/getData?timestamp=" +
        timestamp
    );

    return productWarningData;
  }
}
