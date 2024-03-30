export interface IDashboardItem {
  id: number;
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
}

export interface IDashboardItemDetails {
  id: number;
  type:
    | "interpol_red"
    | "interpol_un"
    | "food_waring"
    | "product_warning"
    | "traverl_warning"
    | "country_representative";
  details: object;
}
