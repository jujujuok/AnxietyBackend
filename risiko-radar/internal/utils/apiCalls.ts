import axios from "axios";

export interface IDeleteItem {
  warning_id: string;
}

export const getDataFromApi = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    // Handle error
    console.error(error);
    throw error;
  }
};
