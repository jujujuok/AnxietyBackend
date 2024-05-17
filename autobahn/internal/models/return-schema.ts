export interface IReturnSchema {
  id: string;
  type: string;
  warning: string;
  title: string;
  area: [[number[]]];
  details: {
    description: string;
  };
}
