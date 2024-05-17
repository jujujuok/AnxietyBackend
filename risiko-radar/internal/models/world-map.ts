import { IDeleteItem } from "../utils/apiCalls";

/**
 * WorldMap model
 */
export interface IWorldMapItem {
  id: string;
  type: "travel_warning";
  country: string;
  severity: string;
  iso3: string;
  details?: IWorldMapItemDetails;
}

/**
 * WorldMap details model
 */
export interface IWorldMapItemDetails {
  type: "travel_warning";
  aktuell: string;
  sicherheit: string;
  gesundheit: string;
}

export interface IWorldMapUpdate {
  add: IWorldMapItem[];
  delete: (string | IDeleteItem)[];
}
