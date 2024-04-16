import axios from "axios";

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
