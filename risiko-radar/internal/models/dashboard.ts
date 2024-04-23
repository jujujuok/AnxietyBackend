import { IDeleteItem } from "../utils/apiCalls";

/**
 * Dashboard model.
 */
export interface IDashboardItem {
  id: string;
  type:
    | "interpol_red"
    | "interpol_un"
    | "food_waring"
    | "product_warning"
    | "travel_warning"
    | "country_representative";
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
  details: object;
}

export interface IDashboardUpdate {
  add: IDashboardItem[];
  delete: (string | IDeleteItem)[];
}
