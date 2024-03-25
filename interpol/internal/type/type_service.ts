import axios from 'axios';
import { ITypeModel } from "../models/type";
import { TypeRepository } from "./type_repository";

export class TypeService {
  constructor(private readonly typeRepository: TypeRepository) {}

  async callApi() {
    const url = 'https://ws-public.interpol.int/notices/v1/red?arrestWarrantCountryId=DE&page=1&resultPerPage=200';
  const headers = {
    'accept': 'application/json'
  };

  try {
    const response = await axios.get(url, { headers });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
  }

  async getTypes(){
    // Business logic here
    const data = await this.callApi();

    return data;
  }
}
