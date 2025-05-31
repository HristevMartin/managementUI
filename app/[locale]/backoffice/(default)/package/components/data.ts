"use server";

let jHipsterApiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;

const convertToPlural = (word) => {
  const lowercaseWord = word.charAt(0).toLowerCase() + word.slice(1);

  if (lowercaseWord.endsWith("y")) {
    return lowercaseWord.slice(0, -1) + "ies";
  }

  return lowercaseWord + "s";
};

export const pluraldata = async (selectedtype: any, apiToken: string) => {
  console.log("pluraldata selectedtype", selectedtype);

  const pluralType = convertToPlural(selectedtype);

  console.log("pluraldata selectedtype after", pluralType);

  const apiUrl = `${jHipsterApiUrl}/api/${pluralType}`;

  console.log("pluraldata url", apiUrl);

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
    console.log("Raw response pluraldata :", responseData);

    return responseData;
  } catch (error) {
    console.error("Error fetching pluraldata :", error);
    throw error;
  }
};
