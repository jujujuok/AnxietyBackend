import { ITypeModel } from "../models/type";

export class TypeRepository {
  async getTypes(): Promise<ITypeModel[]> {
    // Fetch Data from Database
    // Example Data:
    const types: ITypeModel[] = [
      { id: 1, type: "warning" },
      { id: 2, type: "danger" },
    ];

    return types;
  }
}
