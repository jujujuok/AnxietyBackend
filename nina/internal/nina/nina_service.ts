import { IWarningModel } from "../models/warning";
import { NinaRepository } from "./nina_repository";
import axios from "axios";
import https from "https";

export class NinaService {
  constructor(private readonly ninaRepository: NinaRepository) {}

  async callApi(url: string) {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const headers = {
      accept: "application/json",
    };

    try {
      const response = await axios.get(url, { headers, httpsAgent: agent });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async getWarnings(data: any) {
    const warnings: IWarningModel[] = [];

    for (const element of data) {
      if (
        new Date(Date.parse(element.startDate)).getTime() <=
        new Date().getTime()
      ) {
        const details = await this.callApi(
          `https://nina.api.proxy.bund.dev/api31/warnings/${element.id}.json`
        );
        const geojson = await this.callApi(
          `https://nina.api.proxy.bund.dev/api31/warnings/${element.id}.geojson`
        );

        let description = null;
        if (details.info[0].description !== undefined){
          description = details.info[0].description.replaceAll(
            "<br/>",
            " "
          );
        }

        let instruction = null;
        if (details.info[0].instruction !== undefined) {
          instruction = details.info[0].instruction.replaceAll(
            "<br/>",
            " "
          );
        }
        
        const coordinates: any = [];

        for (const feature of geojson.features) {
          feature.geometry.coordinates.forEach((coordinate: any) =>
            coordinates.push(coordinate)
          );
        }

        const warning: IWarningModel = {
          id: element.id,
          type: element.type,
          title: element.i18nTitle.de,
          description: description,
          instruction: instruction,
          coordinates: coordinates,
        };
        warnings.push(warning);
      }
    }
    return warnings;
  }

  async fetchData() {
    const warnings = [];

    const mowas_url =
      "https://nina.api.proxy.bund.dev/api31/mowas/mapData.json";
    const mowas_warnungen = await this.callApi(mowas_url);
    warnings.push(await this.getWarnings(mowas_warnungen));

    const katwarn_url =
      "https://nina.api.proxy.bund.dev/api31/katwarn/mapData.json";
    const katwarn_warnungen = await this.callApi(katwarn_url);
    warnings.push(await this.getWarnings(katwarn_warnungen));

    const biwapp_url =
      "https://nina.api.proxy.bund.dev/api31/biwapp/mapData.json";
    const biwapp_warnungen = await this.callApi(biwapp_url);
    warnings.push(await this.getWarnings(biwapp_warnungen));

    const polizei_url =
      "https://nina.api.proxy.bund.dev/api31/police/mapData.json";
    const polizei_warnungen = await this.callApi(polizei_url);
    warnings.push(await this.getWarnings(polizei_warnungen));

    return this.ninaRepository.fetchData(warnings);
  }

  async getData(timestamp: number) {
    const data = this.ninaRepository.getData(timestamp);
    return data;
  }
}
