'use server';

export const search = async (payload) => {

  console.log("payload for search api",payload);

  // const apiUrl = `http://localhost:8080/api/search-entities`;
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/search-entities`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST', 
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Response status for search:', response.status);
    console.log('Response headers for search:', response.headers);

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to fetch data: ${response.status} - ${errorMessage}`);
    }

    const searchData = await response.json();
    console.log('Search data fetched:', searchData);
    return searchData;

  } catch (error) {
    console.error('Error fetching search data:', error);
    throw error; // Propagate the error to be handled in the component
  }
};

