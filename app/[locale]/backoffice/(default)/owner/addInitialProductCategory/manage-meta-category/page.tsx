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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { useModal } from "@/context/useModal";

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

  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const [rawDataForRelationship, setRawDataForRelationship] = useState([]);
  const [selectedEntityType, setSelectedEntityType] = useState(null);
  const [selectedEntityTypeUpdate, setSelectedEntityTypeUpdate] =
    useState(false);
  const [newField, setNewField] = useState({
    key: "",
    type: "",
    required: false,
    min: "",
    max: "",
    unique: false,
  });

  const { showModal } = useModal();
  const [showAddRelationshipRow, setShowAddRelationshipRow] = useState(false);

  const apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;

  const relationshipOptions = productTypes.map((type) => type.entityName);

  const [newRelationship, setNewRelationship] = useState({
    relationshipType: "ManyToOne",
    relationshipFrom: "",
    relationshipTo: relationshipOptions[0],
  });


  useEffect(() => {
    if (productTypes.length > 0) {
      setNewRelationship((prevState) => ({
        ...prevState,
        relationshipTo: productTypes[0].entityName,
      }));
    }
  }, [productTypes]);

  async function apiDeleteCategories(categoriesToDelete) {
    console.log("categoriesToDelete:", categoriesToDelete);
    const payloads = categoriesToDelete.map((category) => category.entityName);
    console.log("kkk", payloads);
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
        showModal("error", `Failed to delete categories. Status: ${response.status}`);
      }
      else {
        showModal("success", "Categories deleted successfully.");
      }
      console.log("Delete response:", response);
    } catch (error) {
      console.error("Failed to delete categories:", error);
      showModal("error", `Failed to delete categories: ${error}`);
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

  useEffect(() => {
    if (jHipsterAuthToken) {
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
          console.log("entities", entities);

          const detailsRequests = entities.map((entity) =>
            fetch(`${apiUrlSpring}/api/jdl/get-entity-by-id/${entity.id}`, {
              method: "GET",
              headers: { Authorization: `Bearer ${jHipsterAuthToken}` },
            }).then((res) => res.json())
          );

          const entitiesDetails = await Promise.all(detailsRequests);
          console.log("entitiesDetails", entitiesDetails);

          let data = entitiesDetails.map((detail) => ({
            entityName: detail.entityName,
            entityType: detail.entityType,
            fields: detail.fields,
            relationships: detail.relationships || [],
            externalAttributesMetaData: detail.externalAttributesMetaData || [],
            categoryId: detail.categoryId || 0,
            oldEntityName: detail.oldEntityName,
            newEntityName: detail.newEntityName,
          }));

          console.log("raw data:", data);
          setRawDataForRelationship(data);
          data = transformMetaCategoryData(data);
          console.log("the data:", data);

          // check external data here
          setProductTypes(data);

          if (data.length > 0) {
            setSelectedProductType(data[0]);
            setSelectedEntityType(data[0].entityType);
            setSelectedFields(data[0].customFields || []);
            setSelectedRelationship(data[0]);
          }
        } catch (err) {

          showModal("error", "There is not data available.");
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

  useEffect(() => {
    console.log("beeing called here");
  }, [selectedEntityTypeUpdate]);

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
    const errors = validateField(fieldEdits);
    if (errors.length > 0) {
      return;
    }
    const updatedFields = selectedFields.map((field, idx) => {
      return idx === editFieldIndex ? { ...fieldEdits } : field;
    });

    setSelectedFields(updatedFields);
    setEditFieldIndex(null);

    if (selectedRelationship.length > 0) {
      console.log("there are relationships", selectedRelationship);
    } else {
      console.log("no relationships", selectedRelationship);
    }

    console.log("updatedFieldsM<", updatedFields);

    const payload = {
      entityName: selectedProductType?.entityName,
      fields: updatedFields.map((field) => {
        let fieldSpec = `${field.key} ${field.type}${field.required ? " required" : ""
          }`;

        const { min, max, unique } = field.validations;

        // check the of what needs to be the structure of the fieldSpec
        if (field.validations) {
          fieldSpec += `${min ? ` minlength(${min})` : ""}`;
          fieldSpec += `${max ? ` maxlength(${max})` : ""}`;
          fieldSpec += unique ? " unique" : "";
        }

        return fieldSpec;
      }),
      relationships:
        selectedRelationship.length > 0 ? selectedRelationship : [],
    };

    console.log("payload.fields", payload);

    payload.entityType = selectedEntityType;
    payload.externalAttributesMetaData = [];
    payload.parentEntityName = "";
    payload.enableSearch = false;
    payload.searchFields = [];
    payload.externalFlag = false;
    payload.localizationsFields = [];

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
    if (response.ok) {
      showModal("success", "Entity updated successfully!");
    } else {
      // showModal("error", `Failed to update entity. Status: ${response.status}`);
      showModal("error", `Failed to update entity. Please try agian later! `);
    }
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
    const errors = validateField(newField);
    if (errors.length > 0) {
      return;
    }

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

  function formatRelationshipFrom(relationshipFrom) {
    if (!relationshipFrom) return "";

    const pattern = /^[A-Za-z]+{\w+\(\w+\)}$/;

    if (pattern.test(relationshipFrom)) {
      const mainPart = relationshipFrom.split("{")[0];
      return mainPart;
    } else {
      return relationshipFrom;
    }
  }

  const validateField = (field) => {
    const { validations } = field;
    const errors = [];

    if (Number(validations.min) <= 0) {
      errors.push('Min value must be greater than zero.');
    }

    if (Number(validations.max) <= 0) {
      errors.push('Max value must be greater than zero.');
    }

    console.log('show me the min and max', validations.min, validations.max);
    if (Number(validations.min) >= Number(validations.max)) {
      errors.push('Max value must be greater than Min value.');
    }

    if (errors.length > 0) {
      showModal('fail', errors.join('\n'));
    }

    return errors;
  };


  const handleDeleteRelationship = async (index) => {
    let relationshipToRemove = selectedRelationship[index];
    let currentProductType = selectedProductType.entityName;

    console.log("rawDataForRelationship>>", rawDataForRelationship);

    // Filter out the relationship directly from selectedRelationship (current state)
    let newDataState = selectedRelationship.filter(
      (rel) => rel.relationshipTo !== relationshipToRemove.relationshipTo
    );

    setSelectedRelationship(newDataState);

    let filteredObject = rawDataForRelationship.filter(
      (obj) => obj.entityName === currentProductType
    );

    filteredObject[0].relationships = newDataState;
    console.log("filteredObject22", filteredObject);
    filteredObject[0].parentEntityName = "";

    const response = await fetch(`${apiUrlSpring}/api/jdl/update-entity`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jHipsterAuthToken}`,
      },
      body: JSON.stringify(filteredObject),
    });

    if (!response.ok) {
      console.log("Failed to delete relationship:", response);
      showModal("error", `Failed to delete relationship. Status: ${response.status}`);
    }

    console.log("response", response);
    showModal("error", `Relationship Deleted Successfully`);

  };

  let entityTypeOptions = ["reference", "product", "variant"];

  console.log("show me the selectedEntityType", selectedEntityType);

  function formatNewRelationship(relationship, categoryName) {
    const cleanEntityType = categoryName.trim();
    console.log("cleanEntityType", cleanEntityType);
    console.log("relationshipM<M<", relationship);
    const cleanLabel = relationship.relationshipTo.trim().toLowerCase();
    console.log("cleanLabel", cleanLabel);

    const pluralLabel = cleanLabel.endsWith("s")
      ? `${cleanLabel}es`
      : `${cleanLabel}s`;

    console.log("pluralLabel", pluralLabel);
    console.log(
      "the value is following",
      `${cleanEntityType}{${pluralLabel}(name)}`
    );

    return {
      relationshipType: relationship.relationshipType,
      relationshipFrom: `${cleanEntityType}{${pluralLabel}(name)}`,
      relationshipTo: relationship.relationshipTo,
    };
  }

  const handleAddRelationship = async () => {
    let newRelationshipObject = {
      relationshipFrom: selectedProductType.entityName,
      relationshipType: newRelationship.relationshipType,
      relationshipTo: newRelationship.relationshipTo,
    };

    newRelationshipObject = formatNewRelationship(
      newRelationshipObject,
      selectedProductType.entityName
    );

    const updatedRelationships = [
      ...selectedRelationship,
      newRelationshipObject,
    ];

    console.log("updatedRelationships!?!?!?", updatedRelationships);

    let filteredObject = rawDataForRelationship.filter(
      (obj) => obj.entityName === selectedProductType.entityName
    );

    filteredObject[0].relationships = updatedRelationships;
    filteredObject[0].parentEntityName = "";

    try {
      const response = await fetch(`${apiUrlSpring}/api/jdl/update-entity`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jHipsterAuthToken}`,
        },
        body: JSON.stringify(filteredObject),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create relationship");
      }

      console.log("API response data:", data);
      showModal("success", "Relationship updated successfully!");

      // const updatedRelationships = [
      //   ...selectedRelationship,
      //   data,
      // ];

      // setSelectedRelationship(updatedRelationships);
    } catch (error) {
      console.error("Error adding relationship:", error);
      showModal("error", `Error: ${error}`);
    }

    setSelectedRelationship(updatedRelationships);

    setShowAddRelationshipRow(false);
    setNewRelationship({
      relationshipType: "",
      relationshipFrom: "",
      relationshipTo: "",
    });
  };

  console.log("updatedRelationships!?!?", selectedRelationship);

  const handleChangeType = (event) => {
    const newType = event.target.value;
    console.log("Updating relationship type to:", newType);

    setNewRelationship((prevRelationship) => {
      return {
        ...prevRelationship,
        relationshipType: newType,
      };
    });
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
          setSelectedFields(newValue?.customFields || []);
          setSelectedEntityType(newValue?.entityType || "");
          if (newValue && newValue.relationships) {
            setSelectedRelationship(newValue?.relationships);
          } else {
            setSelectedRelationship([]);
          }
        }}
        disableClearable
        renderInput={(params) => (
          <TextField {...params} label="Select Category" />
        )}
      />

      <FormControl fullWidth sx={{ mt: 2, mb: 4 }}>
        <InputLabel id="entity-type-label">Entity Type</InputLabel>
        <Select
          labelId="entity-type-label"
          id="entity-type-select"
          value={selectedEntityType}
          label="Entity Type"
          onChange={(event) => {
            setSelectedEntityType(event.target.value);
            // setSelectedEntityTypeUpdate(!selectedEntityTypeUpdate);
          }}
        >
          {/* Assuming you have a list of possible entity types */}
          {entityTypeOptions.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper style={{ marginBottom: "80px" }} sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Key</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Data Type</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Min</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Max</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Unique</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Required</TableCell>
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
                        disabled
                        value={fieldEdits.key}
                        onChange={(e) =>
                          handleEditChange("key", e.target.value)
                        }
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        disabled
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
                      <IconButton onClick={() => startEdit(idx)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(idx)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </>
                )}
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
                    value={newField.type}
                    onChange={(e) =>
                      setNewField({ ...newField, type: e.target.value })
                    }
                    style={{ width: "120px" }}
                    size="small"
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="" disabled>Select Data Type</option>
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

        {/*  */}

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

        {/*  */}

        {/* relationship table */}
        {selectedRelationship.length > 0 && (
          <Paper sx={{ mt: 4, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Relationships Selection
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: "bold" }}>Type</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>From</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>To</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedRelationship.map((rel, index) => (
                  <TableRow key={index}>
                    <TableCell>{rel.relationshipType}</TableCell>
                    <TableCell>
                      {formatRelationshipFrom(rel.relationshipFrom)}
                    </TableCell>
                    <TableCell>{rel.relationshipTo}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDeleteRelationship(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {showAddRelationshipRow && (
                  <TableRow>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={newRelationship.relationshipType}
                        onChange={handleChangeType}
                        SelectProps={{ native: true }}
                      >
                        {["ManyToOne", "OneToMany", "ManyToMany", "OneToOne"].map(
                          (option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          )
                        )}
                      </TextField>
                    </TableCell>

                    <TableCell>
                      <TextField
                        fullWidth
                        disabled
                        value={selectedProductType.entityName}
                        onChange={(e) =>
                          setNewRelationship({
                            ...newRelationship,
                            relationshipFrom: selectedProductType.entityName,
                          })
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={newRelationship.relationshipTo}
                        onChange={(e) =>
                          setNewRelationship({
                            ...newRelationship,
                            relationshipTo: e.target.value,
                          })
                        }
                        SelectProps={{ native: true }}
                      >
                        {relationshipOptions.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </TextField>
                    </TableCell>

                    <TableCell>
                      <IconButton onClick={handleAddRelationship}>
                        <SaveIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setShowAddRelationshipRow(false)}
                      >
                        <CancelIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}

        {selectedRelationship.length > 0 && (
          <Button
            onClick={() => setShowAddRelationshipRow(true)}
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Add Relationship
          </Button>
        )}
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
