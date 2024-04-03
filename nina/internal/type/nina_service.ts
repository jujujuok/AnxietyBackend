import { IWarningModel } from "../models/warning";
import { NinaRepository } from "./nina_repository";
import axios from 'axios';
import https from 'https';

export class NinaService {
  constructor(private readonly ninaRepository: NinaRepository) {}

  async callApi(url: string) {

    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    const headers = {
      'accept': 'application/json'
    };

    try {
      const response = await axios.get(url, { headers, httpsAgent: agent });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async getWarnings(data: any){
    const warnings: IWarningModel[] = [];

    for (const element of data) {
      if (new Date(Date.parse(element.startDate)).getTime() <= new Date().getTime()){
        const details = await this.callApi(`https://nina.api.proxy.bund.dev/api31/warnings/${element.id}.json`)
        const warning: IWarningModel = {
          id: element.id,
          type: element.type,
          title: element.i18nTitle.de,
          description: details.info[0].description,
          instruction: details.info[0].instruction,
        };
        warnings.push(warning);
      }
    }
    return warnings;
  }

  async fetchData(){
    
    const mowas_url = "https://nina.api.proxy.bund.dev/api31/mowas/mapData.json";
    const mowas_warnungen = await this.callApi(mowas_url);
    const warnings = await this.getWarnings(mowas_warnungen);
    return warnings;
  }
}
