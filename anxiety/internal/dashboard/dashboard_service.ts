import { IDashboardItem } from "../models/dashboard";
import { DashboardRepository } from "./dashboard_repository";

export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getDashboard(): Promise<IDashboardItem[]> {
    return this.dashboardRepository.getDashboard();
  }

  async getDashboardDetails(dashboardId: number) {
    return this.dashboardRepository.getDashboardDetails(dashboardId);
  }

  async getDashboardUpdate(timestamp: number) {
    return this.dashboardRepository.getDashboardUpdate(timestamp);
  }
}
