'use server';

export const search = async (payload: any, page: any, size: any, jHipsterAuthToken: string) => {

  console.log("payload for search api", payload);
  console.log("page no search api", page);
  console.log("size per page", size);
  console.log("size per payload", payload);

  // Use a URL object for the base URL and to modify the query parameters
  const apiUrl = new URL(`${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/search-entities`);
  console.log('the api url is', apiUrl);
  // Append pagination parameters to the URL's search params
  apiUrl.searchParams.append("page", page);
  apiUrl.searchParams.append("size", size);

  console.log("search pagination URL", apiUrl.toString());

  // Ensure the token is available
  if (!jHipsterAuthToken) {
    throw new Error('API token is not defined');
  }

  try {
    const response = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jHipsterAuthToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Response status for search:', response.status);
    console.log('Response headers for search:', response.headers);

    if (!response.ok) {
      const errorMessage = await response.text();
      console.log('the error message', errorMessage);
      throw new Error(`Failed to fetch data: ${response.status} - ${errorMessage}`);
    }

    // Extract X-Total-Count from response headers
    const totalCount = response.headers.get("X-Total-Count");
    console.log("Total count for search:", totalCount);

    const searchData = await response.json();
    console.log('Search data fetched:', searchData);

    return { searchData, totalCount };

  } catch (error) {
    console.error('Error fetching search data:', error);
    throw error;
  }
};
