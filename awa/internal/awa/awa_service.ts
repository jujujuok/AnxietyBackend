import { AwARepository } from "./awa_repository";
import axios from "axios";
import https from "https";

export class AwAService {
  constructor(private readonly awaRepository: AwARepository) {}

  async callApi(url: string) {
    const headers = {
      accept: "text/json;charset=UTF-8",
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

  async fetchData() {
    const countryWarnings = (
      await this.callApi(
        "https://www.auswaertiges-amt.de/opendata/travelwarning",
      )
    ).response;
    if (!countryWarnings) {
      console.error("Failed to fetch data");
      return;
    }

    const countryIds = countryWarnings.contentList;

    const countryWarningswithoutWarning: object[] = [];
    const countryWarningswithWarning: object[] = [];

    countryIds.forEach((countryid: string) => {
      const country = countryWarnings[countryid];
      if (
        country.warning == false &&
        country.partialWarning == false &&
        country.situationWarning == false &&
        country.situationPartWarning == false
      ) {
        countryWarningswithoutWarning.push(country);
      } else {
        countryWarningswithWarning.push(country);
      }
    });

    return countryWarningswithoutWarning;
  }
}
