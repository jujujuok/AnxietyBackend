import { IDashboardItemDetails, IDashboardUpdate } from "../models/dashboard";
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
      return cacheItem as IDashboardItemDetails;
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
  async getWarnings(api: string): Promise<IDashboardUpdate> {
    const warningResponseData = await getDataFromApi(
      `http://${api}:8000/getData`,
    );

    // awa returns an array of two arrays, where the first array contains worldmap items and the second one dashboard items
    if (api === "awa") {
      const embassyData = warningResponseData[0];
      const warningData = warningResponseData[1];
      warningResponseData[0] = embassyData[0].concat(warningData[0]);
      warningResponseData[1] = embassyData[1].concat(warningData[1]);
    }

    const warningData: IDashboardUpdate = {
      add: warningResponseData[0],
      delete: [],
    };

    return warningData;
  }

  async getWarningUpdate(
    api: string,
    timestamp: number,
  ): Promise<IDashboardUpdate> {
    let warningResponseData = await getDataFromApi(
      `http://${api}:8000/getData?timestamp=${timestamp}`,
    );

    // awa returns an array of two arrays, where the first array contains worldmap items and the second one dashboard items
    if (api === "awa") {
      warningResponseData = warningResponseData[1];
    }

    const warningData: IDashboardUpdate = {
      add: warningResponseData[0],
      delete: warningResponseData[1],
    };

    return warningData;
  }

  findTypeById(id: string): string | undefined {
    // Product warnings have only numbers as id
    if (/^\d+$/.test(id)) {
      return "product-warning";
    }
    if (id.includes("emb.") || id.includes("tra.")) {
      return "awa";
    }
    return undefined;
  }

  async getWarningDetails(id: string): Promise<IDashboardItemDetails | null> {
    const warningType = this.findTypeById(id);
    if (warningType) {
      const detailsData = await getDataFromApi(
        `http://${warningType}:8000/getDetails/${id}`,
      );
      detailsData.type = warningType;
      return await detailsData;
    }

    // If the warning type is not found, check all APIs
    for (const element of ["product-warning", "awa"]) {
      const detailsData = await getDataFromApi(
        `http://${element}:8000/getDetails/${id}`,
      );
      if (detailsData) {
        detailsData.type = element;
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
      "http://product-warning:8000/getData",
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
      "http://product-warning:8000/getData?timestamp=" + timestamp,
    );

    return { add: productWarningData, delete: [] };
  }
}
