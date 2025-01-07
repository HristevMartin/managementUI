"use server";

let jHipsterApiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;

export const roomdata = async (apiToken: string) => {

  const apiUrl = `${jHipsterApiUrl}/api/rooms`;

  console.log("selectedtype roomdata url", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error response:", errorMessage); 
      throw new Error(
        `Failed to fetch roomdata : ${response.status} - ${errorMessage}`
      );
    }

    const responseData = await response.json(); 
    console.log("Raw response roomdata :", responseData); 

    return responseData;
  } catch (error) {
    console.error("Error fetching roomdata:", error);
    throw error;
  }
};
