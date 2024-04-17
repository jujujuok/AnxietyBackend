import { IProductWarningModel } from "../models/product-warning";
import { IFoodWarningModel } from "../models/food-warning";
import { IWarningsModel } from "../models/warnings";
import { ProductWarningRepository } from "./product-warning_repository";
import axios from "axios";
import { time } from "console";

export class ProductWarningService {
  constructor(
    private readonly productWarningRepository: ProductWarningRepository
  ) {}

  async callApi(body: object) {
    const url =
      "https://megov.bayern.de/verbraucherschutz/baystmuv-verbraucherinfo/rest/api/warnings/merged";
    const headers = {
      accept: "application/json",
      Authorization:
        "baystmuv-vi-1.0 os=ios, key=9d9e8972-ff15-4943-8fea-117b5a973c61",
      "Content-Type": "application/json",
    };

    try {
      const response = await axios.post(url, body, { headers });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  getWarnings(data: any) {
    var warnings: IWarningsModel = { foods: [], products: [] };
    data.response.docs.forEach((warning: any) => {
      if (warning._type === ".ProductWarning") {
        const productWarning: IProductWarningModel = {
          warning_id: warning.id,
          warning_type: "p",
          publishedDate: warning.publishedDate.toString(),
          warning_link: warning.link ? warning.link.replaceAll("'", '"') : null,
          title: warning.title ? warning.title.replaceAll("'", '"') : null,
          description: warning.warning
            ? warning.warning.replaceAll("'", '"')
            : null,
          manufacturer: warning.product
            ? warning.product.manufacturer
              ? warning.product.manufacturer.replaceAll("'", '"')
              : null
            : null,
          category: warning.product
            ? warning.product.category
              ? warning.product.category.replaceAll("'", '"')
              : null
            : null,
          hazard: warning.safetyInformation
            ? warning.safetyInformation.hazard
              ? warning.safetyInformation.hazard.replaceAll("'", '"')
              : null
            : null,
          injury: warning.safetyInformation
            ? warning.safetyInformation.injury
              ? warning.safetyInformation.injury.replaceAll("'", '"')
              : null
            : null,
          affectedProducts: warning.product
            ? warning.product.affectedProducts
              ? warning.product.affectedProducts.replaceAll("'", '"')
              : null
            : null,
        };

        warnings.products.push(productWarning);
      } else if (warning._type === ".FoodWarning") {
        const foodWarning: IFoodWarningModel = {
          warning_id: warning.id,
          warning_type: "f",
          warning_link: warning.link.replaceAll("'", '"'),
          publishedDate: warning.publishedDate.toString(),
          title: warning.title.replaceAll("'", '"'),
          description: warning.warning.replaceAll("'", '"'),
          affectedStates: warning.affectedStates,
          manufacturer: warning.product
            ? warning.product.manufacturer.replaceAll("'", '"')
            : null,
        };
        warnings.foods.push(foodWarning);
      }
    });

    return warnings;
  }

  async fetchAll() {
    const body = {
      food: {
        sort: "publishedDate desc, title asc",
      },
      products: {
        sort: "publishedDate desc, title asc",
      },
    };

    const data = await this.callApi(body);
    const warnings = this.getWarnings(data);

    return this.productWarningRepository.saveAll(warnings);
  }

  async fetchUpdate() {
    const now = new Date();
    const timezone = now.getTimezoneOffset();
    const timestamp = now.getTime() - 6 * 60 * 1000 + timezone * 60 * 1000;
    console.log(timestamp);

    const body = {
      food: {
        sort: "publishedDate desc, title asc",
        fq: ["publishedDate >" + timestamp],
      },
      products: {
        sort: "publishedDate desc, title asc",
        fq: ["publishedDate >" + timestamp],
      },
    };

    const data = await this.callApi(body);
    const warnings = this.getWarnings(data);

    return this.productWarningRepository.saveUpdate(warnings);
  }

  async getData(timestamp: number) {
    const data = this.productWarningRepository.getData(timestamp);
    return data;
  }

  async fetchUpdateAll() {
    const body = {
      food: {
        sort: "publishedDate desc, title asc",
      },
      products: {
        sort: "publishedDate desc, title asc",
      },
    };

    const data = await this.callApi(body);
    const warnings = this.getWarnings(data);

    return this.productWarningRepository.saveUpdate(warnings);
  }
}
