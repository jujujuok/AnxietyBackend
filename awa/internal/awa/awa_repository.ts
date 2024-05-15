import { Pool } from "pg";
import { IWarningModel } from "../models/warning";
import { IReturnWarningSchema } from "../models/return-warning-schema";
import { IReturnEmbassySchema } from "../models/return-embassy-schema";
import { IDetailsReturnSchema } from "../models/return-details";
import { IEmbassyModel } from "../models/embassy";
import { IEmbassyDetailsSchema } from "../models/embassy-details-schema";

export class AwARepository {
  constructor(private readonly db: Pool) {}

  async closeDataForCountryWithoutWarning(warningids: string) {
    const client = await this.db.connect();
    try {
      const result = await client.query(
        `Update awa.warnings SET loadenddate = CURRENT_TIMESTAMP WHERE iso3 NOT IN (${warningids}) AND loadenddate IS NULL`,
      );
      console.log(result.rowCount + " rows updated");
    } finally {
      client.release();
      return 200;
    }
  }

  async closeDataForCountryWithNewWarning(
    warnings: IWarningModel[],
  ): Promise<number> {
    const client = await this.db.connect();
    try {
      let updates = 0;
      warnings.forEach(async (warning: IWarningModel) => {
        const result = await client.query(
          `Update awa.warnings SET loadenddate = CURRENT_TIMESTAMP WHERE iso3 = '${warning.ISO3}' AND loadenddate IS NULL AND loaddate < TO_TIMESTAMP(${warning.lastModified}/1000)`,
        );
        if (result.rowCount != null && result.rowCount > 0) {
          updates += result.rowCount;
        }
      });
      console.log(updates + " rows updated");
    } finally {
      client.release();
      return 200;
    }
  }

  async checkWarnings(warnings: IWarningModel[]) {
    const values = warnings
      .map((warning: IWarningModel) => `'${warning.ISO3}'`)
      .join(",");
    const closeresult1 = await this.closeDataForCountryWithoutWarning(values);
    const closeresult2 = await this.closeDataForCountryWithNewWarning(warnings);

    const client = await this.db.connect();
    try {
      const result = await client.query(
        `SELECT iso3 FROM awa.warnings WHERE loadenddate IS NULL AND iso3 IN (${values})`,
      );
      result.rows.forEach((row: any) => {
        warnings = warnings.filter(
          (warning: IWarningModel) => warning.ISO3 != row.iso3,
        );
      });
    } finally {
      client.release();
      console.log("New Data: " + warnings.length);
      return warnings;
    }
  }

  async fetchWarnings(warnings: IWarningModel[]) {
    const newwarnings = await this.checkWarnings(warnings);

    if (newwarnings.length == 0) {
      console.log("No new data");
      return 200;
    }
    const values_warnings = newwarnings
      .map((warning) => {
        const aktuellArray = warning.aktuell
          ? warning.aktuell.map((aktuell) => `'${aktuell}'`).join(", ")
          : "NULL";

        const sicherheitArray = warning.sicherheit
          ? warning.sicherheit.map((sicherheit) => `'${sicherheit}'`).join(", ")
          : "NULL";

        const aktuellValue = warning.aktuell
          ? `ARRAY[${aktuellArray}]`
          : "NULL";
        const sicherheitValue = warning.sicherheit
          ? `ARRAY[${sicherheitArray}]`
          : "NULL";

        return `('${warning.ISO3}', '${warning.country}', '${warning.severity}', '${warning.link}', ${aktuellValue}, ${sicherheitValue}, '${warning.gesundheit}')`;
      })
      .join(", ");

    const client = await this.db.connect();

    try {
      const result = await client.query(
        `INSERT INTO awa.warnings (iso3, country, severity, warning_link, aktuell, sicherheit, gesundheit) VALUES ${values_warnings}`,
      );
      console.log(result.rowCount + " rows inserted");
    } finally {
      client.release();
      return 200;
    }
  }

