import { ITypeModel } from "../models/type";
import { TypeRepository } from "./type_repository";

export class TypeService {
  constructor(private readonly typeRepository: TypeRepository) {}

  async getTypes(): Promise<ITypeModel[]> {
    // Business logic here
    return this.typeRepository.getTypes();
  }
}
