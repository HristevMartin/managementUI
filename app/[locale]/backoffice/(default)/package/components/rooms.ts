"use server";

let jHipsterApiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;

export const roomdata = async () => {

  const apiUrl = `${jHipsterApiUrl}/api/rooms`;

  console.log("selectedtype roomdata url", apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTczNTcxMzU4MSwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzM1NjI3MTgxfQ.O8z0u3ZvgEZYG9-jmtoAOMRGL9RUZkM4iWa8G7p1Y-EFgBejTBYlrT_ZTI3hHkfxl5bcareF_n-qLyGlJ4-Npg`,
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
