import { ITypeModel } from "../models/type";
import { AwARepository } from "./awa_repository";

export class AwAService {
  constructor(private readonly awaRepository: AwARepository) {}

  async getTypes(): Promise<ITypeModel[]> {
    // Business logic here
    return this.awaRepository.getTypes();
  }
}
