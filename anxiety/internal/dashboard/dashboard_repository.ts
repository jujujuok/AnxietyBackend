import { IDashboardItemModel } from "../models/dashboard";
import { faker } from "@faker-js/faker";

export class DashboardRepository {
  async getDashboards(): Promise<IDashboardItemModel[]> {
    // Example Data:
    const dashboards: IDashboardItemModel[] = [];

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      const dashboardItem: IDashboardItemModel = {
        id: faker.number.int({ min: 1, max: 1000 }),
        type: "interpol_red",
        severity: "extreme_danger",
        title:
          faker.hacker.adjective() +
          " " +
          faker.hacker.ingverb() +
          " " +
          faker.hacker.noun(),
        description: faker.hacker.phrase(),
        since: faker.date.past().getTime(),
      };

      dashboards.push(dashboardItem);
    }

    return dashboards;
  }

  async getDashboardDetails(dashboardId: number) {
    // Example Data:
    const dashboardDetails = {
      id: dashboardId,
      type: "interpol_red",
      details: {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        country: faker.location.country(),
        image: faker.image.avatar(),
      },
    };

    return dashboardDetails;
  }

  async getDashboardUpdate(timestamp: number) {
    // Example Data:
    const dashboardUpdate = {
      add: [] as IDashboardItemModel[],
      delete: [] as number[],
    };

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      const dashboardItem: IDashboardItemModel = {
        id: faker.number.int({ min: 1, max: 1000 }),
        type: "interpol_red",
        severity: "extreme_danger",
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
