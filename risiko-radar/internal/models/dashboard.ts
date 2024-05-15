import { IDeleteItem } from "../utils/apiCalls";

/**
 * Dashboard model.
 */
export interface IDashboardItem {
  id: string;
  type: string;
  severity: "information" | "warning" | "danger" | "extreme_danger";
  title: string;
  description: string;
  since: number;
  details?: IDashboardItemDetails;
}

/**
 * Dashboard details model.
 */
export interface IDashboardItemDetails {
  id: string;
  type: string;
  details: object;
}

export interface IDashboardUpdate {
  add: IDashboardItem[];
  delete: (string | IDeleteItem)[];
}
