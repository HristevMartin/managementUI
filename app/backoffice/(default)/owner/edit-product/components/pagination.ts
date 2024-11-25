
"use server";

export const pagination = async (productType, page, size) => {
  console.log("selected type pagination", productType);

  const apiUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL_SPRING}/${productType}`);

  // Append pagination parameters
  apiUrl.searchParams.append("page", page);
  apiUrl.searchParams.append("size", size);

  console.log("selected type pagination URL", apiUrl.toString());

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
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

    // Extract X-Total-Count from response headers
    const totalCount = response.headers.get("X-Total-Count");
    console.log("Total count:", totalCount);

    const responseData = await response.json();
    console.log("Raw response data:", responseData);

    // Return both the data and the total count
    return { data: responseData, totalCount };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
