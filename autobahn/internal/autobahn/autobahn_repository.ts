import { Pool } from "pg";
import { IWarningModel } from "../models/warning";
import { IReturnSchema } from "../models/return-schema";

export class AutobahnRepository {
  constructor(private db: Pool) {}

  async closeData(warningids: any) {
    const client = await this.db.connect();
    try {
      const result = await client.query(
        `Update autobahn.warnings SET loadenddate = CURRENT_TIMESTAMP WHERE warning_id NOT IN (${warningids}) AND loadenddate IS NULL`
      );
      console.log(result.rowCount + " rows updated");
    } finally {
      client.release();
      return 200;
    }
  }

  async checkData(warnings: any) {
    const values = warnings
      .map((warning: IWarningModel) => `'${warning.warning_id}'`)
      .join(",");
    const closeresult = await this.closeData(values);

    const client = await this.db.connect();
    try {
      const result = await client.query(
        `SELECT warning_id FROM autobahn.warnings WHERE warning_id IN (${values})`
      );
      result.rows.forEach((row: any) => {
        warnings = warnings.filter(
          (warning: IWarningModel) => warning.warning_id != row.warning_id
        );
      });
    } finally {
      client.release();
      console.log("New Data: " + warnings.length);
      return warnings;
    }
  }

  async fetchData(warnings: any) {
    const newwarnings = await this.checkData(warnings);

    if (newwarnings.length == 0) {
      console.log("No new data");
      return 200;
    }

    const values_warnings = newwarnings
      .map((warning: IWarningModel) => {
        const coordinatesArray =
          warning.coordinates != null
            ? warning.coordinates
                .map((coordinate: any) => `'${coordinate}'`)
                .join(",")
            : null;
        return `('${warning.warning_id}', '${warning.title}', '${warning.publisheddate}', '${warning.description}', ARRAY[${coordinatesArray}])`;
      })
      .join(",");

    const client = await this.db.connect();

    try {
      const result = await client.query(
        `INSERT INTO autobahn.warnings (warning_id, title, publisheddate, description, coordinates) VALUES ${values_warnings}`
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
        `SELECT warning_id FROM autobahn.warnings WHERE loadenddate > TO_TIMESTAMP(${timestamp}/1000)`
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
      let timestampstatement = "WHERE";
      if (timestamp) {
        timestampstatement = `WHERE loaddate > TO_TIMESTAMP(${timestamp}/1000) AND`;
      }

      const resultwarnings = await client.query(
        `SELECT * FROM autobahn.warnings ${timestampstatement} loadenddate IS NULL`
      );

      console.log(resultwarnings.rows.length + " rows selected");

      resultwarnings.rows.forEach((row: any) => {
        const warning: IReturnSchema = {
          id: row.warning_id,
          type: "street_report",
          title: row.title,
          area: row.coordinates,
          since: row.publisheddate,
          details: {
            description: row.description,
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
}
