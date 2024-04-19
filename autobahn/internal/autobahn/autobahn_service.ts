import { AutobahnRepository } from "./autobahn_repository";
import axios from "axios";
import https from "https";
import { IWarningModel } from "../models/warning";

export class AutobahnService {
  constructor(private readonly autobahnRepository: AutobahnRepository) {}

  async callApi(url: string) {
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
      return null;
    }
  }

  async fetchAutobahnWarnings(autobahnArray: []) {
    const autobahnWarnings: IWarningModel[] = [];
    const bannedWarnings = [
      "STATIONARY_TRAFFIC",
      "SLOW_TRAFFIC",
      "QUEUING_TRAFFIC",
    ];

    for (const autobahn of autobahnArray) {
      const autobahnWarningResult = await this.callApi(
        `https://verkehr.autobahn.de/o/autobahn/${autobahn}/services/warning`
      );
      autobahnWarningResult.warning.forEach((warning: any) => {
        if (!bannedWarnings.includes(warning.abnormalTrafficType)) {
          const description_index = warning.description.indexOf("");
          const temp_description = warning.description.slice(
            description_index + 3
          );
          let description = warning.description[
            description_index + 2
          ].replaceAll("\n", " ");

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

  async fetchData() {
    const autobahnApiResult = await this.callApi(
      "https://verkehr.autobahn.de/o/autobahn/"
    );
    if (autobahnApiResult === null) {
      return 500;
    }
    const autobahnArray = autobahnApiResult.roads;

    const autobahnWarnings = await this.fetchAutobahnWarnings(autobahnArray);

    if (autobahnWarnings === null) {
      return 200;
    }
    return this.autobahnRepository.fetchData(autobahnWarnings);
  }

  async getData(timestamp: number) {
    const data = this.autobahnRepository.getData(timestamp);
    return data;
  }

  async getDetails(id: string) {
    const data = this.autobahnRepository.getDetails(id);
    return data;
  }
}
