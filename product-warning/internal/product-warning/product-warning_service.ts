import { ITypeModel } from "../models/type";
import { IProductWarningModel } from "../models/product-warning";
import { IFoodWarningModel } from "../models/food-warning";
import { IWarningsModel } from "../models/warnings";
import { ProductWarningRepository } from "./product-warning_repository";
import axios from 'axios';
import { time } from "console";


export class ProductWarningService {
  constructor(private readonly productWarningRepository: ProductWarningRepository) {}

  async callApi(body: object) {
    const url = 'https://megov.bayern.de/verbraucherschutz/baystmuv-verbraucherinfo/rest/api/warnings/merged';
    const headers = {
      'accept': 'application/json',
      'Authorization': 'baystmuv-vi-1.0 os=ios, key=9d9e8972-ff15-4943-8fea-117b5a973c61',
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(url, body, { headers });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  getWarnings(data: any){
    var warnings: IWarningsModel = { foods: [], products: [] };
    data.response.docs.forEach((warning: any) => {
      if (warning._type === '.ProductWarning') {
        const productWarning: IProductWarningModel = {
          warning_id: warning.id,
          warning_type: "p",
          warning_link: warning.link,
          publishedDate: warning.publishedDate.toString(),
          title: warning.title,
          description: warning.warning,
          designation: warning.product ? warning.product.designation : null,
          manufacturer: warning.product ? warning.product.manufacturer : null,
          catergory: warning.product ? warning.product.category : null,
          model: warning.product ? (warning.product.model === "unbekannt" ? undefined: warning.product.model ) : null,
          hazard: warning.safetyInformation ? warning.safetyInformation.hazard : null,
          injury: warning.safetyInformation ? warning.safetyInformation.injury : null,
          affectedProducts: warning.affectedProducts
        }

        warnings.products.push(productWarning);
      }
      else if (warning._type === '.FoodWarning') {
        const foodWarning: IFoodWarningModel = {
          warning_id: warning.id,
          warning_type: "f",
          warning_link: warning.link,
          publishedDate: warning.publishedDate.toString(),
          title: warning.title,
          description: warning.warning,
          affectedStates: warning.affectedStates,
          designation: warning.product ? warning.product.designation : null,
          manufacturer: warning.product ? warning.product.manufacturer : null
        }
        warnings.foods.push(foodWarning);
      }
    });

    return warnings;
  }

  async getAll(){

    const body = {
      "food": {
        "sort": "publishedDate desc, title asc"
      },
      "products": {
        "sort": "publishedDate desc, title asc"
      }
    };
    
    const data = await this.callApi(body);
    const warnings = this.getWarnings(data);

    return warnings;
  }

  async getUpdate(){
    const now = new Date();
    const timestamp = now.getTime() - 6 * 60 * 1000;

    const body = {
      "food": {
        "sort": "publishedDate desc, title asc",
        "fq": [
          "publishedDate >" + timestamp
        ]
      },
      "products": {
        "sort": "publishedDate desc, title asc",
        "fq": [
          "publishedDate >" + timestamp
        ]
      }
    };
    
    var data = await this.callApi(body);
    var warnings = this.getWarnings(data);
    
    if (warnings.foods.length === 0 && warnings.products.length === 0) {
      return "No new warnings found!";
    }

    return warnings;
  }
}
