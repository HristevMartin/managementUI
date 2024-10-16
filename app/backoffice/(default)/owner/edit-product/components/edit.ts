'use server';

export const edit = async (apiUrl, id, formData) => {
  console.log("Payload for edit API", formData);

  const apiUrlWithId = `http://localhost:8080/api/${apiUrl}/${id}`;

  try {
    const response = await fetch(apiUrlWithId, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    console.log('Response status for edit:', response.status);
    console.log('Response headers for edit:', response.headers);

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Error details:', errorDetails); // Log error details for debugging
      const errorMessage = errorDetails?.message || await response.text();
      throw new Error(`Failed to fetch data: ${response.status} - ${errorMessage}`);
    }

    const searchData = await response.json();
    console.log('Edit data fetched:', searchData);
    return searchData;

  } catch (error) {
    console.error('Error fetching edit data:', error);
    throw error;
  }
};
