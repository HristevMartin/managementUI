let apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;
console.log('this is the api url', apiUrlSpring);

const fetchProductTypes = async (apiToken) => {

  const response = await fetch(`${apiUrlSpring}/api/jdl/product-types`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
  });

  console.log('calling fetchProductTypes');
  if (!response.ok) throw new Error("Failed to fetch product types");
  return response.json();
};

const fetchMetadataForType = async (productTypeId, apiToken) => {
  console.log('calling fetchMetadataForType');


  const response = await fetch(`${apiUrlSpring}/api/jdl/product-types-metadata?categoryId=${productTypeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
    });


  if (!response.ok) {
    throw new Error(
      `Failed to fetch metadata for product type ID ${productTypeId}`
    );
  }
  let data = await response.json();
  console.log("data is????", data);

  const metadata = data.data.map(entry => ({
    ...entry,
    parsedValue: safeParseJSON(entry.value) 
  }));

  console.log('metadata!?! is:', metadata);

  return metadata;
};

const isJsonString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};


const safeParseJSON = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON:", jsonString, error);
    return null;
  }
};


export const mapProductTypesToCustomFields = async (apiToken) => {
  try {
    const types = await fetchProductTypes(apiToken);
    console.log('Product types:', types);

    const results = await Promise.all(
      types.map(async (type) => {
        console.log('Product type!?!?!:', type);
        const metadata = await fetchMetadataForType(type.id, apiToken);
        console.log('Metadata for type:', metadata);
        
        return metadata
          .map((entry) => {
            if (!entry.parsedValue || !entry.parsedValue.fields) {
              console.error("Invalid JSON data for product type", type.name, ":", entry.value);
              return null;
            }
            return {
              categoryName: type.name,
              customFields: entry.parsedValue.fields.map(field => ({
                name: field.split(" ")[0], 
                type: field.split(" ")[1],
                required: field.includes("required"), 
                external: field.includes("external") 
              })),
              // fix the spring api that it should not return list.
              categoryId: [type.id], 
            };
          })
          .filter(item => item);
      })
    );

    let data = results.flat();
    console.log("Processed Custom Fields Data:", data);
    return data;
  } catch (error) {
    console.error("Error mapping product types to custom fields:", error);
    return [];
  }
};

