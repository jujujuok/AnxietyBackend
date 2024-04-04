import { IFoodWarningModel } from "./food-warning";
import { IProductWarningModel } from "./product-warning";

export interface IWarningsModel {
  foods: IFoodWarningModel[];
  products: IProductWarningModel[];
}
