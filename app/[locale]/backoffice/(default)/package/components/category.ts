"use server";

let jHipsterApiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;

export const categorydata = async (apiToken: string) => {

  const apiUrl = `${jHipsterApiUrl}/api/jdl/get-all-entities`;

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
        `Failed to fetch category : ${response.status} - ${errorMessage}`
      );
    }

    const responseData = await response.json(); 
    console.log("Raw response category :", responseData); 

    return responseData;
  } catch (error) {
    console.error("Error fetching dataByid :", error);
    throw error;
  }
};
