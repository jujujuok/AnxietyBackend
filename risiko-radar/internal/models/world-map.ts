/**
 * WorldMap model
 */
export interface IWorldMapItem {
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
 * WorldMap details model
 */
export interface IWorldMapItemDetails {
  id: number;
  type:
    | "interpol_red"
    | "interpol_un"
    | "travel_warning"
    | "country_representative";
  details: object;
}
