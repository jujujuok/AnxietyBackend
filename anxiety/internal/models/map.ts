export interface IMapItem {
  id: number;
  type:
    | "weather_flood"
    | "weather_storm"
    | "weather_disaster"
    | "street_closure"
    | "street_report"
    | "police"
    | "air_quality"
    | "radiation";
  severity: "information" | "warning" | "danger" | "extreme_danger";
  title: string;
  position: {
    lat: number;
    lon: number;
  };
  area: number[] | number;
  since: number;
}

export interface IMapItemDetails {
  id: number;
  type:
    | "weather_flood"
    | "weather_storm"
    | "weather_disaster"
    | "street_closure"
    | "street_report"
    | "police"
    | "air_quality"
    | "radiation";
  details: object;
}
