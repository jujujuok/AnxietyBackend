import { IFoodWarningModel } from "./food-warning.ts";
import { IProductWarningModel } from "./product-warning.ts";

export interface IWarningsModel {
    foods: IFoodWarningModel[];
    products: IProductWarningModel[];
}