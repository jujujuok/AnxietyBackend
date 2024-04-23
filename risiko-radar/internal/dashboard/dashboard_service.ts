import { de } from "@faker-js/faker";
import {
  IDashboardItem,
  IDashboardItemDetails,
  IDashboardUpdate,
} from "../models/dashboard";
import { DashboardRepository } from "./dashboard_repository";
import { IDeleteItem } from "../utils/apiCalls";

/**
 * Service for the dashboard module
 */
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  /**
   * Strip details from map items and save them to cache
   * @param dashboardItems Dashboard items to strip details from
   * @returns Dashboard items without details
   */
  stripDetails(dashboardItems: IDashboardUpdate) {
    dashboardItems.add.forEach((item) => {
      if (item.details) {
        this.dashboardRepository.setCacheItem(item.id.toString(), item.details);
        dashboardItems.add.find((mapItem) => mapItem.id === item.id)!.details =
          undefined;
      }
    });
    return dashboardItems;
  }

  /**
   * Remove cache items of deleted dashboard items
   * @param dashboardItems Map items to delete
   */
  async cleanCache(dashboardItems: IDashboardUpdate) {
    dashboardItems.delete.forEach((id: IDeleteItem | string) => {
      if (typeof id === "object") {
        this.dashboardRepository.delCacheItem(id.warning_id);
        return;
      }
      this.dashboardRepository.delCacheItem(id);
    });
  }

  /**
   * Add data to dashboard items object
   * @param dashboardItems Dashboard items
   * @param data Data to add
   */
  concatData(dashboardItems: IDashboardUpdate, data: IDashboardUpdate) {
    dashboardItems.add = dashboardItems.add.concat(data.add);
    let ids = data.delete.map((item) =>
      typeof item === "object" ? item.warning_id : item
    );
    dashboardItems.delete.push(...ids);
  }

  /**
   * Get object containing dashboard items to add and ids to delete
   * @returns DashboardUpdate Object
   */
  async getDashboard(): Promise<IDashboardItem[]> {
    let dashboardItems: IDashboardUpdate = { add: [], delete: [] };

    let productWarningData =
      await this.dashboardRepository.getProductWarnings();
    // Save details of product warnings to cache and remove from object
    productWarningData = this.stripDetails(productWarningData);
    this.concatData(dashboardItems, productWarningData);

    return dashboardItems.add;
  }

  /**
   * Get details of a dashboard item
   * @param dashboardId ID of the dashboard item
   * @returns Details of a dashboard item
   */
  async getDashboardDetails(
    dashboardId: string
  ): Promise<IDashboardItemDetails | null> {
    let details = await this.dashboardRepository.getCacheItem(dashboardId);
    if (details) {
      return details;
    }

    details = await this.dashboardRepository.getWarningDetails(dashboardId);
    if (details) {
      this.dashboardRepository.setCacheItem(dashboardId, details);
      return details;
    }

    return null;
  }

  /**
   * Get update of the dashboard list
   * @param timestamp Timestamp of the last update
   * @returns Update of the dashboard list containing ids to remove and objects to add
   */
  async getDashboardUpdate(timestamp: number) {
    let update: IDashboardUpdate = { add: [], delete: [] };

    const productWarningData =
      await this.dashboardRepository.getProductWarningUpdate(timestamp);
    this.stripDetails(productWarningData);
    this.cleanCache(productWarningData);
    this.concatData(update, productWarningData);

    return update;
  }
}
