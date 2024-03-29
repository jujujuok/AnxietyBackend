import { faker } from "@faker-js/faker";
import { IMapItemModel } from "../models/map";

export class MapRepository {
  async getMap(): Promise<IMapItemModel[]> {
    // Example Data:
    const mapItems: IMapItemModel[] = [];

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      const mapItem: IMapItemModel = {
        id: faker.number.int({ min: 1, max: 1000 }),
        type: "weather_flood",
        severity: "extreme_danger",
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

  async getMapDetails(mapId: number) {
    // Example Data:
    const mapDetails = {
      id: mapId,
      type: "street_closure",
      details: {
        since: faker.date.past().getTime(),
        until: faker.date.future().getTime(),
        reason: faker.hacker.phrase(),
        street: faker.location.street(),
      },
    };

    return mapDetails;
  }

  async getMapUpdate(timestamp: number) {
    // Example Data:
    const mapUpdate = {
      add: [] as IMapItemModel[],
      delete: [] as number[],
    };

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      const mapItem: IMapItemModel = {
        id: faker.number.int({ min: 1, max: 1000 }),
        type: "weather_flood",
        severity: "extreme_danger",
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
