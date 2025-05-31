"use server";

export const role = async (payload: any, jwttoken: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_TRAVEL_SECURITY}/api/v1/users`;
  console.log("users url is following:", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwttoken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error response:", errorMessage);
      throw new Error(`Failed to fetch data: ${response.status} - ${errorMessage}`);
    }

    const responseData = await response.json();
    console.log("Raw response data of role:", responseData);
    return responseData;

  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error(`Error fetching role data: ${error.message}`);
  }

};