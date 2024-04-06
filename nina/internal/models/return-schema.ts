export interface IReturnSchema {
  id: string;
  type: string;
  title: string | undefined;
  area: any;
  since: null;
  details: {
    description: string;
    instruction: string;
    title: string;
  };
}
