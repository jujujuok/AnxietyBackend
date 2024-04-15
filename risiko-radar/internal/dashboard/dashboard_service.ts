import { IDashboardItem } from "../models/dashboard";
import { DashboardRepository } from "./dashboard_repository";

/**
 * Service for the dashboard module
 */
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  /**
   * Get list of dashboard items
   * @returns List of dashboard items
   */
  async getDashboard(): Promise<IDashboardItem[]> {
    return this.dashboardRepository.getDashboard();
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
