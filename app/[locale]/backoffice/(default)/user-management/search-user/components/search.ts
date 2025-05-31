"use server";
export const searchrole = async (payload,token) => {
  console.log("payload searchrole:", payload);
  console.log("token searchrole:", token);
  // Filter out empty values from the payload
  const filteredPayload = Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => value !== "")
  );
  // Build the query string from the filtered payload
  const params = new URLSearchParams(filteredPayload).toString();
  
  // Construct the API URL with query parameters
  const apiUrl = `${process.env.NEXT_PUBLIC_TRAVEL_SECURITY}/api/v1/users/search?${params}`;
  console.log("searchrole url:", apiUrl);
  try {
    
    const response = await fetch(apiUrl, {
      method: "GET", 
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error response:", errorMessage); 
      throw new Error(`Failed to fetch data: ${response.status} - ${errorMessage}`);
    }
    
    const responseData = await response.json(); 
    console.log("Raw response data of searchrole:", responseData); 
    return responseData; 
  } catch (error) {
    console.error("Error fetching data:", error); 
    throw error; 
  }
};