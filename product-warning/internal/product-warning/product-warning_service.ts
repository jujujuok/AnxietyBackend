import { ITypeModel } from "../models/type";
import { ProductWarningRepository } from "./product-warning_repository";

export class ProductWarningService {
  constructor(private readonly productWarningRepository: ProductWarningRepository) {}

  async getAll(): Promise<ITypeModel[]> {
    // Business logic here
    return this.productWarningRepository.getTypes();
  }
}
