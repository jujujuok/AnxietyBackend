import { AutobahnRepository } from "./autobahn_repository";
import axios from "axios";
import https from "https";
import { IWarningModel } from "../models/warning";
import { error } from "console";
import { IReturnSchema } from "../models/return-schema";
import { IDetailsReturnSchema } from "../models/return-details";

export class AutobahnService {
  constructor(private readonly autobahnRepository: AutobahnRepository) {}

  private async callApi(url: string) {
    const headers = {
      accept: "application/json",
    };

    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    try {
      const response = await axios.get(url, { headers, httpsAgent: agent });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private checkIfBanned(type: string): boolean {
    const bannedWarnings = [
      "STATIONARY_TRAFFIC",
      "SLOW_TRAFFIC",
      "QUEUING_TRAFFIC",
    ];
    return bannedWarnings.includes(type);
  }

  private buildDescription(inputDescription: string[]): string {
    const description_index = inputDescription.indexOf("");
    const temp_description = inputDescription.slice(description_index + 3);
    let description = inputDescription[description_index + 2].replaceAll(
      "\n",
      " ",
    );

    temp_description.forEach((description_part: string) => {
      const indexOfdescription_part =
        temp_description.indexOf(description_part);
      if (indexOfdescription_part != 0) {
        description += ", ";
      } else {
        description += ": ";
      }
      description += description_part.replaceAll("\n", " ");
    });
    return description;
  }

  private async fetchAutobahnWarnings(
    autobahnArray: string[],
  ): Promise<IWarningModel[] | null> {
    const autobahnWarnings: IWarningModel[] = [];

    for (const autobahn of autobahnArray) {
      const autobahnWarningResult = await this.callApi(
        `https://verkehr.autobahn.de/o/autobahn/${autobahn}/services/warning`,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      autobahnWarningResult.warning.forEach((warning: any) => {
        if (!this.checkIfBanned(warning.abnormalTrafficType)) {
          const description = this.buildDescription(warning.description);
          const coordinates = [warning.geometry.coordinates];

          const warning_in_model: IWarningModel = {
            warning_id: warning.identifier,
            title: warning.title,
            publisheddate: warning.startTimestamp,
            description: description,
            coordinates: coordinates,
          };

          autobahnWarnings.push(warning_in_model);
        }
      });
    }

    if (autobahnWarnings.length === 0) {
      return null;
    }

    return autobahnWarnings;
  }

  private async fetchAutobahn(): Promise<string[]> {
    const autobahnApiResult = await this.callApi(
      "https://verkehr.autobahn.de/o/autobahn/",
    );
    if (autobahnApiResult === null) {
      console.error("Error fetching autobahn data");
      throw error;
    }
    return autobahnApiResult.roads;
  }

  async fetchData() {
    const autobahnArray = await this.fetchAutobahn();
    const autobahnWarnings = await this.fetchAutobahnWarnings(autobahnArray);

    if (autobahnWarnings === null) {
      return 200;
    }
    return this.autobahnRepository.fetchData(autobahnWarnings);
  }

  async getData(timestamp: number): Promise<[IReturnSchema[], string[]]> {
    const data = this.autobahnRepository.getData(timestamp);
    return data;
  }

  async getDetails(id: string): Promise<IDetailsReturnSchema | number> {
    const data = this.autobahnRepository.getDetails(id);
    return data;
  }
}
