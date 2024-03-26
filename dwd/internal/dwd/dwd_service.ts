import { ITypeModel } from "../models/type";
import { DwDRepository } from "./dwd_repository";

export class DwDService {
  constructor(private readonly dwdRepository: DwDRepository) {}

  async getTypes(): Promise<ITypeModel[]> {
    // Business logic here
    return this.dwdRepository.getTypes();
  }
}
