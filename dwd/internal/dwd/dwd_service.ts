import { Axios } from "axios";
import { ITypeModel } from "../models/type";
import { DwDRepository } from "./dwd_repository";
import axios from 'axios';
import { AxiosHeaders } from "axios";

export class DwDService {
  constructor(private readonly dwdRepository: DwDRepository) {}

  async callApi(url: string, accept?: string) {
    if (accept === undefined) {
      accept = 'application/json';
    }
    const headers = {
      'accept': accept
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
    const headers = {
      'accept': 'application/text'
    };
    const data = await this.callApi(url);
    return data;
  }

  async getCoastWarnings(){
    const url = 'https://s3.eu-central-1.amazonaws.com/app-prod-static.warnwetter.de/v16/warnings_coast.json';
    const data = await this.callApi(url, 'application/text');
    return data;
  }

  async getSeaWarnings(){
    const url = 'https://s3.eu-central-1.amazonaws.com/app-prod-static.warnwetter.de/v16/sea_warning_text.json';
    const data = await this.callApi(url);

    if(data.includes("Vorhersage gültig bis") == false) {
      return [];
    }
    let warning = data.split("Vorhersage gültig bis")[0];

    if(warning.includes("Warnhinweise") == false) {
      return [];
    }
    warning = warning.split("Warnhinweise")[1];

    let warnings: string[] = [];

    warning.split('<p><span role="text">').forEach((element: string) => {
      console.log(element);
      if(element != "</h4>") {
        element.split("<h4>").forEach((element2: string) => {
          console.log(element2);
          if(element2 != "") {
            if (element2.includes("<b>")) {
              warnings.push(element2.split("<b>")[1].split("</b>")[0]);
              if (element2.split("<b>")[2] != undefined){
                warnings.push(element2.split("<b>")[2].split("</b>")[0]);
              }
            }
            else if (element2.includes("</h4>")) {
              warnings.push(element2.split("</h4>")[0]);
              if(element2.split("</h4>")[1].split("</span>")[0] != undefined) {
                warnings.push(element2.split("</h4>")[1].split("</span>")[0]);
              }
            }
          }
        });
      }
    });

    return warnings;
  }

  async getAll(){
    let results: Object[] = [];
    results.push(await this.getNowcastWarnings());
    results.push(await this.getGemeindeWarnings());
    results.push(await this.getCoastWarnings());
    return results;
  }
}
