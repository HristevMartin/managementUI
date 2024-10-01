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
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { MdRemoveCircle } from "react-icons/md";
import "./page.css";

const AddProductCategoryPage = () => {
  let [categoryName, setCategoryName] = useState("");
  const [customFields, setCustomFields] = useState([]);

  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(-1);
  const [apiDetails, setApiDetails] = useState({
    apiUrl: "",
    headers: [{ key: "", value: "" }],
    payloadBody: "",
    responseParser: [{ key: "", value: "" }],
  });
  const [entityType, setEntityType] = useState("Product");
  const [parentEntityName, setParentEntityName] = useState("");

  console.log("Initial API Details setup:", apiDetails.responseParser);

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
    setApiDetails(currentApiDetails);
    setApiDialogOpen(true);
  };

  useEffect(() => {
    if (currentFieldIndex >= 0 && currentFieldIndex < customFields.length) {
      const apiDetails = customFields[currentFieldIndex].apiDetails || {
        apiUrl: "",
        headers: [{ key: "", value: "" }],
        payloadBody: "",
      };
      console.log("Setting API details from useEffect", apiDetails);
      setApiDetails(apiDetails);
    }
  }, [currentFieldIndex, customFields]);

  const handleCloseApiDialog = () => setApiDialogOpen(false);

  const handleApiDetailsChange = (field, index, key, value) => {
    console.log("Changing API Details:", field, index, key, value);
    setApiDetails((prev) => {
      const newState = { ...prev };

      if (field === "headers") {
        newState.headers = newState.headers.map((header, idx) => {
          if (idx === index) {
            return { ...header, [key]: value };
          }
          return header;
        });
      } else if (field === "responseParser") {
        newState.responseParser = newState.responseParser.map((parser, idx) => {
          if (idx === index) {
            return { ...parser, [key]: value };
          }
          return parser;
        });
      } else {
        newState[field] = value;
      }

      return newState;
    });
    console.log("Updated apiDetails:", apiDetails.responseParser);
    console.log("API Details after change:", apiDetails);
  };

  const addHeader = () => {
    setApiDetails((prev) => ({
      ...prev,
      headers: [...prev.headers, { key: "", value: "" }],
    }));
  };

  const removeHeader = (index) => {
    const filteredHeaders = apiDetails.headers.filter(
      (_, idx) => idx !== index
    );
    setApiDetails((prev) => ({ ...prev, headers: filteredHeaders }));
  };

  const toggleApiDialog = (open) => {
    setApiDialogOpen(open);
  };

  const setApiFieldIndex = (index) => {
    if (index >= 0 && index < customFields.length) {
      setCurrentFieldIndex(index);
      toggleApiDialog(true);
    }
  };

  const handleSaveApiDetails = () => {
    if (currentFieldIndex !== -1) {
      const updatedCustomFields = customFields.map((field, idx) => {
        if (idx === currentFieldIndex) {
          return { ...field, apiDetails: apiDetails };
        }
        return field;
      });

      setCustomFields(updatedCustomFields);
      handleCloseApiDialog();
    }
  };

  const fieldTemplates = {
    Flight: [
      {
        key: "name",
        type: "String",
        required: true,
        validations: { unique: true },
      },
      { key: "price", type: "BigDecimal", required: false, validations: {} },
      {
        key: "flightId",
        type: "String",
        required: true,
        validations: { unique: true },
      },
      { key: "flightNumber", type: "String", required: true, validations: {} },
      { key: "origin", type: "String", required: true, validations: {} },
      { key: "destination", type: "String", required: true, validations: {} },
      {
        key: "departureDateTime",
        type: "ZonedDateTime",
        required: false,
        validations: {},
      },
      {
        key: "arrivalDateTime",
        type: "ZonedDateTime",
        required: false,
        validations: {},
      },
      { key: "Duration", type: "String", required: false, validations: {} },
      { key: "airport", type: "String", required: false, validations: {} },
      { key: "carrier", type: "String", required: false, validations: {} },
    ],
    Hotel: [
      {
        key: "name",
        type: "String",
        required: true,
        validations: { unique: true },
      },
      {
        key: "price",
        type: "Double",
        required: true,
        validations: {},
        apiDetails: {
          apiUrl: "",
          headers: [],
          payloadBody: "",
          responseParser: [],
        },
      },
      { key: "city", type: "String", required: true, validations: {} },
      { key: "address", type: "String", required: false, validations: {} },
      { key: "postalCode", type: "String", required: false, validations: {} },
      { key: "facilities", type: "String", required: false, validations: {} },
      { key: "images", type: "String", required: false, validations: {} },
      { key: "guests", type: "Integer", required: true, validations: {} },
      { key: "locationId", type: "String", required: false, validations: {} },
      { key: "checkInTime", type: "String", required: false, validations: {} },
      { key: "checkOutTime", type: "String", required: false, validations: {} },
      { key: "description", type: "String", required: false, validations: {} },
      {
        key: "reviews",
        type: "String",
        required: false,
        validations: {},
        apiDetails: {
          apiUrl: "",
          headers: [],
          method: "GET",
          payload: "",
          responseParser: [],
        },
      },
    ],
    Room: [
      {
        key: "name",
        type: "String",
        required: true,
        validations: { unique: true },
      },
      { key: "price", type: "Double", required: true, validations: {} },
      { key: "images", type: "String", required: false, validations: {} },
      { key: "guestCount", type: "Integer", required: true, validations: {} },
      { key: "size", type: "String", required: false, validations: {} },
      { key: "facilities", type: "String", required: false, validations: {} },
      { key: "hotelName", type: "String", required: true, validations: {} },
      { key: "description", type: "String", required: false, validations: {} },
    ],
    Adon: [
      {
        key: "name",
        type: "String",
        required: true,
        validations: { unique: true },
      },
      { key: "description", type: "String", required: false, validations: {} },
      { key: "images", type: "String", required: false, validations: {} },
      { key: "destination", type: "String", required: false, validations: {} },
      { key: "addOnType", type: "String", required: false, validations: {} },
      { key: "price", type: "Double", required: true, validations: {} },
      { key: "tags", type: "String", required: false, validations: {} },
    ],
    Bundle: [
      {
        key: "name",
        type: "String",
        required: true,
        validations: { unique: true },
      },
      { key: "description", type: "String", required: false, validations: {} },
      { key: "origin", type: "String", required: false, validations: {} },
      { key: "destination", type: "String", required: false, validations: {} },
      { key: "images", type: "String", required: false, validations: {} },
      { key: "transport", type: "String", required: false, validations: {} },
      {
        key: "accommodation",
        type: "String",
        required: false,
        validations: {},
      },
      { key: "addOns", type: "String", required: false, validations: {} },
      { key: "tags", type: "String", required: false, validations: {} },
      { key: "price", type: "Double", required: false, validations: {} },
      { key: "date", type: "ZonedDateTime", required: false, validations: {} },
    ],
  };

  useEffect(() => {
    const formattedCategoryName =
      categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    if (fieldTemplates[formattedCategoryName]) {
      setCustomFields(fieldTemplates[formattedCategoryName]);
    } else {
      setCustomFields([]);
    }
  }, [categoryName]);

  const { jHipsterAuthToken } = useAuthJHipster();

  const [file, setFile] = useState(null);
  const router = useRouter();

  const validationRules = {
    String: ["min", "max", "unique"],
    Integer: ["min", "max", "unique"],
    Long: ["min", "max", "unique"],
    BigDecimal: ["min", "max", "unique"],
    Float: ["min", "max", "unique"],
    Double: ["min", "max", "unique"],
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
    "BigDecimal",
    "Float",
    "Double",
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
      external: false,
      apiDetails: {
        apiUrl: "",
        headers: [],
        method: "GET",
        payload: "",
        responseParser: [],
      },
    };
    console.log(
      "Adding new field with responseParser:",
      newField.apiDetails.responseParser
    );
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

  const handleSubmitApi = (e) => {

    e.preventDefault();
    if (!/^[A-Z]/.test(categoryName)) {
      categoryName =
        categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    }

    console.log("Custom Fields:", customFields);

    const enhancedCustomFields = customFields.map((field) => {
      return {
        ...field,
        external:
          field.external && field.apiDetails && field.apiDetails.apiUrl
            ? true
            : undefined,
      };
    });

    console.log("Enhanced Custom Fields:", enhancedCustomFields);

    let payload = {
      entityName: categoryName,
      entityType: entityType,
      parentEntityName: entityType === "Variant" ? parentEntityName : "",
      customFields: enhancedCustomFields,
    };

    let transformedPayload = transformPayload(payload);
    console.log("transformedPayload", transformedPayload);
    transformedPayload.enableSearch = false;
    transformedPayload.externalFlag = false;
    transformedPayload.searchFields = [];
    transformedPayload.externalAttributesMetaData = [];

    console.log(
      "Initial Transformed Payload:",
      JSON.stringify(transformedPayload, null, 2)
    );

    enhancedCustomFields.forEach((field) => {
      if (field.external && field.apiDetails && field.apiDetails.apiUrl) {
        transformedPayload.externalAttributesMetaData.push({
          attributeName: field.key,
          externalUrl: field.apiDetails.apiUrl,
          headers: field.apiDetails.headers,
          payload: field.apiDetails.payloadBody
            ? JSON.parse(field.apiDetails.payloadBody.trim())
            : {},
          responseParser: field.apiDetails.responseParser,
          mockup: false,
        });
      }
    });

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
    router.push("/backoffice/owner/addInitialProductCategory/manage-meta-category");
  };

  const addParser = () => {
    setApiDetails((prev) => ({
      ...prev,
      responseParser: [...prev.responseParser, { key: "", value: "" }],
    }));
  };

  const removeParser = (index) => {
    const filteredParsers = apiDetails.responseParser.filter(
      (_, idx) => idx !== index
    );
    setApiDetails((prev) => ({ ...prev, responseParser: filteredParsers }));
  };

  if (!Array.isArray(apiDetails.responseParser)) {
    console.log(
      "Expected responseParser to be an array, but got:",
      typeof apiDetails.responseParser
    );
    return;
  }

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

            <CustomTable
              data={customFields}
              handleFieldChange={handleFieldChange}
              handleValidationChange={handleValidationChange}
              handleTypeChange={handleTypeChange}
              removeField={removeField}
              typeOptions={typeOptions}
              validationRules={validationRules}
              mode="fields"
              toggleApiDialog={toggleApiDialog}
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
          {/*  */}
          <Dialog open={apiDialogOpen} onClose={handleCloseApiDialog}>
            <DialogTitle>API Specifications</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="API URL"
                type="text"
                fullWidth
                value={apiDetails.apiUrl}
                onChange={(e) =>
                  handleApiDetailsChange("apiUrl", null, null, e.target.value)
                }
              />
              {apiDetails.headers.map((header, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <TextField
                    label="Header Key"
                    type="text"
                    value={header.key}
                    onChange={(e) =>
                      handleApiDetailsChange(
                        "headers",
                        index,
                        "key",
                        e.target.value
                      )
                    }
                    style={{ marginRight: "10px", flex: 1 }}
                  />
                  <TextField
                    label="Header Value"
                    type="text"
                    value={header.value}
                    onChange={(e) =>
                      handleApiDetailsChange(
                        "headers",
                        index,
                        "value",
                        e.target.value
                      )
                    }
                    style={{ flex: 1 }}
                  />
                  <IconButton onClick={() => removeHeader(index)}>
                    <MdRemoveCircle />
                  </IconButton>
                </div>
              ))}
              <Button onClick={addHeader}>Add Header</Button>

              {apiDetails?.responseParser.map((parser, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <TextField
                    label="Parser Key"
                    type="text"
                    value={parser.key}
                    onChange={(e) =>
                      handleApiDetailsChange(
                        "responseParser",
                        index,
                        "key",
                        e.target.value
                      )
                    }
                    style={{ marginRight: "10px", flex: 1 }}
                  />
                  <TextField
                    label="Parser Value"
                    type="text"
                    value={parser.value}
                    onChange={(e) =>
                      handleApiDetailsChange(
                        "responseParser",
                        index,
                        "value",
                        e.target.value
                      )
                    }
                    style={{ flex: 1 }}
                  />
                  <IconButton onClick={() => removeParser(index)}>
                    <MdRemoveCircle />
                  </IconButton>
                </div>
              ))}
              <Button onClick={addParser}>Add Parser</Button>
              {/*  */}

              <TextField
                margin="dense"
                label="Payload Body"
                type="text"
                multiline
                rows={4}
                fullWidth
                value={apiDetails.payloadBody}
                onChange={(e) =>
                  handleApiDetailsChange(
                    "payloadBody",
                    null,
                    null,
                    e.target.value
                  )
                }
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseApiDialog}>Cancel</Button>
              <Button onClick={handleSaveApiDetails}>Save</Button>
            </DialogActions>
          </Dialog>

          {/*  */}
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
