import { ITypeModel } from "../models/type";
import { DwDRepository } from "./dwd_repository";
import axios from 'axios';

export class DwDService {
  constructor(private readonly dwdRepository: DwDRepository) {}

  async callApi(body: object) {
    const url = 'https://s3.eu-central-1.amazonaws.com/app-prod-static.warnwetter.de/v16/warnings_nowcast.json';
    const headers = {
      'accept': 'application/json'
    };

    try {
      const response = await axios.post(url, body, { headers });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async getTypes(): Promise<ITypeModel[]> {
    // Business logic here
    return this.dwdRepository.getTypes();
  }
}
