"use server";

export const data = async (productType: any, jHipsterAuthToken: string) => {
  console.log("selectedtype", productType);
  const apiUrl = `${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/get-entity-by-name/${productType}`;

  console.log("selectedtype url", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jHipsterAuthToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error response:", errorMessage); // Log the error response
      throw new Error(
        `Failed to fetch data: ${response.status} - ${errorMessage}`
      );
    }

    const responseData = await response.json(); // Read as text first
    console.log("Raw response data:", responseData); // Log the raw data

    return responseData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
