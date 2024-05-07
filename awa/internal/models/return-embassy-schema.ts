export interface IReturnEmbassySchema {
  id: string;
  type: string;
  severity: string | undefined;
  title: string;
  country: string;
  city: string;
  details: {
    address: string | undefined;
    contact: string | undefined;
    emergencyphone: string | undefined;
    phone: string | undefined;
    website: string | undefined;
    mail: string | undefined;
  };
}
