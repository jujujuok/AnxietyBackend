import { Pool, QueryResult, QueryResultRow } from "pg";
import { IWarningModel } from "../models/warning";
import { IReturnSchema } from "../models/return-schema";
import { IDetailsReturnSchema } from "../models/return-details";

export class NinaRepository {
  constructor(private db: Pool) {}

  private async executeQuery(
    query: string,
    values: unknown[],
  ): Promise<QueryResult> {
    const client = await this.db.connect();
    try {
      return await client.query(query, values);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      client.release();
    }
  }

  private async closeData(warningids: string[]): Promise<number> {
    try {
      await this.executeQuery(
        `Update nina.warnings SET loadenddate = CURRENT_TIMESTAMP WHERE warning_id != ANY($1) AND loadenddate IS NULL`,
        [warningids],
      );
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return 200;
    }
  }

  private mapIds(warnings: IWarningModel[]): string[] {
    return warnings.map((warning: IWarningModel) => warning.id);
  }

  private filterNewData(
    result: QueryResultRow[],
    warnings: IWarningModel[],
  ): IWarningModel[] {
    result.forEach((row: QueryResultRow) => {
      warnings = warnings.filter(
        (warning: IWarningModel) => warning.id != row.warning_id,
      );
    });
    return warnings;
  }

  private async checkData(warnings: IWarningModel[]) {
    const values = this.mapIds(warnings);
    await this.closeData(values);

    if (values.length == 0) {
      return [];
    }

    try {
      const result = await this.executeQuery(
        `SELECT warning_id FROM nina.warnings WHERE warning_id ANY($1)`,
        [values],
      );
      warnings = this.filterNewData(result.rows, warnings);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return warnings;
    }
  }

  private transformCoordinates(inputCoordinates: string[]): string {
    const geojson = {
      type: "Polygon",
      coordinates: inputCoordinates,
    };

    return JSON.stringify(geojson);
  }

  async fetchData(warnings: IWarningModel[]) {
    const newwarnings = await this.checkData(warnings);

    if (newwarnings.length == 0) {
      return 200;
    }

    try {
      for (const warning of newwarnings) {
        const coordinates = this.transformCoordinates(warning.coordinates);
        await this.executeQuery(
          `INSERT INTO nina.warnings (warning_id, warning_type, title, description, instruction, coordinates) VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_GeomFromGeoJSON('${coordinates}'), 4326))`,
          [
            warning.id,
            warning.type,
            warning.title,
            warning.description,
            warning.instruction,
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

  private async getClosedData(timestamp: number) {
    if (!timestamp) {
      return [];
    }

    let warningids = [];

    try {
      const result = await this.executeQuery(
        `SELECT warning_id FROM nina.warnings WHERE loadenddate > TO_TIMESTAMP($1/1000)`,
        [timestamp],
      );
      warningids = result.rows;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return warningids;
    }
  }

  private transformWarning(row: QueryResultRow): IReturnSchema {
    const coordinates = JSON.parse(row.coordinates).coordinates;

    return {
      id: row.warning_id,
      type: row.warning_type,
      warning: row.warning_type,
      title: row.title,
      area: coordinates,
      details: {
        description: row.description === "null" ? undefined : row.description,
        instruction: row.instruction === "null" ? undefined : row.instruction,
      },
    };
  }

  async getData(timestamp: number) {
    const warnings: IReturnSchema[] = [];
    let closedWarningIds: string[] = [];
    try {
      let timestampstatement = "WHERE";
      if (timestamp) {
        timestampstatement = `WHERE loaddate > TO_TIMESTAMP(${timestamp}/1000) AND`;
      }

      const resultwarnings = await this.executeQuery(
        `SELECT warning_id, warning_type, title, ST_AsGeoJSON(coordinates) AS coordinates, description, instruction FROM nina.warnings ${timestampstatement} loadenddate IS NULL`,
        [],
      );

      resultwarnings.rows.forEach((row: QueryResultRow) => {
        const warning = this.transformWarning(row);
        warnings.push(warning);
      });

      closedWarningIds = await this.getClosedData(timestamp);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return [warnings, closedWarningIds];
    }
  }

  private transformDetails(row: QueryResultRow): IDetailsReturnSchema {
    return {
      description: row.description === "null" ? undefined : row.description,
      instruction: row.instruction === "null" ? undefined : row.instruction,
    };
  }

  async getDetails(id: string) {
    let details: IDetailsReturnSchema | undefined = undefined;
    try {
      const result_warnings = await this.executeQuery(
        "SELECT * FROM nina.warnings WHERE warning_id = $1;",
        [id],
      );
      if (result_warnings.rows.length > 0) {
        details = this.transformDetails(result_warnings.rows[0]);
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
}
