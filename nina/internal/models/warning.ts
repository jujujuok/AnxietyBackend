export interface IWarningModel {
  id: string;
  type: string;
  title: string;
  description: string | null;
  instruction: string | null;
  coordinates: string[];
}
