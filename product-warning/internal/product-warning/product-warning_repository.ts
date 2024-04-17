import { IWarningsModel } from "../models/warnings";
import { Pool } from "pg";
import { IReturnSchema } from "../models/return-schema";
import { IDetailsReturnSchema } from "../models/return-details";

export class ProductWarningRepository {
  constructor(private readonly db: Pool) {}

  async saveAll(warnings: IWarningsModel) {
    if (warnings.products.length === 0 && warnings.foods.length === 0) {
      console.log("No warnings to save");
      return;
    }

    const client = await this.db.connect();
    try {
      const values_warningsproduct = warnings.products
        .filter(
          (warning) =>
            warning.warning_type != null ||
            warning.warning_link != null ||
            warning.publishedDate != null ||
            warning.title != null ||
            warning.description != null
        )
        .map(
          (warning) =>
            `(${warning.warning_id}, '${warning.warning_type}', '${warning.warning_link}', '${warning.publishedDate}', '${warning.title}', '${warning.description}', '${warning.image}')`
        )
        .join(",");
        
      if (
        values_warningsproduct !== "" &&
        values_warningsproduct !== null &&
        values_warningsproduct !== "()"
      ) {
        const result_warningsproduct = await client.query(
          `INSERT INTO productwarnings.warnings (warning_id, warning_type, warning_link, publishedDate, title, description, image) VALUES ${values_warningsproduct};`
        );
        console.log(
          result_warningsproduct.rowCount + " rows inserted (warningsproduct)"
        );
      }

      const values_productInformations = warnings.products
        .filter(
          (warning) =>
            warning.manufacturer != null ||
            warning.category != null ||
            warning.affectedProducts != null
        )
        .map(
          (warning) =>
            `(${warning.warning_id}, '${warning.manufacturer}', '${warning.category}', '${warning.affectedProducts}')`
        )
        .join(",");
      if (
        values_productInformations !== "" &&
        values_productInformations !== null &&
        values_productInformations !== "()"
      ) {
        const result_productInformations = await client.query(
          `INSERT INTO productwarnings.productInformations (warning_id, manufacturer, category, affectedProducts) VALUES ${values_productInformations};`
        );
        console.log(
          result_productInformations.rowCount +
            " rows inserted (productInformations)"
        );
      }
      const values_safetyInformations = warnings.products
        .filter((warning) => warning.hazard != null || warning.injury != null)
        .map(
          (warning) =>
            `(${warning.warning_id}, '${warning.hazard}', '${warning.injury}')`
        )
        .join(",");

      if (
        values_safetyInformations !== "" &&
        values_safetyInformations !== null &&
        values_safetyInformations !== "()"
      ) {
        const result_safetyInformations = await client.query(
          `INSERT INTO productwarnings.safetyInformations (warning_id, hazard, injury) VALUES ${values_safetyInformations};`
        );
        console.log(
          result_safetyInformations.rowCount +
            " rows inserted (safetyInformations)"
        );
      }
      const values_warningsfood = warnings.foods
        .filter(
          (warning) =>
            warning.warning_type != null ||
            warning.warning_link != null ||
            warning.publishedDate != null ||
            warning.title != null ||
            warning.description != null
        )
        .map(
          (warning) =>
            `(${warning.warning_id}, '${warning.warning_type}', '${warning.warning_link}', '${warning.publishedDate}', '${warning.title}', '${warning.description}', '${warning.image}')`
        )
        .join(",");

      if (
        values_warningsfood !== "" &&
        values_warningsfood !== null &&
        values_warningsfood !== "()"
      ) {
        const result_warningsfood = await client.query(
          `INSERT INTO productwarnings.warnings (warning_id, warning_type, warning_link, publishedDate, title, description, image) VALUES ${values_warningsfood};`
        );
        console.log(
          result_warningsfood.rowCount + " rows inserted (warningsfood)"
        );
      }

      const values_foodInformations = warnings.foods
        .filter(
          (warning) =>
            warning.manufacturer != null || warning.affectedStates != null
        )
        .map((warning) => {
          const affectedStatesArray =
            warning.affectedStates != null
              ? warning.affectedStates.map((state) => `'${state}'`).join(",")
              : null;
          return `(${warning.warning_id}, '${warning.manufacturer}', ARRAY[${affectedStatesArray}])`;
        })
        .join(",");

      if (
        values_foodInformations !== "" &&
        values_foodInformations !== null &&
        values_foodInformations !== "()"
      ) {
        const result_foodInformations = await client.query(
          `INSERT INTO productwarnings.foodInformations (warning_id, manufacturer, affectedStates) VALUES ${values_foodInformations};`
        );
        console.log(
          result_foodInformations.rowCount + " rows inserted (foodInformations)"
        );
      }
    } finally {
      client.release();
      return 200;
    }
  }

  async saveUpdate(warnings: IWarningsModel) {
    if (warnings.products.length === 0 && warnings.foods.length === 0) {
      return;
    }

    const client = await this.db.connect();
    try {
      const values_warningids_products = warnings.products
        .map((warning) => warning.warning_id)
        .join(",");
      const values_warningids_foods = warnings.foods
        .map((warning) => warning.warning_id)
        .join(",");
      const values_warningids =
        values_warningids_products + "," + values_warningids_foods;
      const result = await client.query(
        `SELECT warning_id FROM productwarnings.warnings WHERE warning_id in (${values_warningids});`
      );
      result.rows.forEach((row: any) => {
        warnings.products = warnings.products.filter(
          (warning) => warning.warning_id != row.warning_id
        );
        warnings.foods = warnings.foods.filter(
          (warning) => warning.warning_id != row.warning_id
        );
      });
    } finally {
      client.release();
      return this.saveAll(warnings);
    }
  }

