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

  useEffect(() => {
    console.log("beeing called here");
  }, [selectedEntityTypeUpdate]);

  console.log("selectedRelationship!!!:", selectedRelationship);

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
    console.log("here..");
    console.log("selectedFields:", selectedFields);
    console.log("editFieldIndex:", editFieldIndex);
    console.log("fieldEdits", fieldEdits);

    const updatedFields = selectedFields.map((field, idx) => {
      return idx === editFieldIndex ? { ...fieldEdits } : field;
    });

    console.log("beehere");

    setSelectedFields(updatedFields);
    setEditFieldIndex(null);

    console.log("passinghere");

    console.log("selectedProductType", selectedProductType);
    console.log("selectedRelationshipM<", selectedRelationship);

    if (selectedRelationship.length > 0) {
      console.log("there are relationships", selectedRelationship);
    } else {
      console.log("no relationships", selectedRelationship);
    }

    console.log("updatedFieldsM<", updatedFields);

    const payload = {
      entityName: selectedProductType?.entityName,
      fields: updatedFields.map((field) => {
        let fieldSpec = `${field.key} ${field.type}${
          field.required ? " required" : ""
        }`;

        const { min, max, unique } = field.validations;

        // check the of what needs to be the structure of the fieldSpec
        if (field.validations) {
          fieldSpec += unique ? " unique" : "";
          //   fieldSpec += `${min ? ` min(${min})` : ""}`;
          //   fieldSpec += `${max ? ` max(${max})` : ""}`;
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
    return relationshipFrom.split("{")[0];
  }

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
    }

    console.log("response", response);
    alert("Relationship Deleted Successfully");
  };

  let entityTypeOptions = ["reference", "product", "variant"];

  console.log("show me the selectedEntityType", selectedEntityType);

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
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* ends relationship table */}

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
