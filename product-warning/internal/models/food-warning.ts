export interface IFoodWarningModel {
    warning_id: number;
    warning_type: string;
    warning_link: string;
    publishedDate: string;
    title: string;
    description: string;
    affectedStates: string[];
    designation: string;
    manufacturer: string;
}
