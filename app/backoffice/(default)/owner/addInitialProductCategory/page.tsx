"use client";

import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useEffect, useCallback } from "react";
import CustomTable from "./_components/tableComp";
import { useRouter } from "next/navigation";
import { transformPayload } from "@/utils/managementFormUtils";
import { useAuthJHipster } from "@/context/JHipsterContext";
import "./page.css";


const AddProductCategoryPage = () => {
  let [categoryName, setCategoryName] = useState("");
  const [customFields, setCustomFields] = useState([]);

  const [currentFieldIndex, setCurrentFieldIndex] = useState(-1);

  const [entityType, setEntityType] = useState("Product");
  const [parentEntityName, setParentEntityName] = useState("");
  const [relationships, setAllRelationships] = useState([]);
  const { jHipsterAuthToken } = useAuthJHipster();

  const [relationshipConfigs, setRelationshipConfigs] = useState([
    { entityType: "", relationshipType: "" },
  ]);

  console.log('relationshipConfigs<>!?!>', relationshipConfigs);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${apiUrlSpring}/api/jdl/get-all-entities`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jHipsterAuthToken}`,
        },
      });

      if (!response.ok) {
        console.error("Error fetching data from API");
        return;
      }

      const data = await response.json();
      console.log("show me the data", data);

      const detailsRequest = data.map((entity) =>
        fetch(`${apiUrlSpring}/api/jdl/get-entity-by-id/${entity.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jHipsterAuthToken}`,
          },
        }).then((res) => res.json())
      );

      const detailsResponse = await Promise.all(detailsRequest);
      let detailsResponseEntityNames = detailsResponse.map(
        (entity) => entity.entityName
      );
      setAllRelationships(detailsResponseEntityNames);
    };

    if (jHipsterAuthToken) {
      fetchData();
    }
  }, [jHipsterAuthToken]);


  const handleOpenApiDialog = (index) => {
    if (index < 0 || index >= customFields.length) {
      console.error("Invalid index for custom fields array");
      return;
    }

    const field = customFields[index];
    if (!field) {
      console.error("Field data is undefined at index", index);
      return;
    }

    const currentApiDetails = field.apiDetails || {
      apiUrl: "",
      headers: [{ key: "", value: "" }],
      payloadBody: "",
      responseParser: [{ key: "", value: "" }],
    };

    console.log(
      "Opening API Dialog for index:",
      index,
      "API Details:",
      currentApiDetails
    );

    setCurrentFieldIndex(index);

    console.log("apiDetails at Dialog Open:", currentApiDetails.responseParser);
  };

  useEffect(() => {
    if (currentFieldIndex >= 0 && currentFieldIndex < customFields.length) {
      const apiDetails = customFields[currentFieldIndex].apiDetails || {
        apiUrl: "",
        headers: [{ key: "", value: "" }],
        payloadBody: "",
      };
      console.log("Setting API details from useEffect", apiDetails);
    }
  }, [currentFieldIndex, customFields]);

  const setApiFieldIndex = (index) => {
    if (index >= 0 && index < customFields.length) {
      setCurrentFieldIndex(index);
    }
  };

  // add relationship configuration
  const handleEntityTypeChange = (index, value) => {
    const newConfigs = [...relationshipConfigs];
    newConfigs[index].entityType = value;
    setRelationshipConfigs(newConfigs);
  };

  const handleRelationshipTypeChange = (index, value) => {
    const newConfigs = [...relationshipConfigs];
    console.log('the value is', value);
    newConfigs[index].relationshipType = value;
    setRelationshipConfigs(newConfigs);
  };

  const addRelationshipConfig = () => {
    setRelationshipConfigs((prevConfigs) => [
      ...prevConfigs,
      { entityType: "", relationshipType: "" },
    ]);
  };

  const removeRelationshipConfig = (index) => {
    setRelationshipConfigs((prevConfigs) =>
      prevConfigs.filter((_, idx) => idx !== index)
    );
  };
  //

  const [file, setFile] = useState(null);
  const router = useRouter();

  const validationRules = {
    String: ["min", "max", "unique"],
    Integer: ["min", "max", "unique"],
    Long: ["min", "max", "unique"],
    // BigDecimal: ["min", "max", "unique"],
    Float: ["min", "max", "unique"],
    // Double: ["min", "max", "unique"],
    Enum: ["unique"],
    Boolean: ["unique"],
    LocalDate: ["unique"],
    ZonedDateTime: ["unique"],
    Instant: ["unique"],
    Duration: ["unique"],
    UUID: ["unique"],
    Blob: ["unique"],
    AnyBlob: ["unique"],
    ImageBlob: ["unique"],
    TextBlob: ["unique"],
  };

  const typeOptions = [
    "String",
    "Integer",
    "Long",
    "Float",
    "Enum",
    "Boolean",
    "LocalDate",
    "ZonedDateTime",
    "Instant",
    "Duration",
    "UUID",
    "Blob",
    "AnyBlob",
    "ImageBlob",
    "TextBlob",
  ];

  const handleFieldChange = (index, field, value) => {
    const updatedFields = customFields.map((cf, i) =>
      i === index ? { ...cf, [field]: value } : cf
    );
    setCustomFields(updatedFields);
  };

  const handleTypeChange = (index, newValue) => {
    const updatedFields = customFields.map((field, idx) => {
      if (idx === index) {
        let newValidations = {};
        if (validationRules[newValue]) {
          validationRules[newValue].forEach((rule) => {
            newValidations[rule] = field.validations[rule] || "";
          });
        }
        return { ...field, type: newValue, validations: newValidations };
      }
      return field;
    });
    setCustomFields(updatedFields);
  };

  const handleValidationChange = (index, validationKey, value) => {
    const updatedFields = customFields.map((field, idx) => {
      if (idx === index) {
        const validations = { ...field.validations };
        validations[validationKey] = value;
        return { ...field, validations };
      }
      return field;
    });
    setCustomFields(updatedFields);
  };

  const addField = () => {
    const newField = {
      key: "",
      type: "String",
      required: false,
      validations: { min: "", max: "", unique: false },
    };
    setCustomFields([...customFields, newField]);
  };

  const removeField = (index) => {
    if (index > 1) {
      const updatedFields = customFields.filter((_, i) => i !== index);
      setCustomFields(updatedFields);
    }
  };

  const [data, setData] = useState({});

  const apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;

  // const transformRelationships = (selectedRelationships, entityType) => {
  //   return selectedRelationships.map((rel) => {
  //     const cleanEntityType = entityType.trim();
  //     const cleanLabel = rel.label.trim().toLowerCase();

  //     const pluralLabel = cleanLabel.endsWith("s")
  //       ? `${cleanLabel}es`
  //       : `${cleanLabel}s`;

  //     return {
  //       relationshipType: "ManyToMany",
  //       relationshipFrom: `${cleanEntityType}{${pluralLabel}(name)}`,
  //       relationshipTo: rel.label.trim(),
  //     };
  //   });
  // };

  const transformRelationships = (relationshipConfigs, categoryName) => {
    return relationshipConfigs.map((rel) => {
      const cleanEntityType = categoryName.trim();
      const cleanLabel = rel.entityType.trim().toLowerCase();
  
      const pluralLabel = cleanLabel.endsWith("s")
        ? `${cleanLabel}es`
        : `${cleanLabel}s`;
  
      return {
        relationshipType: rel.relationshipType, 
        relationshipFrom: `${cleanEntityType}{${pluralLabel}(name)}`,
        relationshipTo: rel.entityType.trim(),
      };
    });
  };
  

  const handleSubmitApi = (e) => {
    e.preventDefault();
    if (!/^[A-Z]/.test(categoryName)) {
      categoryName =
        categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    }

    console.log("relationshipConfigs", relationshipConfigs);

    // const transformedRelationships = transformRelationships(
    //   selectedRelationships,
    //   categoryName
    // );

    const transformedRelationships = transformRelationships(relationshipConfigs, categoryName);

    console.log(
      "Transformed Relationships for Submission:",
      transformedRelationships
    );

    const enhancedCustomFields = customFields.map((field) => {
      return {
        ...field,
      };
    });

    console.log("Enhanced Custom Fields:", enhancedCustomFields);

    let payload = {
      entityName: categoryName,
      entityType: entityType,
      parentEntityName: entityType === "Variant" ? parentEntityName : "",
      customFields,
    };

    let transformedPayload = transformPayload(payload);
    console.log("transformedPayload", transformedPayload);
    transformedPayload.enableSearch = false;
    transformedPayload.externalFlag = false;
    transformedPayload.searchFields = [];
    transformedPayload.externalAttributesMetaData = [];
    transformedPayload.relationships = transformedRelationships;

    console.log(
      "Initial Transformed Payload:",
      JSON.stringify(transformedPayload, null, 2)
    );

    console.log(
      "Final Transformed Payload with External Attributes MetaData:",
      JSON.stringify(transformedPayload, null, 2)
    );

    const sendDataToApi = async () => {
      try {
        const response = await fetch(`${apiUrlSpring}/api/jdl/create-entity`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jHipsterAuthToken}`,
          },
          body: JSON.stringify([transformedPayload]),
        });
        console.log("Request sent, response status:", response.status);
      } catch (e) {
        console.error("Error sending data:", e);
      } finally {
        setData(payload);
      }
    };

    sendDataToApi();
  };

  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const validateCategoryName = useCallback(
    debounce((name) => {
      if (name.endsWith("s")) {
        setErrorCategoryErrorName('Category name should not end with "s"');
      } else {
        setErrorCategoryErrorName("");
      }
    }, 1000),
    []
  );

  useEffect(() => {
    const handler = debounce(() => {
      if (categoryName.endsWith("s")) {
        setErrorCategoryErrorName('Category name should not end with "s"');
      } else {
        setErrorCategoryErrorName("");
      }
    }, 1000);

    handler();

    return () => {
      clearTimeout(handler);
    };
  }, [categoryName]);

  const [categoryErrorName, setErrorCategoryErrorName] = useState("");

  const handleCategoryNameChange = (e) => {
    let value = e.target.value;
    setCategoryName(value);
    validateCategoryName(value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmitFile = (e) => {
    e.preventDefault();

    if (file) {
      console.log("Sending file to the API...", file);
    } else {
      console.log("No file selected");
    }
  };

  const handlePressManageButton = () => {
    router.push(
      "/backoffice/owner/addInitialProductCategory/manage-meta-category"
    );
  };
  
  const transformedRelationships = relationships.map((name) => ({
    value: name,
    label: name,
  }));

  console.log("transformedRelationships", transformedRelationships);

  return (
    <Container
      maxWidth="md"
      className="input-form-move"
      style={{ width: "900px", marginTop: "20px" }}
    >
      {Object.keys(data).length == 0 && (
        <Paper elevation={3} style={{ padding: "20px" }}>
          <div className="flex justify-between">
            <h1>Add Meta Product Type</h1>
            <Button
              onClick={handlePressManageButton}
              style={{ height: "30px" }}
            >
              Manage Fields
            </Button>
          </div>
          <form onSubmit={handleSubmitApi}>
            <TextField
              fullWidth
              value={categoryName}
              onChange={(e) => handleCategoryNameChange(e)}
              label="Travel Product Type Name"
              margin="normal"
              required
            />
            {categoryErrorName && (
              <p style={{ color: "red" }}>{categoryErrorName}</p>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel id="entity-type-label">Entity Type</InputLabel>
              <Select
                labelId="entity-type-label"
                id="entity-type-select"
                value={entityType}
                label="Entity Type"
                onChange={(e) => setEntityType(e.target.value)}
                required
              >
                <MenuItem value="Product">Product</MenuItem>
                <MenuItem value="Variant">Variant</MenuItem>
                <MenuItem value="Reference">Reference</MenuItem>
              </Select>
            </FormControl>

            {entityType === "Variant" && (
              <TextField
                fullWidth
                value={parentEntityName}
                onChange={(e) => setParentEntityName(e.target.value)}
                label="Parent Entity Name"
                margin="normal"
                required
              />
            )}

            <div>
              <Button
                onClick={addRelationshipConfig}
                style={{ marginBottom: "10px" }}
              >
                Add Relationship
              </Button>

              {relationshipConfigs.map((config, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel id={`entity-type-label-${index}`}>
                      Entity Type
                    </InputLabel>
                    <Select
                      labelId={`entity-type-label-${index}`}
                      value={config.entityType}
                      onChange={(e) =>
                        handleEntityTypeChange(index, e.target.value)
                      }
                      label="Entity Type"
                    >
                      {relationships.map((type) => (
                        <MenuItem key={`${type}-${index}`} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>


                  <FormControl fullWidth>
                    <InputLabel id={`relationship-type-label-${index}`}>
                      Relationship Type
                    </InputLabel>
                    <Select
                      labelId={`relationship-type-label-${index}`}
                      value={config.relationshipType}
                      onChange={(e) =>
                        handleRelationshipTypeChange(index, e.target.value)
                      }
                      label="Relationship Type"
                      disabled={!config.entityType} 
                    >
                      <MenuItem value="OneToMany">OneToMany</MenuItem>
                      <MenuItem value="ManyToOne">ManyToOne</MenuItem>
                      <MenuItem value="ManyToMany">ManyToMany</MenuItem>
                      <MenuItem value="OneToOne">OneToOne</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    onClick={() => removeRelationshipConfig(index)}
                    color="primary"
                    variant="contained"
                    style={{ padding: "5px" }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <CustomTable
              data={customFields}
              handleFieldChange={handleFieldChange}
              handleValidationChange={handleValidationChange}
              handleTypeChange={handleTypeChange}
              removeField={removeField}
              typeOptions={typeOptions}
              validationRules={validationRules}
              mode="fields"
              setApiFieldIndex={setApiFieldIndex}
              handleOpenApiDialog={handleOpenApiDialog}
            />
            <div>
              <input
                type="file"
                onChange={handleFileChange}
                style={{
                  display: "block",
                  marginBottom: "8px",
                  marginTop: "10px",
                  marginLeft: "10px",
                  width: "32%",
                  cursor: "pointer",
                }}
              />
              {file && (
                <Button
                  sx={{ width: "18%", marginLeft: "8px" }}
                  type="button"
                  onClick={handleSubmitFile}
                  variant="contained"
                  color="primary"
                >
                  Upload File
                </Button>
              )}
            </div>

            <Button onClick={addField} style={{ margin: "10px" }}>
              Add Field
            </Button>
            <Button type="submit" color="primary">
              Save
            </Button>
          </form>
        </Paper>
      )}

      {Object.keys(data).length > 0 && (
        <Paper elevation={3} style={{ padding: "20px" }}>
          <div className="flex justify-between">
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              sx={{ marginBottom: 2, marginTop: 2 }}
            >
              <Typography
                sx={{ fontWeight: "medium" }}
                variant="h6"
                component="div"
              >
                Entity Name:
              </Typography>
              <Typography
                style={{ marginTop: "3px" }}
                variant="subtitle1"
                component="span"
              >
                {data.entityName.toUpperCase()}
              </Typography>
            </Box>
            <Button
              onClick={handlePressManageButton}
              style={{ height: "30px" }}
            >
              Manage Fields
            </Button>
          </div>

          <CustomTable
            data={data.customFields || []}
            handleFieldChange={handleFieldChange}
            handleValidationChange={handleValidationChange}
            handleTypeChange={handleTypeChange}
            removeField={addField}
            typeOptions={typeOptions}
            validationRules={validationRules}
            mode="products"
            optEntity={data.entityName}
          />
        </Paper>
      )}
    </Container>
  );
};

export default AddProductCategoryPage;
