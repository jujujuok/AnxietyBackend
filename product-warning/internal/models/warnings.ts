import { IFoodWarningModel } from "./foodWarning";
import { IProductWarningModel } from "./productWarning";

export interface IWarningsModel {
  foods: IFoodWarningModel[];
  products: IProductWarningModel[];
}
