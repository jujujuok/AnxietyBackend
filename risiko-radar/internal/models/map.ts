import { IDeleteItem } from "../utils/apiCalls";

/**
 * MapItem model
 */
export interface IMapItem {
  id: string;
  type: "weather" | "street_report" | "police" | "air_quality" | "radiation";
  severity: "information" | "warning" | "danger" | "extreme_danger";
  title: string;
  position: {
    lat: number;
    lon: number;
  };
  area: number[] | number;
  since: number;
  details?: IMapItemDetails;
}

/**
 * MapItem details model
 */
export interface IMapItemDetails {
  id: string;
  type: "weather" | "street_report" | "police" | "air_quality" | "radiation";
  details: object;
}

export interface IMapUpdate {
  add: IMapItem[];
  delete: (string | IDeleteItem)[];
}
