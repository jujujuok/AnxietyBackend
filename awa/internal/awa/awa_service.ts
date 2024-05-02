import { AwARepository } from "./awa_repository";
import axios from "axios";
import https from "https";
import { IWarningModel } from "../models/warning";

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

  transformWarning(warning: string) {
    const warningsArray: object[] = [];

    if (!warning.includes("<h3>")) {
      warning = warning.replaceAll(/<.*?>/g, "");
      warning = warning.replaceAll(/\.(?!\s)/g, ". ");
      warning = warning.replaceAll("'", "´");
      const warningArray = [warning];

      warningsArray.push(warningArray);
      return warningsArray;
    }

    warning.split("<h3>").forEach((element: string) => {
      let warningtitle;
      let warningtext;
      if (element.includes("</h3>")) {
        warningtitle = element.split("</h3>")[0];
        warningtext = element.split("</h3>")[1];
      } else {
        warningtext = element;
      }
      warningtext = warningtext.replaceAll(/<.*?>/g, "");
      warningtext = warningtext.replaceAll(/\.(?!\s)/g, ". ");
      warningtext = warningtext.replaceAll("'", "´");
      if (warningtitle != null) {
        warningtitle = warningtitle.replaceAll(/<.*?>/g, "");
        warningtitle = warningtitle.replaceAll("'", "´");
      }
      const warningArray = [warningtitle, warningtext];
      warningsArray.push(warningArray);
    });

    return warningsArray;
  }

  async fetchAndTransformWarnings(id: string) {
    const warning = (
      await this.callApi(
        `https://www.auswaertiges-amt.de/opendata/travelwarning/${id}`,
      )
    ).response[id];

    const warningContent = warning.content;

    if (!warningContent) {
      console.error("Failed to fetch data");
      return;
    }

    let aktuellWarningArray: object[] | undefined = [];

    if (warningContent.match(/<h2>.*?Aktuelles.*?<\/h2>/)) {
      const aktuellwarning = warningContent
        .split(/<h2>.*?Aktuelles.*?<\/h2>/)[1]
        .split(/<h2>.*?Sicherheit.*?<\/h2>/)[0];
      aktuellWarningArray = this.transformWarning(aktuellwarning);
    }

    const sicherheitswarning = warningContent
      .split(/<h2>.*?Sicherheit.*?<\/h2>/)[1]
      .split(/<h2>.*?Natur und Klima.*?<\/h2>/)[0];

    let gesundheitswarning: string = "";

    if (
      warningContent
        .split(/<h2>.*?Natur und Klima.*?<\/h2>/)[1]
        .match(/<h3>.*?Aktuelles.*?<\/h3>/)
    ) {
      gesundheitswarning = warningContent
        .split(/<h2>.*?Natur und Klima.*?<\/h2>/)[1]
        .split(/<h3>.*?Aktuelles.*?<\/h3>/)[1]
        .split(/<h3>.*?Impfschutz.*?<\/h3>/)[0];
    }

    gesundheitswarning = gesundheitswarning.replaceAll(/<.*?>/g, "");
    gesundheitswarning = gesundheitswarning.replaceAll(/\.(?!\s)/g, ". ");
    gesundheitswarning = gesundheitswarning.replaceAll("'", "´");

    const sicherheitswarningArray = this.transformWarning(sicherheitswarning);

    let severity;

    if (warning.warning == true) {
      severity = "Warnung";
    } else if (warning.partialWarning == true) {
      severity = "Teilwarnung";
    } else if (warning.situationWarning == true) {
      severity = "Situationswarnung";
    } else if (warning.situationPartWarning == true) {
      severity = "Teil-Situationswarnung";
    }

    if (aktuellWarningArray.length == 0) {
      aktuellWarningArray = undefined;
    }

    const countryName = warning.countryName.replaceAll("'", "´");

    const result: IWarningModel = {
      country: countryName,
      ISO3: warning.iso3CountryCode,
      severity: severity,
      link: `https://www.auswaertiges-amt.de/de/service/laender/${id}`,
      aktuell: aktuellWarningArray,
      sicherheit: sicherheitswarningArray,
      gesundheit: gesundheitswarning ? gesundheitswarning : undefined,
      lastModified: warning.lastModified,
    };

    return result;
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
      country.id = countryid;
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

    const result: IWarningModel[] | undefined = [];

    const promises = countryWarningswithWarning.map(async (country: any) => {
      try {
        const fetchResult = await this.fetchAndTransformWarnings(country.id);
        if (fetchResult) {
          result.push(fetchResult);
        }
      } catch (error) {
        console.error(
          `Failed to fetch and transform warnings for country ID: ${country.id}`,
          error,
        );
      }
    });

    // Warten Sie auf die Auflösung aller Promises
    await Promise.all(promises);

    const returnvalue = await this.awaRepository.fetchData(result);

    return returnvalue;
  }

  async getData(timestamp: number) {
    const data = this.awaRepository.getData(timestamp);
    return data;
  }

  async getDetails(id: string) {
    const data = this.awaRepository.getDetails(id);
    return data;
  }
}
