import { ITypeModel } from "../models/type";

export class TypeRepository {
  async getTypes(): Promise<ITypeModel[]> {
    // Fetch Data from Database
    // Example Data:
    const types: ITypeModel[] = [
      { id: 1, type: "warning" },
      { id: 2, type: "danger" },
      { id: 3, type: "info" },
      { id: 4, type: "success" },
    ];

    return types;
  }
}
