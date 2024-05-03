import { IDashboardItem } from "../models/dashboard";
import { faker } from "@faker-js/faker";

/**
 * Repository for the dashboard module
 */
export class DashboardRepository {
  /**
   * Get list of dashboard items
   * @returns List of dashboard items
   */
  async getDashboard(): Promise<IDashboardItem[]> {
    // Example Data:
    const dashboardItems: IDashboardItem[] = [];

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      const dashboardItem: IDashboardItem = {
        id: faker.number.int({ min: 1, max: 1000 }),
        type: faker.helpers.arrayElement([
          "interpol_red",
          "interpol_un",
          "food_waring",
          "product_warning",
          "travel_warning",
          "country_representative",
        ]),
        severity: faker.helpers.arrayElement([
          "information",
          "warning",
          "danger",
          "extreme_danger",
        ]),
        title:
          faker.hacker.adjective() +
          " " +
          faker.hacker.ingverb() +
          " " +
          faker.hacker.noun(),
        description: faker.hacker.phrase(),
        since: faker.date.past().getTime(),
      };

      dashboardItems.push(dashboardItem);
    }

    return dashboardItems;
  }

  /**
   * Get details of a dashboard item
   * @param dashboardId ID of the dashboard item
   * @returns Details of a dashboard item
   */
  async getDashboardDetails(dashboardId: number) {
    // Example Data:
    const dashboardDetails = {
      id: dashboardId,
      type: faker.helpers.arrayElement([
        "interpol_red",
        "interpol_un",
        "food_waring",
        "product_warning",
        "travel_warning",
        "country_representative",
      ]),
      details: {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        country: faker.location.country(),
        image: faker.image.avatar(),
      },
    };

    return dashboardDetails;
  }

  /**
   * Get update of the dashboard list
   * @param timestamp Timestamp of the last update
   * @returns Update of the dashboard list containing ids to remove and objects to add
   */
  async getDashboardUpdate(timestamp: number) {
    // Example Data:
    const dashboardUpdate = {
      add: [] as IDashboardItem[],
      delete: [] as number[],
    };

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      const dashboardItem: IDashboardItem = {
        id: faker.number.int({ min: 1, max: 1000 }),
        type: faker.helpers.arrayElement([
          "interpol_red",
          "interpol_un",
          "food_waring",
          "product_warning",
          "travel_warning",
          "country_representative",
        ]),
        severity: faker.helpers.arrayElement([
          "information",
          "warning",
          "danger",
          "extreme_danger",
        ]),
        title:
          faker.hacker.adjective() +
          " " +
          faker.hacker.ingverb() +
          " " +
          faker.hacker.noun(),
        description: faker.hacker.phrase(),
        since: faker.date.past().getTime(),
      };

      dashboardUpdate.add.push(dashboardItem);
    }

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      dashboardUpdate.delete.push(faker.number.int({ min: 1, max: 1000 }));
    }

    return dashboardUpdate;
  }
}