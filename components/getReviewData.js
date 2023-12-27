import { AdminUrl } from "../constant";

export const getReviewData = async (product_id) => {
    if (product_id === null || product_id === undefined) {
      // Handle the case when customerId or product_id is null or undefined, such as displaying an error message or taking appropriate action.
      return;
    }
  
    try {
      const response = await fetch(`${AdminUrl}/api/fetchRatings?product_id=${product_id}`);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
    }
  };