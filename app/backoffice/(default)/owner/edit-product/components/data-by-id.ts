"use server";

export const dataByid = async (productType, id) => {
  console.log("selectedtype", productType);
  console.log("selectedtype id", id);
  const apiUrl = `http://localhost:8080/api/${productType}/${id}`;

  console.log("selectedtype url", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error response:", errorMessage); // Log the error response
      throw new Error(
        `Failed to fetch dataByid : ${response.status} - ${errorMessage}`
      );
    }

    const responseData = await response.json(); // Read as text first
    console.log("Raw response dataByid :", responseData); // Log the raw data

    return responseData;
  } catch (error) {
    console.error("Error fetching dataByid :", error);
    throw error;
  }
};
