import { faker } from "@faker-js/faker";
import { ICountryItem } from "../models/country";

/**
 * Country repository
 */
export class CountryRepository {
  /**
   * Get list of country items
   * @returns List of country items
   */
  async getCountry(): Promise<ICountryItem[]> {
    // Example Data:
    const countryItems: ICountryItem[] = [];

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      const countryItem: ICountryItem = {
        id: faker.number.int({ min: 1, max: 1000 }),
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

      countryItems.push(countryItem);
    }

    return countryItems;
  }

  /**
   * Get details of a country item
   * @param countryId Country ID
   * @returns Details of a country item
   */
  async getCountryDetails(countryId: number) {
    // Example Data:
    const countryDetails = {
      id: countryId,
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

    return countryDetails;
  }

  /**
   * Get update of the countries list
   * @param timestamp Unix Timestamp
   * @returns Update of the countries list containing ids to remove and objects to add
   */
  async getCountryUpdate(timestamp: number) {
    // Example Data:
    const countryUpdate = {
      add: [] as ICountryItem[],
      delete: [] as number[],
    };

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      const countryItem: ICountryItem = {
        id: faker.number.int({ min: 1, max: 1000 }),
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

      countryUpdate.add.push(countryItem);
    }

    for (let i = 0; i < faker.number.int({ max: 10 }); i++) {
      countryUpdate.delete.push(faker.number.int({ min: 1, max: 1000 }));
    }

    return countryUpdate;
  }
}
