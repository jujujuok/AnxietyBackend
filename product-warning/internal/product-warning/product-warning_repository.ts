import { IWarningsModel } from "../models/warnings";
import { Pool } from 'pg';

export class ProductWarningRepository {
  async saveAll(warnings: IWarningsModel) {

    if (warnings.products.length === 0 && warnings.foods.length === 0) {
      return;
    }

    const pool = new Pool({
      user: 'username_db',
      host: 'ip_db',
      database: 'name_db',
      password: 'password_db',
    });
    
    const client = await pool.connect();
    try {
      const values_warningsproduct = warnings.products.filter(warning => ((warning.warning_type != null) || (warning.warning_link != null) || (warning.publishedDate != null) || (warning.title != null) || (warning.description != null))).map(warning => `(${warning.warning_id}, '${warning.warning_type}', '${warning.warning_link}', '${warning.publishedDate}', '${warning.title}', '${warning.description}')`).join(',');
      const result_warningsproduct = await client.query(
        `INSERT INTO productwarnings.warnings (warning_id, warning_type, warning_link, publishedDate, title, description) VALUES ${values_warningsproduct};`
      );
      console.log(result_warningsproduct.rowCount + ' rows inserted (warningsproduct)');

      const values_productInformations = warnings.products.filter(warning => ((warning.designation != null) || (warning.manufacturer != null) || (warning.category != null) || (warning.affectedProducts != null))).map(warning => `(${warning.warning_id}, '${warning.designation}', '${warning.manufacturer}', '${warning.category}', '${warning.affectedProducts}')`).join(',');
      const result_productInformations = await client.query(
        `INSERT INTO productwarnings.productInformations (warning_id, designation, manufacturer, category, affectedProducts) VALUES ${values_productInformations};`
      );
      console.log(result_productInformations.rowCount + ' rows inserted (productInformations)');

      const values_safetyInformations = warnings.products.filter(warning => ((warning.hazard != null) || (warning.injury != null))).map(warning => `(${warning.warning_id}, '${warning.hazard}', '${warning.injury}')`).join(',');
      const result_safetyInformations = await client.query(
        `INSERT INTO productwarnings.safetyInformations (warning_id, hazard, injury) VALUES ${values_safetyInformations};`
      );
      console.log(result_safetyInformations.rowCount + ' rows inserted (safetyInformations)');

      const values_warningsfood = warnings.foods.filter(warning => ((warning.warning_type != null) || (warning.warning_link != null) || (warning.publishedDate != null) || (warning.title != null) || (warning.description != null))).map(warning => `(${warning.warning_id}, '${warning.warning_type}', '${warning.warning_link}', '${warning.publishedDate}', '${warning.title}', '${warning.description}')`).join(',');
      const result_warningsfood = await client.query(
        `INSERT INTO productwarnings.warnings (warning_id, warning_type, warning_link, publishedDate, title, description) VALUES ${values_warningsfood};`
      );
      console.log(result_warningsfood.rowCount + ' rows inserted (warningsfood)');

      const values_foodInformations = warnings.foods.filter(warning => warning.manufacturer != null || warning.affectedStates != null).map(warning => {
        const affectedStatesArray = warning.affectedStates != null ? (warning.affectedStates.map(state => `'${state}'`).join(',')) : null;
        return `(${warning.warning_id}, '${warning.manufacturer}', ARRAY[${affectedStatesArray}])`;
      }).join(',');
      const result_foodInformations = await client.query(
        `INSERT INTO productwarnings.foodInformations (warning_id, manufacturer, affectedStates) VALUES ${values_foodInformations};`
      );
      console.log(result_foodInformations.rowCount + ' rows inserted (foodInformations)');
    } finally {
    client.release();
    }
  }

  async saveUpdate(warnings: IWarningsModel) {

    if (warnings.products.length === 0 && warnings.foods.length === 0) {
      return;
    }

    const pool = new Pool({
      user: 'username_db',
      host: 'ip_db',
      database: 'name_db',
      password: 'password_db',
    });

    const client = await pool.connect();
    try{
      const values_warningids_products = warnings.products.map(warning => warning.warning_id).join(',');
      const values_warningids_foods = warnings.foods.map(warning => warning.warning_id).join(',');
      const values_warningids = values_warningids_products + ',' + values_warningids_foods;
      const result = await client.query(`SELECT warning_id FROM productwarnings.warnings WHERE warning_id in (${values_warningids});`);
      result.rows.forEach((row: any) => {
        warnings.products = warnings.products.filter(warning => warning.warning_id != row.warning_id);
        warnings.foods = warnings.foods.filter(warning => warning.warning_id != row.warning_id);
      });
    }finally{
      client.release();
      this.saveAll(warnings);
    }
  }
}
