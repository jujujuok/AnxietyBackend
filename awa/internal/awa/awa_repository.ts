import { Pool, QueryResult, QueryResultRow } from "pg";
import { IWarningModel } from "../models/warning";
import { IReturnWarningSchema } from "../models/return-warning-schema";
import { IReturnEmbassySchema } from "../models/return-embassy-schema";
import { IDetailsReturnSchema } from "../models/return-details";
import { IEmbassyModel } from "../models/embassy";
import { IEmbassyDetailsSchema } from "../models/embassy-details-schema";

export class AwARepository {
  constructor(private readonly db: Pool) {}

  private async executeQuery(
    query: string,
    values: unknown[],
  ): Promise<QueryResult> {
    const client = await this.db.connect();
    try {
      const result = await client.query(query, values);
      client.release();
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async closeDataForCountryWithoutWarning(
    warningids: string[],
  ): Promise<number> {
    const stringWarningIds = warningids.map((id) => `'${id}'`).join(",");

    try {
      let SQL = `Update awa.warnings SET loadenddate = CURRENT_TIMESTAMP WHERE iso3 NOT IN (${stringWarningIds}) AND loadenddate IS NULL`;

      if (warningids.length == 0) {
        SQL = `Update awa.warnings SET loadenddate = CURRENT_TIMESTAMP WHERE loadenddate IS NULL`;
      }

      await this.executeQuery(SQL, []);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return 200;
    }
  }

  private async closeDataForCountryWithNewWarning(
    warnings: IWarningModel[],
  ): Promise<number> {
    try {
      for (const warning of warnings) {
        await this.executeQuery(
          `Update awa.warnings SET loadenddate = CURRENT_TIMESTAMP WHERE iso3 = $1 AND loadenddate IS NULL AND loaddate < TO_TIMESTAMP($2/1000)`,
          [warning.ISO3, warning.lastModified],
        );
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return 200;
    }
  }

  private mapISO3s(warnings: IWarningModel[]): string[] {
    return warnings.map((warning: IWarningModel) => warning.ISO3);
  }

  private filterNewWarnings(
    result: QueryResult,
    warnings: IWarningModel[],
  ): IWarningModel[] {
    result.rows.forEach((row: QueryResultRow) => {
      warnings = warnings.filter(
        (warning: IWarningModel) => warning.ISO3 != row.iso3,
      );
    });
    return warnings;
  }

  private async checkWarnings(
    warnings: IWarningModel[],
  ): Promise<IWarningModel[]> {
    const values = this.mapISO3s(warnings);
    await this.closeDataForCountryWithoutWarning(values);
    await this.closeDataForCountryWithNewWarning(warnings);

    if (values.length == 0) {
      return [];
    }

    try {
      const result = await this.executeQuery(
        `SELECT iso3 FROM awa.warnings WHERE loadenddate IS NULL AND iso3 = ANY($1)`,
        [values],
      );
      warnings = this.filterNewWarnings(result, warnings);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return warnings;
    }
  }

  private transformArray(array: object[]): string {
    const arrayString = array.map((element) => `'${element}'`).join(", ");
    return `ARRAY[${arrayString}]`;
  }

  async fetchWarnings(warnings: IWarningModel[]) {
    const newwarnings = await this.checkWarnings(warnings);

    if (newwarnings.length == 0) {
      return 200;
    }

    try {
      for (const warning of newwarnings) {
        const aktuellArray = warning.aktuell
          ? this.transformArray(warning.aktuell)
          : "NULL";

        const sicherheitArray = warning.sicherheit
          ? this.transformArray(warning.sicherheit)
          : "NULL";

        await this.executeQuery(
          `INSERT INTO awa.warnings (iso3, country, severity, warning_link, aktuell, sicherheit, gesundheit) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            warning.ISO3,
            warning.country,
            warning.severity,
            warning.link,
            aktuellArray,
            sicherheitArray,
            warning.gesundheit,
          ],
        );
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return 200;
    }
  }

  private async closeDataForEmbassy(
    embassys: IEmbassyModel[],
  ): Promise<number> {
    try {
      embassys.forEach(async (embassy: IEmbassyModel) => {
        await this.executeQuery(
          `Update awa.embassys SET loadenddate = CURRENT_TIMESTAMP WHERE city = '$1' AND description = '$2' AND loadenddate IS NULL AND loaddate < TO_TIMESTAMP($3/1000)`,
          [embassy.city, embassy.description, embassy.lastModified],
        );
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return 200;
    }
  }

  private mapEmbassys(embassys: IEmbassyModel[]): string {
    return embassys
      .map(
        (embassy: IEmbassyModel) =>
          `('${embassy.city}', '${embassy.description}')`,
      )
      .join(", ");
  }

  private filterNewEmbassys(
    result: QueryResult,
    embassys: IEmbassyModel[],
  ): IEmbassyModel[] {
    result.rows.forEach((row: QueryResultRow) => {
      embassys = embassys.filter(
        (embassy: IEmbassyModel) =>
          embassy.city != row.city || embassy.description != row.description,
      );
    });
    return embassys;
  }

  async checkEmbassys(embassys: IEmbassyModel[]) {
    const values = this.mapEmbassys(embassys);
    await this.closeDataForEmbassy(embassys);

    try {
      const result = await this.executeQuery(
        `SELECT city, description FROM awa.embassys WHERE loadenddate IS NULL AND (city, description) IN (${values});`,
        [],
      );
      embassys = this.filterNewEmbassys(result, embassys);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return embassys;
    }
  }

  async fetchEmbassys(embassys: IEmbassyModel[]) {
    const newembassys = await this.checkEmbassys(embassys);

    if (newembassys.length == 0) {
      return 200;
    }

    try {
      for (const embassy of newembassys) {
        await this.executeQuery(
          `INSERT INTO awa.embassys (country, city, description, address, contact, emergencyphone, phone, website, mail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            embassy.country,
            embassy.city,
            embassy.description,
            embassy.address,
            embassy.contact,
            embassy.emergencyphone,
            embassy.phone,
            embassy.website,
            embassy.mail,
          ],
        );
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return 200;
    }
  }

  private transformIds(rows: QueryResultRow[], prefix: string): string[] {
    const ids: string[] = [];
    rows.forEach((row: QueryResultRow) => {
      row.warning_id = prefix + row.warning_id;
      ids.push(row.warning_id);
    });
    return ids;
  }

  private async getClosedWarnings(timestamp: number) {
    if (!timestamp) {
      return [];
    }

    let warningids: string[] = [];

    try {
      const result = await this.executeQuery(
        `SELECT warning_id FROM awa.warnings WHERE loadenddate > TO_TIMESTAMP($1/1000)`,
        [timestamp],
      );
      warningids = this.transformIds(result.rows, "tra.");
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return warningids;
    }
  }

  private transformWarning(row: QueryResultRow): IReturnWarningSchema {
    return {
      id: "tra." + row.warning_id,
      type: "travel_warning",
      severity: row.severity.trim(),
      country: row.country,
      iso3: row.iso3,
      details: {
        link: row.warning_link,
        aktuell: row.aktuell === "undefined" ? undefined : row.aktuell,
        sicherheit: row.sicherheit,
        gesundheit: row.gesundheit === "undefined" ? undefined : row.gesundheit,
      },
    };
  }

  private async getWarning(timestamp: number) {
    const warnings: IReturnWarningSchema[] = [];
    let closedWarningIds: string[] = [];
    try {
      let timestampstatement = "WHERE";
      if (timestamp) {
        timestampstatement = `WHERE loaddate > TO_TIMESTAMP(${timestamp}/1000) AND`;
      }

      const resultwarnings = await this.executeQuery(
        `SELECT * FROM awa.warnings ${timestampstatement} loadenddate IS NULL`,
        [],
      );

      resultwarnings.rows.forEach((row: QueryResultRow) => {
        const warning = this.transformWarning(row);
        warnings.push(warning);
      });
      closedWarningIds = await this.getClosedWarnings(timestamp);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return [warnings, closedWarningIds];
    }
  }

  private async getClosedEmbassys(timestamp: number) {
    if (!timestamp) {
      return [];
    }

    let embassyids: string[] = [];

    try {
      const result = await this.executeQuery(
        `SELECT embassy_id FROM awa.embassys WHERE loadenddate > TO_TIMESTAMP($1/1000)`,
        [timestamp],
      );
      embassyids = this.transformIds(result.rows, "emb.");
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return embassyids;
    }
  }

  private transformEmbassy(row: QueryResultRow): IReturnEmbassySchema {
    return {
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
          row.emergencyphone === "undefined" ? undefined : row.emergencyphone,
        phone: row.phone === "undefined" ? undefined : row.phone,
        website: row.website === "undefined" ? undefined : row.website,
        mail: row.mail === "undefined" ? undefined : row.mail,
      },
    };
  }

  private async getEmbassys(timestamp: number) {
    const embassys: IReturnEmbassySchema[] = [];
    let closedWarningIds: string[] = [];
    try {
      let timestampstatement = "WHERE";
      if (timestamp) {
        timestampstatement = `WHERE loaddate > TO_TIMESTAMP(${timestamp}/1000) AND`;
      }

      const resultembassys = await this.executeQuery(
        `SELECT * FROM awa.embassys ${timestampstatement} loadenddate IS NULL`,
        [],
      );

      resultembassys.rows.forEach((row: QueryResultRow) => {
        const embassy = this.transformEmbassy(row);
        embassys.push(embassy);
      });
      closedWarningIds = await this.getClosedEmbassys(timestamp);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return [embassys, closedWarningIds];
    }
  }

  async getData(timestamp: number) {
    const warnings = await this.getWarning(timestamp);
    const embassys = await this.getEmbassys(timestamp);

    return [warnings, embassys];
  }

  private transformWarningDetails(row: QueryResultRow): IDetailsReturnSchema {
    return {
      link: row.warning_link,
      aktuell: row.aktuell === "undefined" ? undefined : row.aktuell,
      sicherheit: row.sicherheit,
      gesundheit: row.gesundheit === "undefined" ? undefined : row.gesundheit,
    };
  }

  private async getWarningDetails(id: string) {
    let details: IDetailsReturnSchema | undefined = undefined;
    try {
      const result_warnings = await this.executeQuery(
        "SELECT * FROM awa.warnings WHERE warning_id = $1;",
        [id],
      );
      if (result_warnings.rows.length > 0) {
        details = this.transformWarningDetails(result_warnings.rows[0]);
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (details !== undefined) {
        return details;
      } else {
        return 204;
      }
    }
  }

  private transformEmbassyDetails(row: QueryResultRow): IEmbassyDetailsSchema {
    return {
      address: row.address === "undefined" ? undefined : row.address,
      contact: row.contact === "undefined" ? undefined : row.contact,
      emergencyphone:
        row.emergencyphone === "undefined" ? undefined : row.emergencyphone,
      phone: row.phone === "undefined" ? undefined : row.phone,
      website: row.website === "undefined" ? undefined : row.website,
      mail: row.mail === "undefined" ? undefined : row.mail,
    };
  }

  private async getEmbassyDetails(id: string) {
    let details: IEmbassyDetailsSchema | undefined = undefined;
    try {
      const result_embassys = await this.executeQuery(
        "SELECT * FROM awa.embassys WHERE embassy_id = $1;",
        [id],
      );
      if (result_embassys.rows.length > 0) {
        details = this.transformEmbassyDetails(result_embassys.rows[0]);
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
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
