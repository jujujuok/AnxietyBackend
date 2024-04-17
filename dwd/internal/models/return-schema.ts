export interface IReturnSchema {
    id: string;
    type: string;
    warning: string;
    title: string | undefined;
    area: any;
    details: {
      description: string;
      instruction: string;
    };
}