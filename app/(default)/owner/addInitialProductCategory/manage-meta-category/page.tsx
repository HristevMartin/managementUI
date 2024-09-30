"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAuthJHipster } from "@/context/JHipsterContext";
import {
  transformMetaCategoryData,
  transformPayload,
} from "@/utils/managementFormUtils";
import "./page.css";

const ManageMetaCategory = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);
  const [editFieldIndex, setEditFieldIndex] = useState(null);
  const [fieldEdits, setFieldEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [selectedCategoriesForDeletion, setSelectedCategoriesForDeletion] =
    useState([]);
  const { jHipsterAuthToken } = useAuthJHipster();
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(null);
  const [apiDetails, setApiDetails] = useState({
    apiUrl: "",
    headers: [],
    parsers: [],
    payloadBody: {},
  });
  const [tempApiChanges, setTempApiChanges] = useState({});
  const [currentEditingFieldKey, setCurrentEditingFieldKey] = useState(null);

  console.log("tempApiChanges:", tempApiChanges);

  const saveModalChanges = () => {
    try {
      const newApiDetails = {
        ...apiDetails,
        payload: apiDetails.payloadBody,
      };

      setTempApiChanges({
        attributeName: currentEditingFieldKey,
        externalUrl: newApiDetails.apiUrl,
        headers: newApiDetails.headers,
        payload: newApiDetails.payload,
        responseParser: newApiDetails.parsers,
        mockup: false,
      });

      console.log("Saving modal changes:", newApiDetails);
      setIsApiModalOpen(false);
    } catch (error) {
      console.error("Failed to parse JSON for payload:", error);
    }
  };

  console.log("Temporary API changes saved:", tempApiChanges);

  console.log("isApiModalOpen:", isApiModalOpen);

  const apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;

  async function apiDeleteCategories(categoriesToDelete) {
    console.log("categoriesToDelete:", categoriesToDelete);
    const payloads = categoriesToDelete.map((category) => ({
      entityName: category.entityName,
      categoryId: category.categoryId,
    }));

    try {
      const response = await fetch(`${apiUrlSpring}/api/jdl/delete-entity`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jHipsterAuthToken}`,
        },
        body: JSON.stringify(payloads),
      });
      if (!response.ok) {
        console.log("Failed to delete categories:", response);
        // throw new Error('Failed to delete categories:', response.statusText);
      }
      console.log("Delete response:", data);
    } catch (error) {
      console.error("Failed to delete categories:", error);
    }
  }

  const handleBulkDelete = async () => {
    const categoriesToDelete = selectedCategoriesForDeletion;
    console.log("Deleting categories:", categoriesToDelete);

    await apiDeleteCategories(categoriesToDelete);

    const remainingCategories = productTypes.filter(
      (type) =>
        !categoriesToDelete.some((cat) => cat.categoryId === type.categoryId)
    );

    setProductTypes(remainingCategories);
    setShowBulkDeleteDialog(false);
    setSelectedCategoriesForDeletion([]);

    if (remainingCategories.length > 0) {
      setSelectedProductType(remainingCategories[0]);
      setSelectedFields(remainingCategories[0].customFields || []);
    } else {
      setSelectedProductType(null);
      setSelectedFields([]);
    }
  };

  const [newField, setNewField] = useState({
    key: "",
    type: "",
    required: false,
    min: "",
    max: "",
    unique: false,
  });

  useEffect(() => {
    if (jHipsterAuthToken) {
      // Ensure token is available before fetching
      const fetchData = async () => {
        setLoading(true);
        try {
          console.log("sending..");
          const response = await fetch(
            `${apiUrlSpring}/api/jdl/get-all-entities`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${jHipsterAuthToken}`,
              },
            }
          );
          let entities = await response.json();
          console.log("raw data:", entities);

          const detailsRequests = entities.map((entity) =>
            fetch(`${apiUrlSpring}/api/jdl/get-entity-by-id/${entity.id}`, {
              method: "GET",
              headers: { Authorization: `Bearer ${jHipsterAuthToken}` },
            }).then((res) => res.json())
          );

          const entitiesDetails = await Promise.all(detailsRequests);

          let data = entitiesDetails.map((detail) => ({
            entityName: detail.entityName,
            fields: detail.fields,
            relationships: detail.relationships || [],
            externalAttributesMetaData: detail.externalAttributesMetaData || [],
            categoryId: detail.categoryId || 0,
            oldEntityName: detail.oldEntityName,
            newEntityName: detail.newEntityName,
          }));

          data = transformMetaCategoryData(data);
          console.log("the data:", data);
          // check external data here
          setProductTypes(data);
          if (data.length > 0) {
            setSelectedProductType(data[0]);
            console.log("data[0].customFields", data[0].customFields);
            setSelectedFields(data[0].customFields || []);
            // add the external attributes as well.
          }
        } catch (err) {
          setError("There is not data available");
          console.error(err);
        }
        setLoading(false);
      };

      fetchData();
    } else {
      console.log("Token not available, fetching token...");
      // Potentially trigger token fetch or wait for token to be set
    }
  }, [jHipsterAuthToken]);

  const handleDelete = (index) => {
    setOpenDeleteDialog(true);
    setEditFieldIndex(index);
    console.log("index:", index);
  };

  const deleteField = async () => {
    if (editFieldIndex !== null) {
      const updatedFields = selectedFields.filter(
        (_, idx) => idx !== editFieldIndex
      );
      setSelectedFields(updatedFields);
      setOpenDeleteDialog(false);
      setEditFieldIndex(null);

      // send this payload to api.
      console.log("updatedFields:", updatedFields);
      // give me the field that's being deleted
      console.log(
        "selectedFields[editFieldIndex]:",
        selectedFields[editFieldIndex]
      );
    }

    // send request to api to delete field
  };

  const handleEditChange = (key, value) => {
    if (key === "type") {
      const newValidations = {};
      if (validationRules[value].includes("min")) {
        newValidations.min = fieldEdits.validations.min || "";
      }
      if (validationRules[value].includes("max")) {
        newValidations.max = fieldEdits.validations.max || "";
      }
      newValidations.unique = validationRules[value].includes("unique")
        ? fieldEdits.validations.unique
        : false;

      setFieldEdits((prev) => ({
        ...prev,
        type: value,
        validations: newValidations,
      }));
    } else if (key.startsWith("validations.")) {
      const validationKey = key.split(".")[1];
      setFieldEdits((prev) => ({
        ...prev,
        validations: {
          ...prev.validations,
          [validationKey]: value,
        },
      }));
    } else {
      setFieldEdits((prev) => ({ ...prev, [key]: value }));
    }
  };

  const saveEdit = async () => {
    const updatedFields = selectedFields.map((field, idx) => {
      return idx === editFieldIndex ? { ...fieldEdits } : field;
    });

    setSelectedFields(updatedFields);
    setEditFieldIndex(null);

    const allExternalAttributes = selectedProductType.externalAttributes.map(
      (attr) => {
        if (attr.attributeName === tempApiChanges.attributeName) {
          console.log(
            `Applying changes for ${attr.attributeName}:`,
            tempApiChanges
          );
          return { ...attr, ...tempApiChanges };
        }
        return attr;
      }
    );

    console.log(
      "Merged External Attributes:",
      JSON.stringify(allExternalAttributes, null, 2)
    );

    const payload = {
      entityName: selectedProductType.entityName,
      fields: updatedFields.map(
        (field) =>
          `${field.key} ${field.type}${field.required ? " required" : ""}${
            field.external ? " external" : ""
          }`
      ),
      externalAttributesMetaData: allExternalAttributes.map((attr) => {
        if (typeof attr.payload === "string") {
          try {
            attr.payload = JSON.parse(attr.payload);
          } catch (error) {
            console.error("Failed to parse payload:", error);
            attr.payload = {};
          }
        }
        return attr;
      }),
      relationships: [],
    };

    console.log("Final Transformed Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${apiUrlSpring}/api/jdl/update-entity`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jHipsterAuthToken}`,
      },
      body: JSON.stringify([payload]),
    });
    console.log("response!?!!:", response);
  };

  const cancelEdit = () => {
    setEditFieldIndex(null);
    setFieldEdits({});
  };

  const startEdit = (index) => {
    setEditFieldIndex(index);
    setFieldEdits({ ...selectedFields[index] });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const handleSaveNewField = () => {
    let updatedFields = [...selectedFields, newField];
    setSelectedFields(updatedFields);
    setShowAddField(false);
    setNewField({
      key: "",
      type: "",
      min: "",
      max: "",
      unique: false,
      required: false,
    });

    // send this payload to api.
    console.log("updatedFields:", updatedFields);
    // send request to api to save new custom field
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

  const handleExternalToggle = (index) => {
    const field = selectedFields[index];
    let externalDetails;

    if (!Array.isArray(selectedProductType.externalAttributes)) {
      selectedProductType.externalAttributes = [];
    }

    externalDetails = selectedProductType.externalAttributes.find(
      (attr) => attr.attributeName === field.key
    );

    field.external = !field.external;

    if (field.external) {
      if (!externalDetails) {
        externalDetails = {
          attributeName: field.key,
          externalUrl: "",
          headers: [],
          payload: "",
          responseParser: [],
          mockup: false,
        };
        selectedProductType.externalAttributes.push(externalDetails);
      }

      setApiDetails({
        apiUrl: externalDetails.externalUrl,
        headers: externalDetails.headers,
        payloadBody: externalDetails.payload,
        parsers: externalDetails.responseParser,
      });

      setCurrentFieldIndex(index);
      setCurrentEditingFieldKey(field.key);
      setIsApiModalOpen(true);
    } else {
      setIsApiModalOpen(false);
    }

    const newFields = [...selectedFields];
    newFields[index] = field;
    setSelectedFields(newFields);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategoriesForDeletion((prevSelected) => {
      const index = prevSelected.findIndex(
        (cat) => cat.categoryId === category.categoryId
      );
      if (index >= 0) {
        return prevSelected.filter((_, i) => i !== index);
      } else {
        return [...prevSelected, category];
      }
    });
  };

  const handleHeaderChange = (index, field, value) => {
    const updatedHeaders = apiDetails.headers.map((header, idx) => {
      if (idx === index) {
        return { ...header, [field]: value };
      }
      return header;
    });
    setApiDetails((prev) => ({ ...prev, headers: updatedHeaders }));
  };

  const addHeader = () => {
    setApiDetails((prev) => ({
      ...prev,
      headers: [...prev.headers, { key: "", value: "" }],
    }));
  };

  const removeHeader = (index) => {
    setApiDetails((prev) => ({
      ...prev,
      headers: prev.headers.filter((_, idx) => idx !== index),
    }));
  };

  const addParser = () => {
    setApiDetails((prev) => ({
      ...prev,
      parsers: [...prev.parsers, { key: "", value: "" }],
    }));
  };

  const removeParser = (index) => {
    setApiDetails((prev) => ({
      ...prev,
      parsers: prev.parsers.filter((_, idx) => idx !== index),
    }));
  };

  const updateHeader = (index, field, value) => {
    const updatedHeaders = [...apiDetails.headers];
    updatedHeaders[index][field] = value;
    setApiDetails((prev) => ({ ...prev, headers: updatedHeaders }));
  };

  const updateParser = (index, field, value) => {
    const updatedParsers = [...apiDetails.parsers];
    updatedParsers[index][field] = value;
    setApiDetails((prev) => ({ ...prev, parsers: updatedParsers }));
  };

  const closeApiModal = () => {
    setIsApiModalOpen(false);
  };

  const updateApiUrl = (newUrl) => {
    setApiDetails((prevDetails) => ({
      ...prevDetails,
      apiUrl: newUrl,
    }));
  };

  const updatePayloadBody = (newBody) => {
    setApiDetails((prevDetails) => ({
      ...prevDetails,
      payloadBody: newBody,
    }));
  };

  return (
    <Container
      sx={{
        width: "900px",
      }}
      maxWidth="md"
      className="input-form-move"
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Manage Meta Product Types
      </Typography>
      <Autocomplete
        disablePortal
        options={productTypes}
        getOptionLabel={(option) => option.entityName}
        value={selectedProductType}
        onChange={(event, newValue) => {
          setSelectedProductType(newValue);
          setSelectedFields(newValue.customFields || []);
        }}
        disableClearable
        renderInput={(params) => (
          <TextField {...params} label="Select Category" />
        )}
      />
      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Key</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Data Type</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Min</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Max</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Unique</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Required</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>External</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedFields.map((field, idx) => (
              <TableRow key={idx}>
                {editFieldIndex === idx ? (
                  <>
                    <TableCell>
                      <TextField
                        value={fieldEdits.key}
                        onChange={(e) =>
                          handleEditChange("key", e.target.value)
                        }
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        select
                        value={fieldEdits.type}
                        onChange={(e) =>
                          handleEditChange("type", e.target.value)
                        }
                        fullWidth
                        size="small"
                        style={{ width: "100px" }}
                        variant="outlined"
                        SelectProps={{
                          native: true,
                        }}
                      >
                        {typeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </TextField>
                    </TableCell>

                    <TableCell>
                      {validationRules[fieldEdits.type]?.includes("min") && (
                        <TextField
                          label="Min"
                          type="number"
                          size="small"
                          value={fieldEdits.validations.min || ""}
                          onChange={(e) =>
                            handleEditChange("validations.min", e.target.value)
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {validationRules[fieldEdits.type]?.includes("max") && (
                        <TextField
                          label="Max"
                          type="number"
                          size="small"
                          value={fieldEdits.validations.max || ""}
                          onChange={(e) =>
                            handleEditChange("validations.max", e.target.value)
                          }
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      {validationRules[fieldEdits.type]?.includes("unique") && (
                        <Checkbox
                          checked={fieldEdits.validations.unique || false}
                          onChange={(e) =>
                            handleEditChange(
                              "validations.unique",
                              e.target.checked
                            )
                          }
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Checkbox
                        checked={fieldEdits.required || false}
                        onChange={(e) =>
                          handleEditChange("required", e.target.checked)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={field.external || false}
                        onChange={() => handleExternalToggle(idx)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => saveEdit()}>
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={cancelEdit}>
                        <CancelIcon />
                      </IconButton>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{field.key}</TableCell>
                    <TableCell>{field.type}</TableCell>
                    <TableCell>{field.validations.min}</TableCell>
                    <TableCell>{field.validations.max}</TableCell>
                    <TableCell>
                      <Checkbox checked={field.validations.unique} disabled />
                    </TableCell>
                    <TableCell>
                      <Checkbox checked={field.required} disabled />
                    </TableCell>
                    <TableCell>
                      <Checkbox checked={field.external} disabled />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => startEdit(idx)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(idx)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </>
                )}
                <Dialog
                  open={isApiModalOpen}
                  onClose={() => setIsApiModalOpen(false)}
                  fullWidth
                  maxWidth="sm"
                >
                  <DialogTitle>API Specifications</DialogTitle>
                  <DialogContent>
                    <TextField
                      label="API URL"
                      fullWidth
                      value={apiDetails.apiUrl}
                      onChange={(e) =>
                        setApiDetails((prev) => ({
                          ...prev,
                          apiUrl: e.target.value,
                        }))
                      }
                      margin="dense"
                    />
                    <div>
                      {apiDetails.headers.map((header, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                            marginTop: "14px",
                          }}
                        >
                          <TextField
                            label="Header Key"
                            value={header.key}
                            onChange={(e) =>
                              handleHeaderChange(index, "key", e.target.value)
                            }
                            style={{ marginRight: "10px" }}
                          />
                          <TextField
                            label="Header Value"
                            value={header.value}
                            onChange={(e) =>
                              handleHeaderChange(index, "value", e.target.value)
                            }
                          />
                          <IconButton onClick={() => removeHeader(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      ))}
                      <Button onClick={addHeader} variant="outlined">
                        Add Header
                      </Button>
                    </div>
                    <div style={{ marginTop: "8px", marginBottom: "8px" }}>
                      {apiDetails.parsers.map((parser, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                            marginTop: "14px",
                          }}
                        >
                          <TextField
                            label="Parser Key"
                            value={parser.key}
                            onChange={(e) =>
                              updateParser(index, "key", e.target.value)
                            }
                            style={{ marginRight: "10px" }}
                          />
                          <TextField
                            label="Parser Value"
                            value={parser.value}
                            onChange={(e) =>
                              updateParser(index, "value", e.target.value)
                            }
                          />
                          <IconButton onClick={() => removeParser(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      ))}
                      <Button onClick={addParser} variant="outlined">
                        Add Parser
                      </Button>
                    </div>
                    <TextField
                      label="Payload Body"
                      fullWidth
                      multiline
                      rows={4}
                      // value={apiDetails.payloadBody}
                      value={JSON.stringify(apiDetails.payloadBody, null, 2)}
                      onChange={(e) => updatePayloadBody(e.target.value)}
                      margin="dense"
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => closeApiModal()}>Cancel</Button>
                    {/* <Button onClick={() => saveApiDetails()}>Save</Button> */}
                    <Button onClick={saveModalChanges} color="primary">
                      Save
                    </Button>
                  </DialogActions>
                </Dialog>
              </TableRow>
            ))}
            {showAddField && (
              <TableRow>
                <TableCell>
                  <TextField
                    value={newField.key}
                    onChange={(e) =>
                      setNewField({ ...newField, key: e.target.value })
                    }
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    onChange={(e) =>
                      setNewField({ ...newField, type: e.target.value })
                    }
                    style={{ width: "120px" }}
                    size="small"
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {typeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </TextField>
                </TableCell>

                <TableCell>
                  {validationRules[newField.type]?.includes("min") && (
                    <TextField
                      value={newField.validations?.min || ""}
                      onChange={(e) =>
                        setNewField({
                          ...newField,
                          validations: {
                            ...newField.validations,
                            min: e.target.value,
                          },
                        })
                      }
                      size="small"
                      type="number"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {validationRules[newField.type]?.includes("max") && (
                    <TextField
                      value={newField.validations?.max || ""}
                      onChange={(e) =>
                        setNewField({
                          ...newField,
                          validations: {
                            ...newField.validations,
                            max: e.target.value,
                          },
                        })
                      }
                      size="small"
                      type="number"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={newField.validations?.unique || false}
                    onChange={(e) =>
                      setNewField({
                        ...newField,
                        validations: {
                          ...newField.validations,
                          unique: e.target.checked,
                        },
                      })
                    }
                  />
                </TableCell>

                <TableCell>
                  <Checkbox
                    checked={newField.required}
                    onChange={(e) =>
                      setNewField({ ...newField, required: e.target.checked })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={handleSaveNewField} color="primary">
                    Save
                  </Button>
                  <Button
                    onClick={() => setShowAddField(false)}
                    color="secondary"
                  >
                    Cancel
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex justify-between">
          <Button
            onClick={(e) => setShowAddField(true)}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Add New Field
          </Button>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            color="primary"
            onClick={() => setShowBulkDeleteDialog(true)}
          >
            Bulk Delete
          </Button>
          <Dialog
            open={showBulkDeleteDialog}
            onClose={() => setShowBulkDeleteDialog(false)}
          >
            <DialogTitle>Select Categories to Delete</DialogTitle>
            <DialogContent>
              {productTypes.map((type) => (
                <TableRow key={type.categoryId}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCategoriesForDeletion.some(
                        (cat) => cat.categoryId === type.categoryId
                      )}
                      onChange={() => handleSelectCategory(type)}
                    />
                  </TableCell>
                  <TableCell>{type.entityName}</TableCell>
                </TableRow>
              ))}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setShowBulkDeleteDialog(false)}
                color="primary"
              >
                Cancel
              </Button>
              <Button onClick={handleBulkDelete} color="primary">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </Paper>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this field?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={deleteField} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageMetaCategory;
