"use server";
export const Userrole = async (token) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_TRAVEL_SECURITY}/api/v1/users/roles`;
  console.log("Userrole URL:", apiUrl);
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
      throw new Error(
        `Failed to fetch data: ${response.status} - ${errorMessage}`
      );
    }
    const responseData = await response.json();
    console.log("Raw response data of Userrole:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};