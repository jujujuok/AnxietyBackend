import { DwDRepository } from "./dwd_repository";
import axios from "axios";
import { IWarningModel } from "../models/warning";

export class DwDService {
  constructor(private readonly dwdRepository: DwDRepository) {}

  private async callApi(url: string, accept?: string) {
    if (accept === undefined) {
      accept = "application/json";
    }
    const headers = {
      accept: accept,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  private transformDetails(details: string): string {
    if (details != undefined) {
      return details.replaceAll("\n", "");
    }
    return details;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformCoordinates(regions: any): string[] {
    if (regions != undefined) {
      const coordinates: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      regions.forEach((region: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        region.polygonGeometry.coordinates.forEach((polygon: any) => {
          coordinates.push(polygon);
        });
      });
    }
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dataInModel(data: any): IWarningModel[] {
    const warnings: IWarningModel[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.warnings.forEach((element: any) => {
      const description = this.transformDetails(element.description);
      const instruction = this.transformDetails(element.instruction);
      const coordinates: string[] = this.transformCoordinates(element.regions);

      warnings.push({
        id: element.warnId,
        type: element.event,
        title: element.headLine,
        description: description,
        instruction: instruction,
        coordinates: coordinates,
      });
    });
    return warnings;
  }

  async getNowcastWarnings() {
    const url =
      "https://s3.eu-central-1.amazonaws.com/app-prod-static.warnwetter.de/v16/warnings_nowcast.json";
    const data = await this.callApi(url);
    const warnings = this.dataInModel(data);
    return warnings;
  }

  async getGemeindeWarnings() {
    const url =
      "https://s3.eu-central-1.amazonaws.com/app-prod-static.warnwetter.de/v16/gemeinde_warnings_v2.json";
    const data = await this.callApi(url);
    const warnings = this.dataInModel(data);
    return warnings;
  }

  async fetchData() {
    const results: IWarningModel[] = [];

    await (
      await this.getNowcastWarnings()
    ).forEach((element: IWarningModel) => {
      results.push(element);
    });
    await (
      await this.getGemeindeWarnings()
    ).forEach((element: IWarningModel) => {
      results.push(element);
    });

    return this.dwdRepository.fetchData(results);
  }

  async getData(timestamp: number) {
    const data = this.dwdRepository.getData(timestamp);
    return data;
  }

  async getDetails(id: string) {
    const data = this.dwdRepository.getDetails(id);
    return data;
  }
}
