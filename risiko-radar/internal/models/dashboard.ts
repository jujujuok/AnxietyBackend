import { IDeleteItem } from "../utils/apiCalls";

/**
 * Dashboard model.
 */
export interface IDashboardItem {
  id: string;
  type: string;
  title: string;
  publishedDate?: number;
  country?: string;
  city?: string;
  details?: IDashboardItemDetails;
}

/**
 * Dashboard details model.
 */
export interface IDashboardItemDetails {
  title?: string;
  description?: string;
  link?: string;
  manufacturer?: string;
  image?: string;
  address?: string;
  phone?: string;
  mail?: string;
  type: string;
}

export interface IDashboardUpdate {
  add: IDashboardItem[];
  delete: (string | IDeleteItem)[];
}