  async closeDataForEmbassy(embassys: IEmbassyModel[]): Promise<number> {
    const client = await this.db.connect();
    try {
      let updates = 0;
      embassys.forEach(async (embassy: IEmbassyModel) => {
        const result = await client.query(
          `Update awa.embassys SET loadenddate = CURRENT_TIMESTAMP WHERE city = '${embassy.city}' AND description = '${embassy.description}' AND loadenddate IS NULL AND loaddate < TO_TIMESTAMP(${embassy.lastModified}/1000)`,
        );
        if (result.rowCount != null && result.rowCount > 0) {
          updates += result.rowCount;
        }
      });
      console.log(updates + " rows updated");
    } finally {
      client.release();
      return 200;
    }
  }

  async checkEmbassys(embassys: IEmbassyModel[]) {
    const values = embassys
      .map(
        (embassy: IEmbassyModel) =>
          `('${embassy.city}', '${embassy.description}')`,
      )
      .join(",");

    const closeresult = await this.closeDataForEmbassy(embassys);

    const client = await this.db.connect();
    try {
      const result = await client.query(
        `SELECT city, description FROM awa.embassys WHERE loadenddate IS NULL AND (city, description) IN (${values});`,
      );
      result.rows.forEach((row: any) => {
        embassys = embassys.filter(
          (embassy: IEmbassyModel) =>
            embassy.city != row.city || embassy.description != row.description,
        );
      });
    } finally {
      client.release();
      console.log("New Data: " + embassys.length);
      return embassys;
    }
  }

  async fetchEmbassys(embassys: IEmbassyModel[]) {
    const newembassys = await this.checkEmbassys(embassys);

    if (newembassys.length == 0) {
      console.log("No new data");
      return 200;
    }

    const values_embassys = newembassys
      .map(
        (embassy: IEmbassyModel) =>
          `('${embassy.country}', '${embassy.city}', '${embassy.description}', '${embassy.address}', '${embassy.contact}', '${embassy.emergencyphone}', '${embassy.phone}', '${embassy.website}', '${embassy.mail}')`,
      )
      .join(", ");

    const client = await this.db.connect();

    try {
      const result = await client.query(
        `INSERT INTO awa.embassys (country, city, description, address, contact, emergencyphone, phone, website, mail) VALUES ${values_embassys}`,
      );
      console.log(result.rowCount + " rows inserted");
    } finally {
      client.release();
      return 200;
    }
  }

  async getClosedWarnings(timestamp: number) {
    if (!timestamp) {
      return "";
    }

    var warningids: string[] = [];

    const client = await this.db.connect();
    try {
      const result = await client.query(
        `SELECT warning_id FROM awa.warnings WHERE loadenddate > TO_TIMESTAMP(${timestamp}/1000)`,
      );
      result.rows.forEach((row: any) => {
        const warningid = "tra." + row.warning_id;
        warningids.push(warningid);
      });
      console.log(result.rows.length + " rows closed since last request");
    } finally {
      client.release();
      return warningids;
    }
  }

  async getWarning(timestamp: number) {
    const warnings: IReturnWarningSchema[] = [];

    const client = await this.db.connect();
    try {
      var timestampstatement = "WHERE";
      if (timestamp) {
        timestampstatement = `WHERE loaddate > TO_TIMESTAMP(${timestamp}/1000) AND`;
      }

      const resultwarnings = await client.query(
        `SELECT * FROM awa.warnings ${timestampstatement} loadenddate IS NULL`,
      );

      console.log(resultwarnings.rows.length + " rows selected");

      resultwarnings.rows.forEach((row: any) => {
        const warning: IReturnWarningSchema = {
          id: "tra." + row.warning_id,
          type: "travel_warning",
          severity: row.severity.trim(),
          country: row.country,
          iso3: row.iso3,
          details: {
            link: row.warning_link,
            aktuell: row.aktuell === "undefined" ? undefined : row.aktuell,
            sicherheit: row.sicherheit,
            gesundheit:
              row.gesundheit === "undefined" ? undefined : row.gesundheit,
          },
        };
        warnings.push(warning);
      });
    } finally {
      client.release();
      const closedWarningIds = await this.getClosedWarnings(timestamp);
      const result = [warnings, closedWarningIds];
      return result;
    }
  }

