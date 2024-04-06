import { Pool } from "pg";
import { ITypeModel } from "../models/type";

export class TypeRepository {
  constructor(private readonly db: Pool) {}

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
