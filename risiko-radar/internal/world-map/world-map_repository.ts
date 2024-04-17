import { faker } from "@faker-js/faker";
import { IWorldMapItem } from "../models/world-map";

/**
 * WorldMap repository
 */
export class WorldMapRepository {
  /**
   * Get list of WorldMap items
   * @returns List of WorldMap items
   */
  async getWorldMap(): Promise<IWorldMapItem[]> {
    // Example Data:
    const worldMapItems: IWorldMapItem[] = [];

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      const worldMapItem: IWorldMapItem = {
        id: faker.internet.ip(),
        type: faker.helpers.arrayElement([
          "interpol_red",
          "interpol_un",
          "travel_warning",
          "country_representative",
        ]),
        title:
          faker.hacker.adjective() +
          " " +
          faker.hacker.ingverb() +
          " " +
          faker.hacker.noun(),
        country: faker.location.country(),
        since: faker.date.past().getTime(),
      };

      worldMapItems.push(worldMapItem);
    }

    return worldMapItems;
  }

  /**
   * Get details of a WorldMap item
   * @param worldMapId WorldMap ID
   * @returns Details of a WorldMap item
   */
  async getWorldMapDetails(worldMapId: string) {
    // Example Data:
    const worldMapDetails = {
      id: worldMapId,
      type: faker.helpers.arrayElement([
        "interpol_red",
        "interpol_un",
        "travel_warning",
        "country_representative",
      ]),
      details: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        job: faker.person.jobTitle(),
        sex: faker.person.sex(),
        address: faker.location.streetAddress(),
        building: faker.location.buildingNumber(),
      },
    };

    return worldMapDetails;
  }

  /**
   * Get update of the WorldMap list
   * @param timestamp Unix Timestamp
   * @returns Update of the WorldMap list containing ids to remove and objects to add
   */
  async getWorldMapUpdate(timestamp: number) {
    // Example Data:
    const worldMapUpdate = {
      add: [] as IWorldMapItem[],
      delete: [] as number[],
    };

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      const worldMapItem: IWorldMapItem = {
        id: faker.internet.ip(),
        type: faker.helpers.arrayElement([
          "interpol_red",
          "interpol_un",
          "travel_warning",
          "country_representative",
        ]),
        title:
          faker.hacker.adjective() +
          " " +
          faker.hacker.ingverb() +
          " " +
          faker.hacker.noun(),
        country: faker.location.country(),
        since: faker.date.past().getTime(),
      };

      worldMapUpdate.add.push(worldMapItem);
    }

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      worldMapUpdate.delete.push(faker.number.int({ min: 1, max: 1000 }));
    }

    return worldMapUpdate;
  }
}
