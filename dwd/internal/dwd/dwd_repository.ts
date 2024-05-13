import { Pool } from "pg";
import { IWarningModel } from "../models/warning";
import { IReturnSchema } from "../models/return-schema";
import { IDetailsReturnSchema } from "../models/return-details";

export class DwDRepository {
  constructor(private readonly db: Pool) {}

  async closeData(warningids: any) {
    var whereStatement = `WHERE warning_id NOT IN (${warningids}) AND loadenddate IS NULL`;

    if (warningids == "") {
      whereStatement = `WHERE loadenddate IS NULL`;
    }

    const client = await this.db.connect();
    try {
      const result = await client.query(
        `Update dwd.warnings SET loadenddate = CURRENT_TIMESTAMP ${whereStatement}`,
      );
      console.log(result.rowCount + " rows updated");
    } finally {
      client.release();
      return 200;
    }
  }

  async checkData(warnings: any) {
    const values = warnings
      .map((warning: IWarningModel) => `'${warning.id}'`)
      .join(",");
    const closeresult = await this.closeData(values);

    if (values == ""){
      console.log("New Data: 0");
      return warnings;
    }

    const client = await this.db.connect();
    try {
      const result = await client.query(
        `SELECT warning_id FROM dwd.warnings WHERE warning_id IN (${values})`,
      );
      result.rows.forEach((row: any) => {
        warnings = warnings.filter(
          (warning: IWarningModel) => warning.id != row.warning_id,
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
        const geojson = {
          type: "Polygon",
          coordinates: warning.coordinates,
        };

        const coordinates = `ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(
          geojson,
        )}'), 4326)`;
        return `('${warning.id}', '${warning.type}', '${warning.title}', '${warning.description}', '${warning.instruction}', ${coordinates})`;
      })
      .join(",");
    const client = await this.db.connect();

    try {
      const result = await client.query(
        `INSERT INTO dwd.warnings (warning_id, warning_type, title, description, instruction, coordinates) VALUES ${values_warnings}`,
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
        `SELECT warning_id FROM dwd.warnings WHERE loadenddate > TO_TIMESTAMP(${timestamp}/1000)`,
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
        `SELECT warning_id, warning_type, title, description, instruction, ST_AsGeoJSON(coordinates) AS coordinates FROM dwd.warnings ${timestampstatement} loadenddate IS NULL`,
      );

      console.log(resultwarnings.rows.length + " rows selected");

      resultwarnings.rows.forEach((row: any) => {
        const coordinates = JSON.parse(row.coordinates).coordinates;

        const warning: IReturnSchema = {
          id: row.warning_id,
          type: "weather",
          warning: row.warning_type,
          title: row.title,
          area: coordinates,
          details: {
            description: row.description,
            instruction: row.instruction,
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
        "SELECT * FROM dwd.warnings WHERE warning_id = $1;",
        [id],
      );
      console.log("Details selected");
      if (result_warnings.rows.length > 0) {
        const row = result_warnings.rows[0];
        details = {
          description: row.description === "null" ? undefined : row.description,
          instruction: row.instruction === "null" ? undefined : row.instruction,
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
