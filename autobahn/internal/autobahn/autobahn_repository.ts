import { Pool, QueryResult, QueryResultRow } from "pg";
import { IWarningModel } from "../models/warning";
import { IReturnSchema } from "../models/return-schema";
import { IDetailsReturnSchema } from "../models/return-details";

export class AutobahnRepository {
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

  private mapIds(warnings: IWarningModel[]): string[] {
    return warnings.map((warning: IWarningModel) => warning.warning_id);
  }

  async closeData(warningids: string[]): Promise<number> {
    try {
      let SQL = `Update autobahn.warnings SET loadenddate = CURRENT_TIMESTAMP WHERE warning_id NOT IN ${warningids} AND loadenddate IS NULL`;

      if (warningids.length == 0) {
        SQL = `Update autobahn.warnings SET loadenddate = CURRENT_TIMESTAMP WHERE loadenddate IS NULL`;
      }

      await this.executeQuery(SQL, []);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return 200;
    }
  }

  private filterNewData(
    result: QueryResultRow[],
    warnings: IWarningModel[],
  ): IWarningModel[] {
    result.forEach((row: QueryResultRow) => {
      warnings = warnings.filter(
        (warning: IWarningModel) => warning.warning_id != row.warning_id,
      );
    });
    return warnings;
  }

  async checkData(warnings: IWarningModel[]): Promise<IWarningModel[]> {
    try {
      const values = this.mapIds(warnings);
      await this.closeData(values);

      if (values.length == 0) {
        return [];
      }

      const result = await this.executeQuery(
        `SELECT warning_id FROM autobahn.warnings WHERE warning_id = ANY ($1)`,
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

  async fetchData(warnings: IWarningModel[]): Promise<number> {
    const newwarnings = await this.checkData(warnings);

    if (newwarnings.length == 0) {
      return 200;
    }

    try {
      for (const warning of newwarnings) {
        const coordinates = this.transformCoordinates(warning.coordinates);
        await this.executeQuery(
          `INSERT INTO autobahn.warnings (warning_id, title, publisheddate, description, coordinates) VALUES ($1, $2, $3, $4, ST_SetSRID(ST_GeomFromGeoJSON('${coordinates}'), 4326))`,
          [
            warning.warning_id,
            warning.title,
            warning.publisheddate,
            warning.description,
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

  async getClosedData(timestamp: number): Promise<string[]> {
    if (!timestamp) {
      return [];
    }

    let warningids = [];

    try {
      const result = await this.executeQuery(
        `SELECT warning_id FROM autobahn.warnings WHERE loadenddate > TO_TIMESTAMP($1/1000)`,
        [timestamp],
      );
      warningids = result.rows;
    } finally {
      return warningids;
    }
  }

  private transformWarning(row: QueryResultRow): IReturnSchema {
    const coordinates = JSON.parse(row.coordinates).coordinates;

    const warning: IReturnSchema = {
      id: row.warning_id,
      type: "street_report",
      warning: "Autobahnwarnung",
      title: row.title,
      area: coordinates,
      details: {
        description: row.description,
      },
    };

    return warning;
  }

  async getData(timestamp: number): Promise<[IReturnSchema[], string[]]> {
    const warnings: IReturnSchema[] = [];
    let closedWarningIds: string[] = [];
    try {
      const timestampStatement = timestamp
        ? `WHERE loaddate > TO_TIMESTAMP(${timestamp}/1000) AND`
        : "WHERE";

      const resultwarnings = await this.executeQuery(
        `SELECT warning_id, title, description, ST_AsGeoJSON(coordinates) AS coordinates FROM autobahn.warnings ${timestampStatement} loadenddate IS NULL`,
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
    const details: IDetailsReturnSchema = {
      description: row.description,
    };

    return details;
  }

  async getDetails(id: string): Promise<IDetailsReturnSchema | number> {
    let details: IDetailsReturnSchema | undefined = undefined;
    try {
      const result_warnings = await this.executeQuery(
        "SELECT * FROM autobahn.warnings WHERE warning_id = $1;",
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
