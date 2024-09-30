let apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;
console.log("this is the api url", apiUrlSpring);

// const fetchProductTypes = async (apiToken) => {

//   const response = await fetch(`${apiUrlSpring}/api/jdl/product-types`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${apiToken}`,
//     },
//   });

//   console.log('calling fetchProductTypes');
//   if (!response.ok) throw new Error("Failed to fetch product types");
//   return response.json();
// };

const fetchAllEntities = async (apiToken) => {
  const response = await fetch(`${apiUrlSpring}/api/jdl/get-all-entities`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch all entities");
  return response.json();
};

const fetchEntityDetails = async (entityId, apiToken) => {
  const response = await fetch(
    `${apiUrlSpring}/api/jdl/get-entity-by-id/${entityId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );

  if (!response.ok)
    throw new Error(`Failed to fetch details for entity ID ${entityId}`);
  let res = response.json();

  return res;
};

const fetchMetadataForType = async (productTypeId, apiToken) => {
  console.log("calling fetchMetadataForType");

  const response = await fetch(
    `${apiUrlSpring}/api/jdl/product-types-metadata?categoryId=${productTypeId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch metadata for product type ID ${productTypeId}`
    );
  }
  let data = await response.json();
  console.log("data is????", data);

  const metadata = data.data.map((entry) => ({
    ...entry,
    parsedValue: safeParseJSON(entry.value),
  }));

  console.log("metadata!?! is:", metadata);

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

const parseField = (fieldString) => {
  const parts = fieldString.split(" ");
  const fieldName = parts[0];
  const fieldType = parts[1];
  return {
    name: fieldName,
    type: fieldType,
    required: fieldString.includes("required"),
    external: fieldString.includes("external"),
  };
};

// const fetchRelationshipDetails = async (relationshipTo, apiToken) => {
//   console.log("fetching relationship details for:", relationshipTo);
//   const apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;
//   const endpoint = `${relationshipTo.toLowerCase()}s`;

//   try {
//     const response = await fetch(`${apiUrlSpring}/api/${endpoint}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${apiToken}`,
//       },
//     });

//     if (!response.ok) {
//       console.error(
//         `Failed to fetch relationship details for ${relationshipTo}, returning empty data.`
//       );
//       return []; // Return an empty array on failure
//     }

//     let res = await response.json();
//     let res2 = res.map((x) => ({ id: x.id, name: x.name })); // Transforming the data as needed
//     console.log("Transformed relationship details:", res2);
//     return res2; // Return transformed data
//   } catch (error) {
//     console.error("Error fetching data:", error.message);
//     return []; // Return an empty array in case of any error
//   }
// };

const fetchRelationshipDetails = async (relationshipTo, apiToken) => {
  console.log("fetching relationship details for:", relationshipTo);
  const apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;
  const endpoint = `${relationshipTo.toLowerCase()}s`;

  try {
    const response = await fetch(`${apiUrlSpring}/api/${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch relationship details for ${relationshipTo}, returning empty data.`
      );
      return [];
    }

    let res = await response.json();
    return res.map((x) => ({ id: x.id, name: x.name })); // Transforming the data as needed
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return []; // Return an empty array in case of any error
  }
};

export const mapProductTypesToCustomFields = async (apiToken) => {
  try {
    const entities = await fetchAllEntities(apiToken);
    console.log("types", entities);

    const detailsPromises = entities.map((entity) =>
      fetchEntityDetails(entity.id, apiToken)
    );

    const details = await Promise.all(detailsPromises);
    console.log("details", details);

    let detailedCategories = [];

    try {
       detailedCategories = await Promise.all(
        details.map(async (category) => {
          console.log("Processing category:", category);

          // Directly fetch relationship data if the category is "Bundle" and relationships exist
          let options = [];
          if (
            category.entityName === "Bundle" &&
            category.relationships.length > 0
          ) {
            options = await Promise.all(
              category.relationships.map(async (relationship) => {
                console.log("Fetching relationship details for:", relationship);
                return {
                  data: await fetchRelationshipDetails(
                    relationship.relationshipTo,
                    apiToken
                  ),
                };
              })
            );
          }
        })
      );
    } catch (error) {
      console.error("Error fetching relationship details:", error);
      return [];
    }

    console.log("Detailed Categories:", detailedCategories);

    const transformedData = details.map((detail) => ({
      categoryName: detail.entityName,
      customFields: detail.fields.map(parseField),
      categoryId: [detail.id],
    }));

    console.log("Transformed Custom Fields Data:", transformedData);

    return transformedData;
  } catch (error) {
    console.error("Error mapping product types to custom fields:", error);
    return [];
  }
};

