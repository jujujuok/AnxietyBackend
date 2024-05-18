export interface IReturnSchema {
  id: string;
  type: string;
  warning: string;
  title: string | undefined;
  area: [[number[]]];
  details: {
    description: string;
    instruction: string;
  };
}
