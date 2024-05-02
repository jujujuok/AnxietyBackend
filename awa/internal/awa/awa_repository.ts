import { Pool } from "pg";
import { IWarningModel } from "../models/warning";
import { IReturnSchema } from "../models/return-schema";
import { IDetailsReturnSchema } from "../models/return-details";

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

  async closeDataForCountryWithNewWarning(warnings: IWarningModel[]) {
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

  async checkData(warnings: IWarningModel[]) {
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
      warnings = warnings.filter(
        (warning: IWarningModel) =>
          warning.ISO3 != "JPN" && warning.ISO3 != "SSD",
      );

      client.release();
      console.log("New Data: " + warnings.length);
      return warnings;
    }
  }

  async fetchData(warnings: IWarningModel[]) {
    const newwarnings = await this.checkData(warnings);

    if (newwarnings.length == 0) {
      console.log("No new data");
      return 200;
    }
    const values_warnings = newwarnings
      .map((warning) => {
        // Prüfen, ob 'aktuell' undefined ist und entsprechend behandeln
        const aktuellArray = warning.aktuell
          ? warning.aktuell.map((aktuell) => `'${aktuell}'`).join(", ")
          : "NULL";
        // Prüfen, ob 'sicherheit' undefined ist und entsprechend behandeln
        const sicherheitArray = warning.sicherheit
          ? warning.sicherheit.map((sicherheit) => `'${sicherheit}'`).join(", ")
          : "NULL";

        // Verwenden von NULL oder ARRAY, je nachdem, ob die Werte vorhanden sind oder nicht
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

  async getClosedData(timestamp: number) {
    if (!timestamp) {
      return "";
    }
  
    var warningids = [];
  
    const client = await this.db.connect();
    try {
      const result = await client.query(
        `SELECT warning_id FROM awa.warnings WHERE loadenddate > TO_TIMESTAMP(${timestamp}/1000)`,
      );
      warningids = result.rows;
      console.log(result.rows.length + " rows closed since last request");
    } finally {
      client.release();
      return warningids;
    }
  }

  async getData(timestamp: number) {
    const warnings: IReturnSchema[] = [];

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

        const warning: IReturnSchema = {
          id: row.warning_id,
          type: "travel_warning",
          severity: row.severity,
          country: row.country,
          iso3: row.iso3,
          details: {
            link: row.warning_link,
            aktuell: row.aktuell === "undefined" ? undefined : row.aktuell,
            sicherheit: row.sicherheit,
            gesundheit: row.gesundheit === "undefined" ? undefined : row.gesundheit,
          },
        };
        warnings.push(warning);
      });
    } finally {
      client.release();
      const closedWarningIds = await this.getClosedData(timestamp);
      const result = [warnings, closedWarningIds];
      return result;
    }
  }
  
  async getDetails(id: string) {
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
          gesundheit: row.gesundheit === "undefined" ? undefined : row.gesundheit,
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
}
