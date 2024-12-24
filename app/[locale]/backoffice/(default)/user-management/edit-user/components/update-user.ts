"use server";
export const updateuser = async (id, userdata,token) => {
  console.log("payload updateuser:", userdata);
  console.log("payload id:", id);
  console.log("updateuser token:", id);
  
  const apiUrl = `${process.env.NEXT_PUBLIC_TRAVEL_SECURITY}/api/v1/users/${id}`;
  console.log("updateuser url:", apiUrl);
  try {
   
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userdata),
    });
  
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error response:", errorMessage);
      throw new Error(
        `Failed to fetch data: ${response.status} - ${errorMessage}`
      );
    }
  
    const responseData = await response.json();
    console.log("Raw response data of updateuser:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};