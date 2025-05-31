interface ValidationRules {
  min: string,
  max: string,
  unique: boolean
}

interface LocalAttributes {
  key: string,
  type: string,
  required: boolean,
  locale: boolean,
  validations: ValidationRules
}

function getLocaleAttributes(localeAttributes: LocalAttributes[]) {
  let localeAttributesArray: string[] = [];

  for (let obj of localeAttributes) {
    if (obj.locale) {
      localeAttributesArray.push(obj.key.toLowerCase());
    }
  }

  return localeAttributesArray;
}

const transformStringMinMaxPayload = (payload: any) => {
  const { entityName, entityType, parentEntityName, customFields } = payload;

  console.log('customFields are following', customFields);
  const transformedFields = customFields.map((field: any) => {
    console.log('show me the field', field);
    if (field.validations) {
      const { min, max, ...otherValidations } = field.validations;
      if (field.type === "String") {
        return {
          ...field,
          validations: {
            ...otherValidations,
            ...(min !== undefined ? { minlength: min } : {}),
            ...(max !== undefined ? { maxlength: max } : {}),
          },
        };
      } else {
        return {
          ...field,
          validations: {
            ...otherValidations,
            ...(min !== undefined ? { min } : {}),
            ...(max !== undefined ? { max } : {}),
          },
        };
      }
    }
    return field;
  });

  let localeAttributes = getLocaleAttributes(customFields);

  return {
    entityName,
    entityType,
    parentEntityName,
    customFields: transformedFields,
    localizationsFields: localeAttributes
  };
};

export function transformPayload(res: any): any {
  res = transformStringMinMaxPayload(res);
  console.log('show me the res', res);

  let transformed = {
    entityName: res.entityName,
    entityType: res.entityType,
    parentEntityName: res.parentEntityName,
    fields: [],
    localizationsFields: res.localizationsFields
  };

  res.customFields.forEach((field) => {
    let fieldStr = `${field.key.toLowerCase()} ${field.type}`;

    if (field.required) {
      fieldStr += " required";
    }

    if (field.validations) {
      const validations = [];
      ["min", "max", "minlength", "maxlength"].forEach((key) => {
        if (field.validations[key]) {
          validations.push(`${key}(${field.validations[key]})`);
        }
      });
      if (field.validations.unique === true) {
        validations.push("unique");
      }
      if (validations.length > 0) {
        fieldStr += " " + validations.join(" ");
      }
    }

    transformed.fields.push(fieldStr);
  });

  return transformed;
}

export function transformMetaCategoryData(data) {
  return data.map((item) => {
    const {
      fields,
      categoryId,
      ...desiredProperties
    } = item;

    const customFields = fields.map((field) => {
      const parts = field.split(" ");
      return {
        key: parts[0],
        type: parts[1],
        required: parts[2] === "required",
        validations: {
          min: parts[3]?.match(/\d+/)?.[0] ?? "",
          max: parts[4]?.match(/\d+/)?.[0] ?? "",
          unique: parts.includes("unique"),
        },
      };
    });

    return {
      ...desiredProperties,
      customFields,
      categoryId,
    };
  });
}

export function transformMetaCategoryDataToFeComponent(data) {
  let listData = [];

  data.forEach((entity) => {
    let mapData = {};
    let { entityName, customFields } = entity;
    mapData["entityName"] = entityName;
    mapData["customFields"] = [];
    customFields.forEach((field) => {
      let { key, type } = field;
      let tempObject = {};
      tempObject["key"] = key;
      tempObject["type"] = "";
      tempObject["label"] = "";
      tempObject["required"] = false;
      tempObject["placeholder"] = "";
      tempObject["options"] = [];
      mapData["customFields"].push(tempObject);
    });
    listData.push(mapData);
  });

  return listData;
}

export function parseMetaCategoryDataTypes(data, productType) {
  let res = [];

  for (let el of data) {
    if (el.entityName == productType) {
      for (let nestedElement of el.customFields) {
        res.push(nestedElement.key);
      }
    } else {
      console.log("product type does not match");
    }
  }
  return res;
}