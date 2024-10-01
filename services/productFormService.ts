let apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;
console.log("this is the api url", apiUrlSpring);

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

const parseField = async (fieldString, relationshipFields, apiToken) => {
  let results = [];

  for (let field of fieldString) {
    const parts = field.split(" ");
    const fieldName = parts[0];
    const fieldType = parts[1];

    results.push({
      name: fieldName,
      type: fieldType,
      required: fieldString.includes("required"),
      external: fieldString.includes("external"),
    });
  }

  for (let field of relationshipFields) {
    console.log("field of relationship is", field.relationshipTo);
    let relationshipOptions = await fetchRelationshipDetails(
      field.relationshipTo,
      apiToken
    );
    let relationshipCustomField = {
      name: field.relationshipTo,
      type: "relationship",
      required: false,
      external: false,
      options: relationshipOptions,
    };
    results.push(relationshipCustomField);
  }

  console.log("Processed custom fields:", results);
  return results;
};

function getPluralForm(singular: String) {
  const irregulars = {
    ancillary: "ancillaries",
    ticketselection: "ticket-selections",
    seatingarea: "seating-areas",
  };
  if (irregulars[singular.toLowerCase()]) {
    return irregulars[singular.toLowerCase()];
  }
  return singular.toLowerCase() + "s";
}

const fetchRelationshipDetails = async (relationshipTo, apiToken) => {
  console.log("fetching relationship details for:", relationshipTo);
  const apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;
  // const endpoint = `${relationshipTo.toLowerCase()}s`;
  const endpoint = getPluralForm(relationshipTo);

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

    let data = await response.json();
    data = data.map((x) => ({ id: x.id, name: x.name }));
    return data;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return [];
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
    console.log("Fetched entity details:", details);

    const transformedData = await Promise.all(
      details.map(async (detail) => {
        let customFields = await parseField(
          detail.fields,
          detail.relationships,
          apiToken
        );
        return {
          categoryName: detail.entityName,
          customFields: customFields,
          categoryId: [detail.id],
        };
      })
    );

    console.log("Transformed Custom Fields Data:", transformedData);

    return transformedData;
  } catch (error) {
    console.error("Error mapping product types to custom fields:", error);
    return [];
  }
};
