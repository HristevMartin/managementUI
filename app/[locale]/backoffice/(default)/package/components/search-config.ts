"use server";

let jHipsterApiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;

export const searchconfig = async (apiToken: string) => {

  const apiUrl = `${jHipsterApiUrl}/api/jdl/get-all-entity-search-configurations`;

  console.log("selectedtype searchconfig url", apiUrl);

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
        `Failed to fetch searchconfig : ${response.status} - ${errorMessage}`
      );
    }

    const responseData = await response.json(); 
    console.log("Raw response searchconfig :", responseData); 

    return responseData;
  } catch (error) {
    console.error("Error searchconfig :", error);
    throw error;
  }
};
