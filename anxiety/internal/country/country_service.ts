import { ICountryItem } from "../models/country";
import { CountryRepository } from "./country_repository";

/**
 * Country service
 */
export class CountryService {
  constructor(private readonly countryRepository: CountryRepository) {}

  /**
   * Get list of country items
   * @returns List of country items
   */
  async getCountry(): Promise<ICountryItem[]> {
    return this.countryRepository.getCountry();
  }

  /**
   * Get details of a country item
   * @param countryId Country ID
   * @returns Details of a country item
   */
  async getCountryDetails(countryId: number) {
    return this.countryRepository.getCountryDetails(countryId);
  }

  /**
   * Get update of the countries list
   * @param timestamp Timestamp
   * @returns Update of the countries list containing ids to remove and objects to add
   */
  async getCountryUpdate(timestamp: number) {
    return this.countryRepository.getCountryUpdate(timestamp);
  }
}
