import { faker } from "@faker-js/faker";
import { IMapItem } from "../models/map";

/**
 * Repository for the map module
 */
export class MapRepository {
  /**
   * Get list of map items
   * @returns List of map items
   */
  async getMap(): Promise<IMapItem[]> {
    // Example Data:
    const mapItems: IMapItem[] = [];

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      const mapItem: IMapItem = {
        id: faker.number.int({ min: 1, max: 1000 }),
        type: faker.helpers.arrayElement([
          "weather_flood",
          "weather_storm",
          "weather_disaster",
          "street_closure",
          "street_report",
          "police",
          "air_quality",
          "radiation",
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
        position: {
          lat: faker.location.latitude(),
          lon: faker.location.longitude(),
        },
        area: faker.datatype.boolean() // either array for polygon or number for radius
          ? [
              // array for polygon
              faker.location.latitude(),
              faker.location.longitude(),
              faker.location.latitude(),
              faker.location.longitude(),
              faker.location.latitude(),
              faker.location.longitude(),
            ]
          : // number for radius
            faker.number.int({ min: 1, max: 1000 }),
        since: faker.date.past().getTime(),
      };

      mapItems.push(mapItem);
    }

    return mapItems;
  }

  /**
   * Get details of a map item
   * @param mapId ID of the map item
   * @returns Details of a map item
   */
  async getMapDetails(mapId: number) {
    // Example Data:
    const mapDetails = {
      id: mapId,
      type: faker.helpers.arrayElement([
        "weather_flood",
        "weather_storm",
        "weather_disaster",
        "street_closure",
        "street_report",
        "police",
        "air_quality",
        "radiation",
      ]),
      details: {
        since: faker.date.past().getTime(),
        until: faker.date.future().getTime(),
        reason: faker.hacker.phrase(),
        street: faker.location.street(),
      },
    };

    return mapDetails;
  }

  /**
   * Get update of the map list
   * @param timestamp Timestamp
   * @returns Update of the map list containing ids to remove and objects to add
   */
  async getMapUpdate(timestamp: number) {
    // Example Data:
    const mapUpdate = {
      add: [] as IMapItem[],
      delete: [] as number[],
    };

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      const mapItem: IMapItem = {
        id: faker.number.int({ min: 1, max: 1000 }),
        type: faker.helpers.arrayElement([
          "weather_flood",
          "weather_storm",
          "weather_disaster",
          "street_closure",
          "street_report",
          "police",
          "air_quality",
          "radiation",
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
        position: {
          lat: faker.location.latitude(),
          lon: faker.location.longitude(),
        },
        area: faker.datatype.boolean() // either array for polygon or number for radius
          ? [
              // array for polygon
              faker.location.latitude(),
              faker.location.longitude(),
              faker.location.latitude(),
              faker.location.longitude(),
              faker.location.latitude(),
              faker.location.longitude(),
            ]
          : // number for radius
            faker.number.int({ min: 1, max: 1000 }),
        since: faker.date.past().getTime(),
      };

      mapUpdate.add.push(mapItem);
    }

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      mapUpdate.delete.push(faker.number.int({ min: 1, max: 1000 }));
    }

    return mapUpdate;
  }
}