import pluralize from 'pluralize';

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
      required: field.includes("required"),
    });
  }


  for (let field of relationshipFields) {
    let relationshipOptions = await fetchRelationshipDetails(
      field.relationshipTo,
      apiToken
    );

    let relationshipCustomField = {
      name: field.relationshipFrom.split('{')[1].split('(')[0],
      type: "relationship",
      required: false,
      options: relationshipOptions,
    };

    results.push(relationshipCustomField);
  }

  return results;
};


export function getPluralForm(singular: string) {
  const irregulars = {
    ancillary: "ancillaries",
    ticketselection: "ticket-selections",
    seatingarea: "seating-areas",
  };

  const lowerCased = singular.toLowerCase();

  if (irregulars[lowerCased]) {
    return irregulars[lowerCased];
  }

  let plural = pluralize(lowerCased)
  console.log('plural is', plural);

  return plural;
}


const fetchRelationshipDetails = async (relationshipTo, apiToken) => {
  console.log("fetching relationship details for:", relationshipTo);
  const apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;
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

export const mapProductTypesToCustomFields = async (apiToken: string) => {
  try {
    const entities = await fetchAllEntities(apiToken);

    const detailsPromises = entities.map((entity: any) =>
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

        const localizedFields = detail.localizationsFields || [];

        return {
          categoryName: detail.entityName,
          customFields: customFields,
          categoryId: [detail.id],
          localizedFields: localizedFields,
        };
      })
    );  

    return transformedData;
  } catch (error) {
    console.error("Error mapping product types to custom fields:", error);
    return [];
  }
};
