// 'use server';

// export const data = async (productType, id) => {
//   // const apiUrl = `http://localhost:8080/api/${productType}/${id}`;
//   const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${productType}/${id}`;
//   console.log("payload for edit api", apiUrl);

//   try {
//     const response = await fetch(apiUrl, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     console.log('Response status for search:', response.status);
//     console.log('Response headers for search:', response.headers);

//     if (!response.ok) {
//       const errorMessage = await response.text();
//       throw new Error(`Failed to fetch data: ${response.status} - ${errorMessage}`);
//     }

//     const searchData = await response.json();
//     console.log('Search data fetched:', searchData);
//     return searchData;

//   } catch (error) {
//     console.error('Error fetching search data:', error);
//     throw error; // Propagate the error to be handled in the component
//   }
// };


"use server";

export const data = async (productType) => {
  console.log("selectedtype", productType);
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/jdl/get-entity-by-name/${productType}`;

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
