/**
 * Country model
 */
export interface ICountryItem {
  id: number;
  type:
    | "interpol_red"
    | "interpol_un"
    | "travel_warning"
    | "country_representative";
  title: string;
  country: string;
  since: number;
}

/**
 * Country details model
 */
export interface ICountryItemDetails {
  id: number;
  type:
    | "interpol_red"
    | "interpol_un"
    | "travel_warning"
    | "country_representative";
  details: object;
}
