import { IDashboardItem, IDashboardUpdate } from "../models/dashboard";
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

    dashboardItems.add.concat(
      await this.dashboardRepository.getProductWarnings()
    );

    const ninaData = await this.dashboardRepository.getNinaWarnings();
    ninaData.add.forEach((item) => {
      if (item.details) {
        this.dashboardRepository.setCacheItem(
          item.id.toString(item.id),
          item.details
        );
        ninaData.add.find((ninaItem) => ninaItem.id === item.id)!.details =
          undefined;
      }
    });
    dashboardItems.add.concat(ninaData.add);
    dashboardItems.delete.concat(ninaData.delete);

    return dashboardItems;
  }

  /**
   * Get details of a dashboard item
   * @param dashboardId ID of the dashboard item
   * @returns Details of a dashboard item
   */
  async getDashboardDetails(dashboardId: number) {
    return this.dashboardRepository.getDashboardDetails(dashboardId);
  }

  /**
   * Get update of the dashboard list
   * @param timestamp Timestamp of the last update
   * @returns Update of the dashboard list containing ids to remove and objects to add
   */
  async getDashboardUpdate(timestamp: number) {
    return this.dashboardRepository.getDashboardUpdate(timestamp);
  }
}
