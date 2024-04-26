export interface IWarningModel {
  countryCode: string;
  iso3CountryCode: string;
  countryName: string;
  warning: boolean;
  partialWarning: boolean;
  situationWarning: boolean;
  situationPartWarning: boolean;
  link: string;
  warningText: {
    aktuell: any;
    sicherheit: any;
    gesundheit: string;
  };
}
