export interface IWarningModel {
  ISO3: string;
  country: string;
  severity: string | undefined;
  link: string;
  aktuell: object[] | undefined;
  sicherheit: object[];
  gesundheit: string | undefined;
  lastModified: number;
}
