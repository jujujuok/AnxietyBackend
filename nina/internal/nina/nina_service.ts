import { IWarningModel } from "../models/warning";
import { NinaRepository } from "./nina_repository";
import axios from "axios";
import https from "https";

export class NinaService {
  constructor(private readonly ninaRepository: NinaRepository) {}

  private async callApi(url: string) {
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
      throw error;
    }
  }

  private transformDetailPart(detailPart: string): string | null {
    let result = null;
    if (detailPart !== undefined) {
      result = detailPart.replaceAll("<br/>", " ");
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformCoordinates(geojsonFeatures: any): string[] {
    const coordinates: string[] = [];
    for (const feature of geojsonFeatures) {
      feature.geometry.coordinates.forEach((coordinate: string) =>
        coordinates.push(coordinate),
      );
    }
    return coordinates;
  }

  private transformWarning(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details: any, // eslint-disable-next-line @typescript-eslint/no-explicit-any
    geojson: any, // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element: any,
  ): IWarningModel {
    const description = this.transformDetailPart(details.info[0].description);
    const instruction = this.transformDetailPart(details.info[0].instruction);
    const coordinates = this.transformCoordinates(geojson.features);

    return {
      id: element.id,
      type: element.type,
      title: element.i18nTitle.de,
      description: description,
      instruction: instruction,
      coordinates: coordinates,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getWarnings(data: any) {
    const warnings: IWarningModel[] = [];

    for (const element of data) {
      const details = await this.callApi(
        `https://nina.api.proxy.bund.dev/api31/warnings/${element.id}.json`,
      );
      const geojson = await this.callApi(
        `https://nina.api.proxy.bund.dev/api31/warnings/${element.id}.geojson`,
      );
      const warning = this.transformWarning(details, geojson, element);
      warnings.push(warning);
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

    const lhp_url = "https://nina.api.proxy.bund.dev/api31/lhp/mapData.json";
    const lhp_warnungen = await this.callApi(lhp_url);
    warnings.push(await this.getWarnings(lhp_warnungen));

    return this.ninaRepository.fetchData(warnings.flat());
  }

  async getData(timestamp: number) {
    const data = this.ninaRepository.getData(timestamp);
    return data;
  }

  async getDetails(id: string) {
    const data = this.ninaRepository.getDetails(id);
    return data;
  }
}
