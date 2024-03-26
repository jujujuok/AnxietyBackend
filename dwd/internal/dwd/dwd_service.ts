import { ITypeModel } from "../models/type";
import { DwDRepository } from "./dwd_repository";
import axios from 'axios';

export class DwDService {
  constructor(private readonly dwdRepository: DwDRepository) {}

  async callApi(url: string) {
    const headers = {
      'accept': 'application/json'
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async getNowcastWarnings(){
    const url = 'https://s3.eu-central-1.amazonaws.com/app-prod-static.warnwetter.de/v16/warnings_nowcast.json';
    const data = await this.callApi(url);
    const time = new Date(data.time);
    console.log("timestamp: ", time)
    return data;
  }

  async getGemeindeWarnings(){
    const url = 'https://s3.eu-central-1.amazonaws.com/app-prod-static.warnwetter.de/v16/gemeinde_warnings_v2.json';
    const data = await this.callApi(url);
    return data;
  }

  async getCoastWarnings(){
    const url = 'https://s3.eu-central-1.amazonaws.com/app-prod-static.warnwetter.de/v16/warnings_coast.json';
    const data = await this.callApi(url);
    return data;
  }

  async getAll(){
    let results: Object[] = [];
    results.push(await this.getNowcastWarnings());
    results.push(await this.getGemeindeWarnings());
    results.push(await this.getCoastWarnings());
    return results;
  }
}
