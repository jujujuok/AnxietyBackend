export interface IReturnSchema {
    id: number;
    type: string;
    title: string | undefined;
    description: string | undefined;
    since: string | undefined;
    details:
    {
        link: string | undefined;
        designation: string | undefined;
        manufacturer: string | undefined;
        category: string | undefined;
        hazard: string | undefined;
        injury: string | undefined;
        affectedProducts: string | undefined;
        affectedStates: string[] | undefined;
    }
}