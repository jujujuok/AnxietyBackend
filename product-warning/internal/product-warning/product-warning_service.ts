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
    var warnings: IWarningsModel = { foods: [], products: [] };
    data.response.docs.forEach((warning: any) => {
      if (warning._type === '.ProductWarning') {
        const productWarning: IProductWarningModel = {
          type: warning._type,
          title: warning.title,
        }
        warnings.products.push(productWarning);
      }
      else if (warning._type === '.FoodWarning') {
        const foodWarning: IFoodWarningModel = {
          type: warning._type,
          title: warning.title,
          affectedStates: warning.affectedStates
        }
        warnings.foods.push(foodWarning);
      }
    });

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
    var warnings: IWarningsModel = { foods: [], products: [] };
    data.response.docs.forEach((warning: any) => {
      if (warning._type === '.ProductWarning') {
        const productWarning: IProductWarningModel = {
          type: warning._type,
          title: warning.title
        }
        warnings.products.push(productWarning);
      }
      else if (warning._type === '.FoodWarning') {
        const foodWarning: IFoodWarningModel = {
          type: warning._type,
          title: warning.title,
          affectedStates: warning.affectedStates
        }
        warnings.foods.push(foodWarning);
      }
    });
    
    if (warnings.foods.length === 0 && warnings.products.length === 0) {
      return "No new warnings found!";
    }

    return warnings;
  }
}
