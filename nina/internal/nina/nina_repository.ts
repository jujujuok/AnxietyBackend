import { Pool } from "pg";
import { IWarningModel } from "../models/warning";
import { IReturnSchema } from "../models/return-schema";
import { IDetailsReturnSchema } from "../models/return-details";

export class NinaRepository {
  constructor(private db: Pool) {}

  async closeData(warningids: any) {
    const client = await this.db.connect();
    try {
      const result = await client.query(
        `Update nina.warnings SET loadenddate = CURRENT_TIMESTAMP WHERE warning_id NOT IN (${warningids}) AND loadenddate IS NULL`,
      );
      console.log(result.rowCount + " rows updated");
    } finally {
      client.release();
      return 200;
    }
  }

  async checkData(warnings: any) {
    const values = warnings
      .map((warning: any) =>
        warning.map((warning: IWarningModel) => `'${warning.id}'`).join(","),
      )
      .filter((part: string) => part.trim().length > 0)
      .join(",");
    const closeresult = await this.closeData(values);

    const client = await this.db.connect();
    try {
      const result = await client.query(
        `SELECT warning_id FROM nina.warnings WHERE warning_id IN (${values})`,
      );
      result.rows.forEach((row: any) => {
        warnings[0] = warnings[0].filter(
          (warning: IWarningModel) => warning.id != row.warning_id,
        );
        warnings[1] = warnings[1].filter(
          (warning: IWarningModel) => warning.id != row.warning_id,
        );
        warnings[2] = warnings[2].filter(
          (warning: IWarningModel) => warning.id != row.warning_id,
        );
        warnings[3] = warnings[3].filter(
          (warning: IWarningModel) => warning.id != row.warning_id,
        );
        warnings[4] = warnings[4].filter(
          (warning: IWarningModel) => warning.id != row.warning_id,
        );
      });
    } finally {
      client.release();
      console.log(
        "New Data: " +
          (warnings[0].length +
            warnings[1].length +
            warnings[2].length +
            warnings[3].length +
            warnings[4].length),
      );
      return warnings;
    }
  }

  async fetchData(warnings: any) {
    const newwarnings = await this.checkData(warnings);

    if (
      newwarnings[0].length == 0 &&
      newwarnings[1].length == 0 &&
      newwarnings[2].length == 0 &&
      newwarnings[3].length == 0 &&
      newwarnings[4].length == 0
    ) {
      console.log("No new data");
      return 200;
    }

    const values_warnings = newwarnings
      .map((part: any) =>
        part
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
          .join(","),
      )
      .filter((part: string) => part.trim().length > 0)
      .join(",");

    const client = await this.db.connect();

    try {
      const result = await client.query(
        `INSERT INTO nina.warnings (warning_id, warning_type, title, description, instruction, coordinates) VALUES ${values_warnings}`,
      );
      console.log(result.rowCount + " rows inserted");
    } finally {
      client.release();
      return 200;
    }
  }

  async getClosedData(timestamp: number) {
    if (!timestamp) {
      return [];
    }

    var warningids = [];

    const client = await this.db.connect();
    try {
      const result = await client.query(
        `SELECT warning_id FROM nina.warnings WHERE loadenddate > TO_TIMESTAMP(${timestamp}/1000)`,
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
        `SELECT warning_id, warning_type, title, ST_AsGeoJSON(coordinates) AS coordinates, description, instruction FROM nina.warnings ${timestampstatement} loadenddate IS NULL`,
      );

      console.log(resultwarnings.rows.length + " rows selected");

      resultwarnings.rows.forEach((row: any) => {
        const coordinates = JSON.parse(row.coordinates).coordinates;

        const warning: IReturnSchema = {
          id: row.warning_id,
          type: "nina",
          warning: row.warning_type,
          title: row.title,
          area: coordinates,
          details: {
            description:
              row.description === "null" ? undefined : row.description,
            instruction:
              row.instruction === "null" ? undefined : row.instruction,
          },
        };
        warnings.push(warning);
      });
    } finally {
      client.release();
      const closedWarningIds = await this.getClosedData(timestamp);
      if (closedWarningIds.length == 0) {
        return [warnings];
      }
      return [warnings, closedWarningIds];
    }
  }

  async getDetails(id: string) {
    const client = await this.db.connect();
    let details: IDetailsReturnSchema | undefined = undefined;
    try {
      const result_warnings = await client.query(
        "SELECT * FROM nina.warnings WHERE warning_id = $1;",
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
