import { IDeleteItem } from "../utils/apiCalls";

/**
 * WorldMap model
 */
export interface IWorldMapItem {
  id: string;
  type:
    | "interpol_red"
    | "interpol_un"
    | "travel_warning"
    | "country_representative";
  title: string;
  country: string;
  since: number;
  details?: IWorldMapItemDetails;
}

/**
 * WorldMap details model
 */
export interface IWorldMapItemDetails {
  id: string;
  type:
    | "interpol_red"
    | "interpol_un"
    | "travel_warning"
    | "country_representative";
  details: object;
}

export interface IWorldMapUpdate {
  add: IWorldMapItem[];
  delete: (string | IDeleteItem)[];
}
