import { IWarningsModel } from "../models/warnings";
import { Pool, QueryResult } from "pg";
import { IReturnSchema } from "../models/return-schema";
import { IDetailsReturnSchema } from "../models/return-details";
import { IProductWarningModel } from "../models/product-warning";
import { IFoodWarningModel } from "../models/food-warning";

export class ProductWarningRepository {
  constructor(private readonly db: Pool) {}

  private async executeQuery(
    query: string,
    values: any[],
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

  private mapIds(warnings: any) {
    return warnings.map((warning: any) => warning.warning_id).join(",");
  }

  private valueCheck(value: any) {
    return value !== "" && value !== null && value !== "()" ? true : false;
  }

  private async saveWarnings(
    warnings: IProductWarningModel[] | IFoodWarningModel[],
  ) {
    const values_warnings = warnings
      .filter(
        (warning) =>
          warning.warning_type != null ||
          warning.warning_link != null ||
          warning.publishedDate != null ||
          warning.title != null ||
          warning.description != null ||
          warning.image != null,
      )
      .map(
        (warning) =>
          `(${warning.warning_id}, '${warning.warning_type}', '${warning.warning_link}', '${warning.publishedDate}', '${warning.title}', '${warning.description}', '${warning.image}')`,
      )
      .join(",");

    if (this.valueCheck(values_warnings)) {
      await this.executeQuery(
        `INSERT INTO productwarnings.warnings (warning_id, warning_type, warning_link, publishedDate, title, description, image) VALUES ${values_warnings};`,
        [],
      );
    }
  }

  private async saveProductInformations(warnings: IProductWarningModel[]) {
    const values_productInformations = warnings
      .filter(
        (warning) =>
          warning.manufacturer != null ||
          warning.category != null ||
          warning.affectedProducts != null,
      )
      .map(
        (warning) =>
          `(${warning.warning_id}, '${warning.manufacturer}', '${warning.category}', '${warning.affectedProducts}')`,
      )
      .join(",");
    if (this.valueCheck(values_productInformations)) {
      await this.executeQuery(
        `INSERT INTO productwarnings.productInformations (warning_id, manufacturer, category, affectedProducts) VALUES ${values_productInformations};`,
        [],
      );
    }
  }

  private async saveSafetyInformations(warnings: IProductWarningModel[]) {
    const values_safetyInformations = warnings
      .filter((warning) => warning.hazard != null || warning.injury != null)
      .map(
        (warning) =>
          `(${warning.warning_id}, '${warning.hazard}', '${warning.injury}')`,
      )
      .join(",");
    if (this.valueCheck(values_safetyInformations)) {
      await this.executeQuery(
        `INSERT INTO productwarnings.safetyInformations (warning_id, hazard, injury) VALUES ${values_safetyInformations};`,
        [],
      );
    }
  }

  private async saveFoodInformations(warnings: IFoodWarningModel[]) {
    const values_foodInformations = warnings
      .filter(
        (warning) =>
          warning.manufacturer != null || warning.affectedStates != null,
      )
      .map((warning) => {
        const affectedStatesArray =
          warning.affectedStates != null
            ? warning.affectedStates.map((state) => `'${state}'`).join(",")
            : null;
        return `(${warning.warning_id}, '${warning.manufacturer}', ARRAY[${affectedStatesArray}])`;
      })
      .join(",");

    if (this.valueCheck(values_foodInformations)) {
      await this.executeQuery(
        `INSERT INTO productwarnings.foodInformations (warning_id, manufacturer, affectedStates) VALUES ${values_foodInformations};`,
        [],
      );
    }
  }

  private async saveFoodwarnings(warnings: IFoodWarningModel[]) {
    await this.saveWarnings(warnings);
    await this.saveFoodInformations(warnings);
  }

  private async saveProductwarnings(warnings: IProductWarningModel[]) {
    await this.saveWarnings(warnings);
    await this.saveProductInformations(warnings);
    await this.saveSafetyInformations(warnings);
  }

  async saveAll(warnings: IWarningsModel) {
    if (warnings.products.length === 0 && warnings.foods.length === 0) {
      return;
    }

    try {
      await this.saveProductwarnings(warnings.products);
      await this.saveFoodwarnings(warnings.foods);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return 200;
    }
  }

  private filterNewWarnings(
    warnings: IProductWarningModel[] | IFoodWarningModel[],
    warningId: number,
  ) {
    return warnings.filter(
      (warning: IProductWarningModel | IFoodWarningModel) =>
        warning.warning_id != warningId,
    );
  }

  async saveUpdate(warnings: IWarningsModel) {
    if (warnings.products.length === 0 && warnings.foods.length === 0) {
      return;
    }

    try {
      const values_warningids_products = this.mapIds(warnings.products);
      const values_warningids_foods = this.mapIds(warnings.foods);

      const values_warningids = [
        values_warningids_products,
        values_warningids_foods,
      ].join(",");
      const result = await this.executeQuery(
        `SELECT warning_id FROM productwarnings.warnings WHERE warning_id in (${values_warningids});`,
        [],
      );
      result.rows.forEach((row: any) => {
        warnings.products = this.filterNewWarnings(
          warnings.products,
          row.warning_id,
        ) as IProductWarningModel[];
        warnings.foods = this.filterNewWarnings(
          warnings.foods,
          row.warning_id,
        ) as IFoodWarningModel[];
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return this.saveAll(warnings);
    }
  }

  private transformWarning(
    row: any,
    result_productInformations: QueryResult,
    result_safetyInformations: QueryResult,
    result_foodInformations: QueryResult,
  ): IReturnSchema {
    const details: IDetailsReturnSchema = {
      description:
        row.description === "null" ? undefined : row.description ?? undefined,
      link: row.warning_link ?? undefined,
      manufacturer: undefined,
      category: undefined,
      hazard: undefined,
      injury: undefined,
      affectedProducts: undefined,
      image: row.image === "undefined" ? undefined : row.image ?? undefined,
    };

    let area: string[] | undefined = undefined;

    if (row.warning_type === "p") {
      const productInformation = result_productInformations.rows.find(
        (row2: any) => row2.warning_id === row.warning_id,
      );
      if (productInformation) {
        details.manufacturer = productInformation.manufacturer;
        details.category = productInformation.category;
      }

      const safetyInformation = result_safetyInformations.rows.find(
        (row2: any) => row2.warning_id === row.warning_id,
      );
      if (safetyInformation) {
        details.hazard = safetyInformation.hazard;
        details.injury = safetyInformation.injury;
      }

      details.affectedProducts =
        productInformation?.affectedproducts === "null" ||
        productInformation?.affectedproducts === "Nicht bekannt"
          ? undefined
          : productInformation?.affectedproducts;
    } else if (row.warning_type === "f") {
      const foodInformation = result_foodInformations.rows.find(
        (row2: any) => row2.warning_id === row.warning_id,
      );
      if (foodInformation) {
        details.manufacturer = foodInformation.manufacturer;
        area = foodInformation.affectedstates;
      }
    }

    const warning: IReturnSchema = {
      id: row.warning_id,
      type: row.warning_type === "p" ? "product_warning" : "food_warning",
      title: row.title ?? undefined,
      area: row.warning_type === "f" ? area : undefined,
      publishedDate: row.publisheddate ?? undefined,
      details,
    };
    return warning;
  }

  async getData(timestamp: number) {
    const warnings: IReturnSchema[] = [];

    try {
      const timestampStatement = timestamp
        ? `WHERE loaddate > TO_TIMESTAMP(${timestamp}/1000)`
        : "";
      const resultwarnings = await this.executeQuery(
        `SELECT * FROM productwarnings.warnings ${timestampStatement}`,
        [],
      );

      const values_warningids = this.mapIds(resultwarnings.rows);

      const result_productInformations = await this.executeQuery(
        `SELECT * FROM productwarnings.productInformations WHERE warning_id in (${values_warningids});`,
        [],
      );
      const result_safetyInformations = await this.executeQuery(
        `SELECT * FROM productwarnings.safetyInformations WHERE warning_id in (${values_warningids});`,
        [],
      );
      const result_foodInformations = await this.executeQuery(
        `SELECT * FROM productwarnings.foodInformations WHERE warning_id in (${values_warningids});`,
        [],
      );
      resultwarnings.rows.forEach((row: any) => {
        const warning = this.transformWarning(
          row,
          result_productInformations,
          result_safetyInformations,
          result_foodInformations,
        );
        warnings.push(warning);
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      return warnings;
    }
  }

  async getDetails(id: number) {
    let details: IDetailsReturnSchema | undefined = undefined;
    try {
      const result_warnings = await this.executeQuery(
        "SELECT * FROM productwarnings.warnings WHERE warning_id = $1;",
        [id],
      );
      const detailsAll = {
        description:
          result_warnings.rows[0].description === "null"
            ? undefined
            : result_warnings.rows[0].description ?? undefined,
        link: result_warnings.rows[0].warning_link ?? undefined,
      };

      if (result_warnings.rows[0].warning_type === "p") {
        const result_productInformations = await this.executeQuery(
          "SELECT * FROM productwarnings.productInformations WHERE warning_id = $1;",
          [id],
        );
        const result_safetyInformations = await this.executeQuery(
          "SELECT * FROM productwarnings.safetyInformations WHERE warning_id = $1;",
          [id],
        );
        details = {
          ...detailsAll,
          manufacturer:
            result_productInformations.rows[0].manufacturer ?? undefined,
          category: result_productInformations.rows[0].category ?? undefined,
          hazard: result_safetyInformations.rows[0]
            ? result_safetyInformations.rows[0].hazard
            : undefined,
          injury: result_safetyInformations.rows[0]
            ? result_safetyInformations.rows[0].injury
            : undefined,
          affectedProducts:
            result_productInformations.rows[0].affectedproducts === "null" ||
            result_productInformations.rows[0].affectedproducts ===
              "Nicht bekannt"
              ? undefined
              : result_productInformations.rows[0].affectedproducts ??
                undefined,
          image:
            result_productInformations.rows[0].image == "undefined"
              ? undefined
              : result_productInformations.rows[0].image ?? undefined,
        };
      } else if (result_warnings.rows[0].warning_type === "f") {
        const result_foodInformations = await this.executeQuery(
          "SELECT * FROM productwarnings.foodInformations WHERE warning_id = $1;",
          [id],
        );
        details = {
          ...detailsAll,
          manufacturer:
            result_foodInformations.rows[0].manufacturer ?? undefined,
          category: undefined,
          hazard: undefined,
          injury: undefined,
          affectedProducts: undefined,
          image:
            result_foodInformations.rows[0].image == "undefined"
              ? undefined
              : result_foodInformations.rows[0].image ?? undefined,
        };
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
