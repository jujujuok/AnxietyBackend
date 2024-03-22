import { ITypeModel } from "../models/type";
import { ProductWarningRepository } from "./product-warning_repository";
import fetch from 'node-fetch';

export class ProductWarningService {
  constructor(private readonly productWarningRepository: ProductWarningRepository) {}

  async getAll(): Promise<ITypeModel[]> {
    // Business logic here

    const url = 'https://megov.bayern.de/verbraucherschutz/baystmuv-verbraucherinfo/rest/api/warnings/merged';
    const headers = {
      'accept': 'application/json',
      'Authorization': 'baystmuv-vi-1.0 os=ios, key=9d9e8972-ff15-4943-8fea-117b5a973c61',
      'Content-Type': 'application/json'
    };
    const body = {
      "food": {
        "sort": "publishedDate desc, title asc"
      },
      "products": {
        "sort": "publishedDate desc, title asc"
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
    return this.productWarningRepository.getTypes();
  }
}
