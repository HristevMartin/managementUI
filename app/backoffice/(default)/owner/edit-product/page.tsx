"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CircularProgress,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { data } from "./components/data";
import { dataByid } from "./components/data-by-id";
import { edit } from "./components/edit";
import Editor from "@/app/backoffice/editor/page";

// Function to get plural form for certain terms
export function getPluralForm(singular) {
  const irregulars = {
    ancillary: "ancillaries",
    ticketselection: "ticket-selections",
    seatingarea: "seating-areas",
  };
  return irregulars[singular.toLowerCase()] || singular.toLowerCase() + "s";
}

// Function to pluralize types
const pluralizeType = (type) => {
  const cleanLabel = type.trim().toLowerCase().replace(/\s+/g, "-");
  const lastWord = cleanLabel.split("-").pop();
  let pluralized;

  if (lastWord.endsWith("ys")) {
    pluralized = cleanLabel.slice(0, -2) + "ies";
  } else if (lastWord.endsWith("y")) {
    pluralized = cleanLabel.slice(0, -1) + "ies";
  } else if (lastWord.endsWith("ary")) {
    pluralized = cleanLabel.slice(0, -3) + "aries";
  } else {
    pluralized = cleanLabel.endsWith("s")
      ? `${cleanLabel}es`
      : `${cleanLabel}s`;
  }

  return pluralized;
};

const EditForm = () => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [dynamicData, setDynamicData] = useState({});
  const [relationshipMap, setRelationshipMap] = useState({});
  const searchParams = useSearchParams();
  const selectedType = searchParams.get("selectedType");
  const id = searchParams.get("id");
  const pluralizedType = selectedType ? pluralizeType(selectedType) : "";

  // Define labels for dynamic data
  const labelMapping = {
    ancillaries: "Ancillaries",
    hotels: "Hotels",
    ticketSelections: "Ticket Selections",
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted || !selectedType || !id) return;

      setLoading(true);
      console.log(`Fetching data for type: ${selectedType}, id: ${id}`);

      try {
        const dataResponse = await data(selectedType);
        console.log(`Data response for ${selectedType}:`, dataResponse);
        setFields(dataResponse.fields);

        const relationshipTos = dataResponse.relationships.map(
          (rel) => rel.relationshipTo
        );

        const relationships = await Promise.all(
          relationshipTos.map(fetchRelationshipDetails)
        );

        const relationshipMapping = relationshipTos.reduce(
          (acc, type, index) => {
            const pluralType = getPluralForm(type);
            acc[pluralType] = relationships[index];
            return acc;
          },
          {}
        );
        console.log(`Relationship mapping:`, relationshipMapping);
        setRelationshipMap(relationshipMapping);

        const dataByIdResponse = await dataByid(pluralizedType, id);
        console.log(`Data by ID response:`, dataByIdResponse);

        setFormData(dataByIdResponse);

        const newDynamicData = Object.fromEntries(
          Object.entries(dataByIdResponse).filter(
            ([, value]) =>
              Array.isArray(value) ||
              (typeof value === "object" && value !== null)
          )
        );
        console.log(`Dynamic data:`, newDynamicData);
        setDynamicData(newDynamicData);
      } catch (err) {
        console.error(`Error fetching data:`, err);
        setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedType, id]);

  const fetchRelationshipDetails = async (relationshipTo) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;
    const endpoint = getPluralForm(relationshipTo);

    try {
      const response = await fetch(`${apiUrl}/api/${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch ${relationshipTo}`);
      const data = await response.json();
      console.log(`Fetched relationship data for ${relationshipTo}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${relationshipTo}:`, error);
      return [];
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing field ${name} to ${value}`);
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCustomFieldChange = (index, newValue) => {
    const fieldName = fields[index].split(" ")[0];
    console.log(`Custom field changed at index ${index}:`, newValue);
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: newValue,
    }));
  };

  const handleChipDelete = (key, itemId) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: prevData[key].filter((item) => item.id !== itemId),
    }));
  };

  const handleAddChip = (key, item) => {
    setFormData((prevData) => {
      const existingItems = prevData[key] || [];
      const isAlreadyAdded = existingItems.some(
        (existingItem) => existingItem.id === item.id
      );
      if (!isAlreadyAdded) {
        return {
          ...prevData,
          [key]: [...existingItems, item],
        };
      }
      return prevData; // Return previous state if item is already present
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data:", JSON.stringify(formData, null, 2));

    if (formData && selectedType && id) {
      try {
        await edit(formData, selectedType, id);
        console.log("Edit successful");
      } catch (error) {
        console.error("Error calling edit function:", error);
      }
    }
  };

  if (loading) {
    return <CircularProgress />;
  }
  if (error) {
    return <Typography color="error">Error: {error.message}</Typography>;
  }

  return (
    <Box className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <Typography variant="h4" align="center" gutterBottom>
        Edit {selectedType}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((field, index) => {
            const [fieldName, fieldType] = field.split(" ").slice(0, 2);

            return (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                </Typography>
                {fieldType === "LocalDate"  ||
                 fieldType === "Date" ? (
                  <TextField
                    name={fieldName}
                    type="date"
                    value={formData[fieldName] || ""}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                ) : fieldType === "TextBlob" ? (
                  <Editor
                    id={`customValue-${index}`}
                    value={formData[fieldName] || ""}
                    onChange={(newValue) =>
                      handleCustomFieldChange(index, newValue)
                    }
                    disabled={false}
                    className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500"
                  />
                ) : (
                  <TextField
                    label={
                      fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
                    }
                    name={fieldName}
                    value={formData[fieldName] || ""}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                  />
                )}
              </Box>
            );
          })}

          {Object.keys(relationshipMap).map((relationshipKey) => (
            <Box key={relationshipKey} sx={{ mb: 2 }}>
              <FormControl fullWidth variant="outlined" size="small">
                {/* <InputLabel>{`Select ${relationshipKey}`}</InputLabel> */}
                <Typography variant="subtitle1">
                  {labelMapping[relationshipKey] || relationshipKey}:
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {Array.isArray(formData[relationshipKey])
                    ? formData[relationshipKey].map((item) => (
                        <Chip
                          key={item.id}
                          label={item.name || "Unknown"}
                          onDelete={() =>
                            handleChipDelete(relationshipKey, item.id)
                          }
                        />
                      ))
                    : formData[relationshipKey] && (
                        <Chip
                          key={formData[relationshipKey].id}
                          label={formData[relationshipKey].name || "Unknown"}
                          onDelete={() =>
                            handleChipDelete(
                              relationshipKey,
                              formData[relationshipKey].id
                            )
                          }
                        />
                      )}
                </Box>

                <Select
                  onChange={(e) => {
                    const selectedItem = relationshipMap[relationshipKey]?.find(
                      (item) => item.id === e.target.value
                    );
                    if (selectedItem) {
                      handleAddChip(relationshipKey, selectedItem);
                    }
                  }}
                  label={`Select ${relationshipKey}`}
                >
                  {relationshipMap[relationshipKey]?.length ? (
                    relationshipMap[relationshipKey].map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name || "Unknown"}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No options available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default EditForm;
