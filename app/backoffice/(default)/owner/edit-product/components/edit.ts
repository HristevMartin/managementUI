'use server';

const customForm = (selectedType) => {
  // Convert to lowercase and add 's' at the end if not already there
  let formattedType = selectedType.toLowerCase();
  if (!formattedType.endsWith('s')) {
    formattedType += 's';
  }
  return formattedType;
};


export const edit = async (formData, selectedType, id) => {
  console.log("Payload selectedType:", selectedType);
  console.log("Payload id:", id);
  console.log("Payload formData:", formData);

  const singularType = customForm(selectedType);
  console.log("Singular Type:", singularType);

  // Constructing the API URL
  const apiUrlWithId = `${process.env.NEXT_PUBLIC_BASE_URL_SPRING}/${singularType}/${id}`;

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
      const errorDetails = await response.json().catch(() => ({})); // Safely try to parse JSON
      console.error('Error details:', errorDetails); // Log error details for debugging
      const errorMessage = errorDetails.message || await response.text();
      throw new Error(`Failed to edit data: ${response.status} - ${errorMessage}`);
    }

    const updatedData = await response.json();
    console.log('Edit data fetched:', updatedData);
    return updatedData;

  } catch (error) {
    console.error('Error fetching edit data:', error);
    throw error; // Re-throw the error for further handling
  }
};
