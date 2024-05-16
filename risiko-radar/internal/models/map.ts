import { IDeleteItem } from "../utils/apiCalls";

/**
 * MapItem model
 */
export interface IMapItem {
  id: string;
  type: "nina" | "street_report" | "weather";
  warning: string;
  title: string;
  area: Array<Array<[number, number]>>;
  details?: IMapItemDetails;
}

/**
 * MapItem details model
 */
export interface IMapItemDetails {
  type: "nina" | "street_report" | "weather";
  description: string;
  instruction?: string;
}

export interface IMapUpdate {
  add: IMapItem[];
  delete: (string | IDeleteItem)[];
}
