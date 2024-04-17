import { IDashboardItemDetails, IDashboardUpdate } from "../models/dashboard";
import { DashboardRepository } from "./dashboard_repository";

/**
 * Service for the dashboard module
 */
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  /**
   * Get object containing dashboard items to add and ids to delete
   * @returns DashboardUpdate Object
   */
  async getDashboard(): Promise<IDashboardUpdate> {
    let dashboardItems: IDashboardUpdate = { add: [], delete: [] };

    const productWarningData =
      await this.dashboardRepository.getProductWarnings();
    // Save details of product warnings to cache and remove from object
    productWarningData.forEach((item) => {
      if (item.details) {
        this.dashboardRepository.setCacheItem(item.id.toString(), item.details);
        productWarningData.find(
          (productItem) => productItem.id === item.id
        )!.details = undefined;
      }
    });
    dashboardItems.add = dashboardItems.add.concat(productWarningData);

    return dashboardItems;
  }

  /**
   * Get details of a dashboard item
   * @param dashboardId ID of the dashboard item
   * @returns Details of a dashboard item
   */
  async getDashboardDetails(
    dashboardId: string
  ): Promise<IDashboardItemDetails> {
    console.log("test");
    const details = await this.dashboardRepository.getCacheItem(dashboardId);

    if (details === null) {
      throw new Error("No details found for dashboard item: " + dashboardId);
    }

    return details;
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

    update.add = update.add.concat(productWarningData);

    return update;
  }
}
