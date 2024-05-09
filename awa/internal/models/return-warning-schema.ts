export interface IReturnWarningSchema {
  id: string;
  type: string;
  severity: string;
  country: string;
  iso3: string;
  details: {
    link: string;
    aktuell: object[] | undefined;
    sicherheit: object[];
    gesundheit: string | undefined;
  };
}
