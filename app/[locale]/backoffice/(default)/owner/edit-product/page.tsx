"use client";
import React, { useState, useEffect, Suspense } from "react";
// import { useSearchParams } from "next/navigation";
import {
  CircularProgress,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { data } from "./components/data";
import { dataByid } from "./components/data-by-id";
import { edit } from "./components/edit";
import { pagination } from "./components/pagination";
import { useSearchParams } from "next/navigation";
import { useAuthJHipster } from "@/context/JHipsterContext";
import Editor from "@/components/editor/page";


export function getPluralForm(singular = '') {
  const irregulars = {
    ancillary: "ancillaries",
    ticketselection: "ticket-selections",
    seatingarea: "seating-areas",
  };
  return irregulars[singular.toLowerCase()] || singular.toLowerCase() + "s";
}

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
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [relationshipTos, setRelationshipTos] = useState([]);
  const [relationshipSelections, setRelationshipSelections] = useState({});
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [dropdownClicked, setDropdownClicked] = useState(false);
  const [currentPage, setCurrentPage] = useState({});
  const [itemsPerPage] = useState(
    Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE)
  );
  const [totalPages, setTotalPages] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [dynamicData, setDynamicData] = useState({});
  const [finalPayload, setFinalPayload] = useState({});
  const [selectedChips, setSelectedChips] = useState({});

  const { jHipsterAuthToken } = useAuthJHipster();

  const searchParams = useSearchParams();
  const selectedType = searchParams?.get("selectedType");
  const id = searchParams?.get("id");
  console.log('show me the selectedType', selectedType);
  console.log('show me the id', id);
  const pluralizedType = selectedType ? pluralizeType(selectedType) : "";


  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOptions =
        JSON.parse(localStorage.getItem("selectedOptions")) || {};
      setSelectedOptions(storedOptions);
      console.log("Loaded selected options from localStorage:", storedOptions);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDynamicData =
        JSON.parse(localStorage.getItem("dynamicData")) || {};
      setDynamicData(storedDynamicData);
      console.log("Loaded dynamic data from localStorage:", storedDynamicData);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    console.log('jhipster token', jHipsterAuthToken);
    if (!jHipsterAuthToken) {
      return;
    }

    const fetchData = async () => {
      if (!isMounted || !selectedType || !id) {
        console.log('no selectedType or id');
        return
      };

      console.log("Fetching data for:", selectedType, id);

      setLoading(true);
      console.log("Fetching data for:", selectedType, id);
      try {
        console.log('before the fetch');
        const dataResponse = await data(selectedType, jHipsterAuthToken);
        setFields(dataResponse.fields);
        console.log("Fields loaded:", dataResponse.fields);

        const relationships = dataResponse.relationships.map(
          (rel) => rel.relationshipTo
        );
        setRelationshipTos(relationships);
        console.log("Relationships found:", relationships);

        const dataByIdResponse = await dataByid(pluralizedType, id, jHipsterAuthToken);
        setFormData(dataByIdResponse);
        console.log("Data loaded by ID:", dataByIdResponse);

        const newDynamicData = Object.fromEntries(
          Object.entries(dataByIdResponse).filter(
            ([, value]) =>
              Array.isArray(value) ||
              (typeof value === "object" && value !== null)
          )
        );
        console.log(`Dynamic data:`, newDynamicData);
        setDynamicData(newDynamicData);

        // Transform dynamicData to only contain id and name, then save to localStorage
        const transformedDynamicData = Object.keys(newDynamicData).reduce(
          (acc, key) => {
            const items = newDynamicData[key];

            // Check if 'items' is an array
            const transformedItems = Array.isArray(items)
              ? items.map((item) => ({
                id: item.id,
                name: item.name,
              }))
              : // Check if 'items' is a single object with 'id' and 'name' properties
              items && items.id && items.name
                ? [{ id: items.id, name: items.name }] // Wrap single object in an array
                : []; // If neither, return an empty array

            // Add the transformed items to the accumulator
            const formattedKey = capitalizeAndTrimS(key);
            acc[formattedKey] = transformedItems;

            return acc;
          },
          {}
        );

        // Save the transformed dynamic data to localStorage
        localStorage.setItem(
          "transformedDynamicData",
          JSON.stringify(transformedDynamicData)
        );

        console.log(
          "Transformed dynamic data saved to localStorage:",
          transformedDynamicData
        );
      } catch (err) {
        setError(err);
        console.error("Error fetching data:", err);

      } finally {
        setLoading(false);
        console.log("Loading finished");
      }
    };

    fetchData();

    // return () => {
    //   isMounted = false;
    // };
  }, [selectedType, id, pluralizedType, jHipsterAuthToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      updateFinalPayload(updatedData, selectedOptions);
      return updatedData;
    });
  };

  const calculateTotalPages = (totalCount) => {
    return Math.ceil(totalCount / itemsPerPage);
  };

  const handleRelationshipChange = async (relationshipKey, page = 0) => {
    console.log(
      `Fetching relationship options for ${relationshipKey} on page ${page}`
    );
    const pluralForm = getPluralForm(relationshipKey);

    try {
      const result = await pagination(pluralForm, page, itemsPerPage, jHipsterAuthToken);
      const optionsData = result.data;
      const totalCount = result.totalCount;

      setTotalPages((prev) => ({
        ...prev,
        [relationshipKey]: calculateTotalPages(totalCount),
      }));
      setDropdownOptions((prev) => ({
        ...prev,
        [relationshipKey]: optionsData,
      }));
      console.log(`Options for ${relationshipKey}:`, optionsData);
    } catch (error) {
      console.error(`Error fetching options for ${relationshipKey}:`, error);
    }
  };

  const handleSelectOption = (relationship, option) => {
    setSelectedOptions((prev) => {
      const updatedSelections = { ...prev };

      // Initialize relationship if not already present
      if (!updatedSelections[relationship]) {
        updatedSelections[relationship] = [];
      }

      // Add the selected option if it's not already in the list
      if (!updatedSelections[relationship].includes(option.id)) {
        updatedSelections[relationship].push(option.id);
      }

      // Update localStorage with the new selected options
      localStorage.setItem(
        "selectedOptions",
        JSON.stringify(updatedSelections)
      );

      // Update dynamic data to reflect the selected option
      setDynamicData((prevData) => {
        const updatedDynamicData = { ...prevData };
        const formattedRelationship = smallAndTrimS(relationship);

        // Initialize relationship in dynamic data if not present
        if (!updatedDynamicData[formattedRelationship]) {
          updatedDynamicData[formattedRelationship] = [];
        }

        // Add the option to dynamicData if not already present
        if (
          !updatedDynamicData[formattedRelationship].some(
            (item) => item.id === option.id
          )
        ) {
          updatedDynamicData[formattedRelationship].push(option);
        }

        // Update localStorage with the updated dynamicData
        localStorage.setItem("dynamicData", JSON.stringify(updatedDynamicData));

        return updatedDynamicData;
      });

      // Append to formData, mapping relationship to the selected option
      setFormData((prevFormData) => {
        const updatedFormData = { ...prevFormData };
        const formattedRelationship = smallAndTrimS(relationship);

        // Initialize relationship in formData if not present
        if (!updatedFormData[formattedRelationship]) {
          updatedFormData[formattedRelationship] = [];
        }

        // Add the selected option to formData (mapping relationship to option id and name)
        if (
          !updatedFormData[formattedRelationship].find(
            (item) => item.id === option.id
          )
        ) {
          updatedFormData[formattedRelationship].push({
            id: option.id,
            name: option.name,
          });
        }

        // Update the formData state
        return updatedFormData;
      });

      return updatedSelections;
    });
  };

  const handleDeleteOption = (relationship, optionId) => {
    setSelectedOptions((prev) => {
      const updatedSelections = { ...prev };

      // Remove the optionId from the selected options for the given relationship
      updatedSelections[relationship] = updatedSelections[relationship].filter(
        (id) => id !== optionId
      );

      // Update localStorage with the new selected options
      localStorage.setItem(
        "selectedOptions",
        JSON.stringify(updatedSelections)
      );

      // Remove the option from dynamicData
      setDynamicData((prevData) => {
        const updatedDynamicData = { ...prevData };
        const formattedRelationship = smallAndTrimS(relationship);

        // Remove the option from dynamicData
        updatedDynamicData[formattedRelationship] = updatedDynamicData[
          formattedRelationship
        ].filter((item) => item.id !== optionId);

        // Update localStorage with the updated dynamicData
        localStorage.setItem("dynamicData", JSON.stringify(updatedDynamicData));

        return updatedDynamicData;
      });

      // Remove the option from formData
      setFormData((prevFormData) => {
        const updatedFormData = { ...prevFormData };
        const formattedRelationship = smallAndTrimS(relationship);

        // Remove the option from formData (matching by id)
        updatedFormData[formattedRelationship] = updatedFormData[
          formattedRelationship
        ].filter((item) => item.id !== optionId);

        // Update the formData state
        return updatedFormData;
      });

      return updatedSelections;
    });
  };

  const updateFinalPayload = (formData, selectedOptions) => {
    setFinalPayload({
      ...formData,
      relationships: selectedOptions,
    });
  };




  const handleDeleteOptionDynamic = (optionId, relationship) => {
    // Convert the relationship to a readable string using smallAndTrimS
    const readableRelationship = smallAndTrimS(relationship);
    console.log(
      "Converted relationship to readable format:",
      readableRelationship
    );

    // Remove option from formData (selected option under the relationship)
    setFormData((prevFormData) => {
      console.log("Previous formData:", prevFormData);

      const updatedFormData = { ...prevFormData };
      // Check if the formData contains the relationship
      if (updatedFormData[readableRelationship]) {
        console.log(
          `Found relationship: ${readableRelationship} in formData`,
          updatedFormData[readableRelationship]
        );

        // Filter out the item with the matching optionId
        updatedFormData[readableRelationship] = updatedFormData[
          readableRelationship
        ].filter((item) => item.id !== optionId);
        console.log(
          `Updated formData after deleting optionId ${optionId}:`,
          updatedFormData
        );
      } else {
        console.log(
          `Relationship ${readableRelationship} not found in formData`
        );
      }

      // Return the updated formData
      return updatedFormData;
    });

    // Remove option from dynamicData
    setDynamicData((prevDynamicData) => {
      console.log("Previous dynamicData:", prevDynamicData);

      const updatedDynamicData = { ...prevDynamicData };
      // Check if the relationship exists in dynamicData
      if (updatedDynamicData[readableRelationship]) {
        // Filter out the deleted option from dynamicData
        updatedDynamicData[readableRelationship] = updatedDynamicData[
          readableRelationship
        ].filter((item) => item.id !== optionId);
        console.log(
          `Updated dynamicData after deleting optionId ${optionId}:`,
          updatedDynamicData
        );
      }


      return updatedDynamicData;
    });


    setSelectedOptions((prevSelectedOptions) => {
      const updatedSelections = { ...prevSelectedOptions };

      if (updatedSelections[readableRelationship]) {

        updatedSelections[readableRelationship] = updatedSelections[
          readableRelationship
        ].filter((id) => id !== optionId);
      }


      localStorage.setItem(
        "selectedOptions",
        JSON.stringify(updatedSelections)
      );
      console.log("Updated selected options:", updatedSelections);


      return updatedSelections;
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting final payload:", formData);

    if (formData && selectedType && id) {
      try {
        await edit(formData, selectedType, id, jHipsterAuthToken);
        alert("Edit successful");
        console.log("Edit successful");
      } catch (error) {
        setError(error);
        console.error("Error during submission:", error);
      }
    }
  };

  const handleNextPage = (relationshipKey) => {
    setCurrentPage((prev) => {
      const newPage = (prev[relationshipKey] || 0) + 1;
      handleRelationshipChange(relationshipKey, newPage);
      console.log(`Moved to next page for ${relationshipKey}:`, newPage);
      return { ...prev, [relationshipKey]: newPage };
    });
  };

  const handlePrevPage = (relationshipKey) => {
    setCurrentPage((prev) => {
      const newPage = Math.max((prev[relationshipKey] || 0) - 1, 0);
      handleRelationshipChange(relationshipKey, newPage);
      console.log(`Moved to previous page for ${relationshipKey}:`, newPage);
      return { ...prev, [relationshipKey]: newPage };
    });
  };

  const handleDropdownClick = (relationshipKey) => {
    setDropdownClicked(true);
    const page = currentPage[relationshipKey] || 0;
    handleRelationshipChange(relationshipKey, page);
    console.log(
      `Dropdown clicked for ${relationshipKey}, current page: ${page}`
    );
  };

  const capitalizeAndTrimS = (string) => {
    if (string === "ancillaries") {
      return "Ancillary";
    }

    const trimmedString = string.endsWith("s") ? string.slice(0, -1) : string;
    return trimmedString.charAt(0).toUpperCase() + trimmedString.slice(1);
  };

  const smallAndTrimS = (string) => {
    // Remove leading and trailing whitespace
    const trimmedString = string.trim();

    // Handle specific cases
    if (trimmedString === "Ancillary") {
      return "ancillaries";
    }

    if (trimmedString.toLowerCase() === "ticketselection") {
      return "ticketSelections";
    }

    return trimmedString.toLowerCase() + "s";
  };

  // const saveDynamicDataToLocalStorage = (data) => {
  //   localStorage.setItem("dynamicData", JSON.stringify(data));
  // };

  const transformedDynamicData = Object.keys(dynamicData).reduce((acc, key) => {
    const formattedKey = capitalizeAndTrimS(key);
    acc[formattedKey] = dynamicData[key];
    return acc;
  }, {});

  if (loading) {
    return <CircularProgress />;
  }
  if (error) {
    return <Typography color="error">Error: {error.message}</Typography>;
  }

  return (
    <Box className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
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
                {fieldType === "LocalDate" || fieldType === "Date" ? (
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
                      handleChange({
                        target: { name: fieldName, value: newValue },
                      })
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

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Relationships</Typography>
            {relationshipTos.map((relationship, index) => {
              const formattedRelationship = capitalizeAndTrimS(relationship);
              const selectedItems = selectedOptions[relationship] || [];

              return (
                <FormControl
                  key={index}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                >
                  <Box sx={{ display: "flex", flexWrap: "wrap", mb: 1 }}>
                    {/* Render chips for selected options */}
                    {selectedItems.map((itemId) => {
                      const selectedItem = dropdownOptions[relationship]?.find(
                        (opt) => opt.id === itemId
                      );
                      return selectedItem ? (
                        <Chip
                          key={selectedItem.id}
                          label={selectedItem.name}
                          onDelete={() =>
                            handleDeleteOption(relationship, selectedItem.id)
                          }
                          sx={{ margin: 0.5 }}
                        />
                      ) : null;
                    })}

                    {/* Render chips for dynamicData */}
                    {transformedDynamicData &&
                      formattedRelationship &&
                      transformedDynamicData[formattedRelationship]
                      && Object.keys(transformedDynamicData).length > 0 && Object.keys(transformedDynamicData[formattedRelationship]).map(
                        (item) => (
                          <Chip
                            key={item.id}
                            label={item.name}
                            onDelete={() =>
                              handleDeleteOptionDynamic(item.id, relationship)
                            }
                            sx={{ margin: 0.5 }}
                          />
                        )
                      )}
                  </Box>

                  <label className="mb-4">{relationship}</label>
                  <Select
                    labelId={`${relationship}-label`}
                    name={relationship}
                    value={relationshipSelections[relationship] || ""}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      setRelationshipSelections((prev) => ({
                        ...prev,
                        [relationship]: selectedValue,
                      }));
                      const selectedOption = dropdownOptions[
                        relationship
                      ]?.find((opt) => opt.id === selectedValue);
                      if (selectedOption) {
                        handleSelectOption(relationship, selectedOption);
                      }
                    }}
                    onClick={() => handleDropdownClick(relationship)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Please select
                    </MenuItem>
                    {dropdownOptions[relationship]?.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>

                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                  >
                    {dropdownClicked && ( // Only show pagination if dropdown is clicked
                      <>
                        <Button
                          onClick={() => handlePrevPage(relationship)}
                          disabled={(currentPage[relationship] || 0) === 0}
                        >
                          Previous
                        </Button>
                        <Typography sx={{ mx: 2 }}>
                          Page {currentPage[relationship] + 1 || 1} of{" "}
                          {totalPages[relationship] || 1}
                        </Typography>
                        <Button
                          onClick={() => handleNextPage(relationship)}
                          disabled={
                            (currentPage[relationship] || 0) >=
                            (totalPages[relationship] || 1) - 1
                          }
                        >
                          Next
                        </Button>
                      </>
                    )}
                  </Box>
                </FormControl>
              );
            })}
          </Box>
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