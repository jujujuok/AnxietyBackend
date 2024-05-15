import { IProductWarningModel } from "../models/product-warning";
import { IFoodWarningModel } from "../models/food-warning";
import { IWarningsModel } from "../models/warnings";
import { ProductWarningRepository } from "./product-warning_repository";
import axios from "axios";

export class ProductWarningService {
  constructor(
    private readonly productWarningRepository: ProductWarningRepository,
  ) {}

  private async callApi(body: object) {
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
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseProductWarning(warning: any): IProductWarningModel {
    return {
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
      image: warning.product ? warning.product.imageUrls[0] : null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseFoodWarning(warning: any): IFoodWarningModel {
    return {
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
      image: warning.product ? warning.product.imageUrls[0] : null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getWarnings(data: any) {
    const warnings: IWarningsModel = { foods: [], products: [] };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.response.docs.forEach((warning: any) => {
      if (warning._type === ".ProductWarning") {
        warnings.products.push(this.parseProductWarning(warning));
      } else if (warning._type === ".FoodWarning") {
        warnings.foods.push(this.parseFoodWarning(warning));
      }
    });

    return warnings;
  }

  async fetchUpdate() {
    const now = new Date();
    const timezone = now.getTimezoneOffset();
    const timestamp = now.getTime() - (600 * 60 * 1000 + timezone * 60 * 1000);

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

  async getDetails(id: number) {
    const data = this.productWarningRepository.getDetails(id);
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