  async getClosedEmbassys(timestamp: number) {
    if (!timestamp) {
      return "";
    }

    var embassyids: string[] = [];

    const client = await this.db.connect();
    try {
      const result = await client.query(
        `SELECT embassy_id FROM awa.embassys WHERE loadenddate > TO_TIMESTAMP(${timestamp}/1000)`,
      );
      result.rows.forEach((row: any) => {
        const embassyid = "emb." + row.embassy_id;
        embassyids.push(embassyid);
      });
      console.log(result.rows.length + " rows closed since last request");
    } finally {
      client.release();
      return embassyids;
    }
  }

  async getEmbassys(timestamp: number) {
    const embassys: IReturnEmbassySchema[] = [];

    const client = await this.db.connect();
    try {
      var timestampstatement = "WHERE";
      if (timestamp) {
        timestampstatement = `WHERE loaddate > TO_TIMESTAMP(${timestamp}/1000) AND`;
      }

      const resultembassys = await client.query(
        `SELECT * FROM awa.embassys ${timestampstatement} loadenddate IS NULL`,
      );

      console.log(resultembassys.rows.length + " rows selected");

      resultembassys.rows.forEach((row: any) => {
        const embassy: IReturnEmbassySchema = {
          id: "emb." + row.embassy_id,
          type: "embassy",
          severity: undefined,
          title: row.description,
          country: row.country,
          city: row.city,
          details: {
            address: row.address === "undefined" ? undefined : row.address,
            contact: row.contact === "undefined" ? undefined : row.contact,
            emergencyphone:
              row.emergencyphone === "undefined"
                ? undefined
                : row.emergencyphone,
            phone: row.phone === "undefined" ? undefined : row.phone,
            website: row.website === "undefined" ? undefined : row.website,
            mail: row.mail === "undefined" ? undefined : row.mail,
          },
        };
        embassys.push(embassy);
      });
    } finally {
      client.release();
      const closedWarningIds = await this.getClosedEmbassys(timestamp);
      const result = [embassys, closedWarningIds];
      return result;
    }
  }

  async getData(timestamp: number) {
    const warnings = await this.getWarning(timestamp);
    const embassys = await this.getEmbassys(timestamp);

    return [warnings, embassys];
  }

  async getWarningDetails(id: string) {
    const client = await this.db.connect();
    let details: IDetailsReturnSchema | undefined = undefined;
    try {
      const result_warnings = await client.query(
        "SELECT * FROM awa.warnings WHERE warning_id = $1;",
        [id],
      );
      console.log("Details selected");
      if (result_warnings.rows.length > 0) {
        const row = result_warnings.rows[0];
        details = {
          link: row.warning_link,
          aktuell: row.aktuell === "undefined" ? undefined : row.aktuell,
          sicherheit: row.sicherheit,
          gesundheit:
            row.gesundheit === "undefined" ? undefined : row.gesundheit,
        };
      }
    } finally {
      client.release();
      if (details !== undefined) {
        return details;
      } else {
        return 204;
      }
    }
  }

  async getEmbassyDetails(id: string) {
    const client = await this.db.connect();
    let details: IEmbassyDetailsSchema | undefined = undefined;
    try {
      const result_embassys = await client.query(
        "SELECT * FROM awa.embassys WHERE embassy_id = $1;",
        [id],
      );
      console.log("Details selected");
      if (result_embassys.rows.length > 0) {
        const row = result_embassys.rows[0];
        details = {
          address: row.address === "undefined" ? undefined : row.address,
          contact: row.contact === "undefined" ? undefined : row.contact,
          emergencyphone:
            row.emergencyphone === "undefined" ? undefined : row.emergencyphone,
          phone: row.phone === "undefined" ? undefined : row.phone,
          website: row.website === "undefined" ? undefined : row.website,
          mail: row.mail === "undefined" ? undefined : row.mail,
        };
      }
    } finally {
      client.release();
      if (details !== undefined) {
        return details;
      } else {
        return 204;
      }
    }
  }

  async getDetails(id: string) {
    if (id.startsWith("tra.")) {
      id = id.replace("tra.", "");
      return await this.getWarningDetails(id);
    } else if (id.startsWith("emb.")) {
      id = id.replace("emb.", "");
      return await this.getEmbassyDetails(id);
    } else {
      return 400;
    }
  }
}
