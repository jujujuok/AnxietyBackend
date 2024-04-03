import { ITypeModel } from "../models/type";
import { NinaRepository } from "./nina_repository";

export class NinaService {
  constructor(private readonly ninaRepository: NinaRepository) {}

  async fetchData(): Promise<ITypeModel[]> {
    // Business logic here
    return this.ninaRepository.getTypes();
  }
}