  async getData(timestamp: number) {
    const warnings: IReturnSchema[] = [];

    const client = await this.db.connect();
    try {
      var timestampstatement = "";
      if (timestamp) {
        timestampstatement = `WHERE loaddate > TO_TIMESTAMP(${timestamp}/1000);`;
      }
      const resultwarnings = await client.query(
        `SELECT * FROM productwarnings.warnings ${timestampstatement}`
      );

      const values_warningids = resultwarnings.rows
        .map((row) => row.warning_id)
        .join(",");

      const result_productInformations = await client.query(
        `SELECT * FROM productwarnings.productInformations WHERE warning_id in (${values_warningids});`
      );
      const result_safetyInformations = await client.query(
        `SELECT * FROM productwarnings.safetyInformations WHERE warning_id in (${values_warningids});`
      );
      const result_foodInformations = await client.query(
        `SELECT * FROM productwarnings.foodInformations WHERE warning_id in (${values_warningids});`
      );
      resultwarnings.rows.forEach((row: any) => {
        if (row.warning_id) {
          if (row.warning_type === "p") {
            const productWarning: IReturnSchema = {
              id: row.warning_id,
              type: "product_warning",
              title: row.title ?? undefined,
              description: row.description === "null" ? undefined : row.description ?? undefined,
              area: undefined,
              details: {
                link: row.warning_link ?? undefined,
                manufacturer:
                  result_productInformations.rows.find(
                    (row2: any) => row2.warning_id === row.warning_id
                  )?.manufacturer ?? undefined,
                category:
                  result_productInformations.rows.find(
                    (row2: any) => row2.warning_id === row.warning_id
                  )?.category ?? undefined,
                hazard:
                  result_safetyInformations.rows.find(
                    (row2: any) => row2.warning_id === row.warning_id
                  )?.hazard ?? undefined,
                injury:
                  result_safetyInformations.rows.find(
                    (row2: any) => row2.warning_id === row.warning_id
                  )?.injury ?? undefined,
                affectedProducts: result_productInformations.rows.find((row2: any) => row2.warning_id === row.warning_id)?.affectedproducts === "null" || result_productInformations.rows.find((row2: any) => row2.warning_id === row.warning_id)?.affectedproducts === "Nicht bekannt" ? undefined : result_productInformations.rows.find((row2: any) => row2.warning_id === row.warning_id)?.affectedproducts ?? undefined,
                image: row.image == "undefined" ? undefined : row.image ?? undefined,
              },
            };
            warnings.push(productWarning);
          } else if (row.warning_type === "f") {
            const foodWarning: IReturnSchema = {
              id: row.warning_id,
              type: "food_warning",
              title: row.title ?? undefined,
              description: row.description === "null" ? undefined : row.description ?? undefined,
              area:
                  result_foodInformations.rows.find(
                    (row2: any) => row2.warning_id === row.warning_id
                  )?.affectedstates ?? undefined,
              details: {
                link: row.warning_link ?? undefined,
                manufacturer:
                  result_foodInformations.rows.find(
                    (row2: any) => row2.warning_id === row.warning_id
                  )?.manufacturer ?? undefined,
                category: undefined,
                hazard: undefined,
                injury: undefined,
                affectedProducts: undefined,
                image: row.image == "undefined" ? undefined : row.image ?? undefined,
              },
            };
            warnings.push(foodWarning);
          }
        }
      });
    } finally {
      client.release();
      return warnings;
    }
  }

  async getDetails(id: number) {
    const client = await this.db.connect();
    let details: IDetailsReturnSchema | undefined = undefined;
    try{
      const result_warnings = await client.query('SELECT * FROM productwarnings.warnings WHERE warning_id = $1;', [id]);
      console.log("Details selected");
      if(result_warnings.rows[0].warning_type === "p"){
        const result_productInformations = await client.query('SELECT * FROM productwarnings.productInformations WHERE warning_id = $1;', [id]);
        const result_safetyInformations = await client.query('SELECT * FROM productwarnings.safetyInformations WHERE warning_id = $1;', [id]);
        console.log("Productdetails selected");
        details = {
          link: result_warnings.rows[0].warning_link,
          manufacturer: result_productInformations.rows[0].manufacturer,
          category: result_productInformations.rows[0].category,
          hazard: result_safetyInformations.rows[0].hazard,
          injury: result_safetyInformations.rows[0].injury,
          affectedProducts: result_productInformations.rows[0].affectedProducts,
          image: result_warnings.rows[0].image,
        }
      }else if(result_warnings.rows[0].warning_type === "f"){
        const result_foodInformations = await client.query('SELECT * FROM productwarnings.foodInformations WHERE warning_id = $1;', [id]);
        console.log("Fooddetails selected");
        details = {
          link: result_warnings.rows[0].warning_link,
          manufacturer: result_foodInformations.rows[0].manufacturer,
          category: undefined,
          hazard: undefined,
          injury: undefined,
          affectedProducts: undefined,
          image: result_warnings.rows[0].image,
        }
      }
    }finally{
      client.release();
      if (details !== undefined) {
        return details;
      } else {
        return 204;
      }
    }
  }
}