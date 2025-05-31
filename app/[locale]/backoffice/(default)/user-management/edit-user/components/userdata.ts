"use server";
export const userdata = async (id,token) => {
  console.log("u payload id:", id);
  console.log("tokennnn", token);
  
  const apiUrl = `${process.env.NEXT_PUBLIC_TRAVEL_SECURITY}/api/v1/users/${id}`;
  console.log("userdata url:", apiUrl);
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
    console.log("Raw response data of userdata:", responseData); 
    return responseData; 
  } catch (error) {
    console.error("Error fetching data:", error); 
    throw error; 
  }
};