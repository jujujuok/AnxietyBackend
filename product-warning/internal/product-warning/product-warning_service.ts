import { ITypeModel } from "../models/type";
import { ProductWarningRepository } from "./product-warning_repository";
import axios from 'axios';


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
    console.log(data);

    return this.productWarningRepository.getTypes();
  }

  async getUpdate(){
    const body = {
      "food": {
        "sort": "publishedDate desc, title asc"
      },
      "products": {
        "sort": "publishedDate desc, title asc"
      }
    };
    
    const data = await this.callApi(body);
    console.log(data);

    return this.productWarningRepository.getTypes();
  }
}
