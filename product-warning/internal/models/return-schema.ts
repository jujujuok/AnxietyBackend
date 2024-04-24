export interface IReturnSchema {
  id: number;
  type: string;
  title: string | undefined;
  description: string | undefined;
  area: string[] | undefined;
  details: {
    link: string | undefined;
    manufacturer: string | undefined;
    category: string | undefined;
    hazard: string | undefined;
    injury: string | undefined;
    affectedProducts: string | undefined;
    image: string | undefined;
  };
}
