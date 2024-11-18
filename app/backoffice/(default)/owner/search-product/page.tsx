"use client";
import React, { useState, useEffect } from "react";
import { useAuthJHipster } from "@/context/JHipsterContext";
import { mapProductTypesToCustomFields } from "@/services/productFormService";
import { search } from "./components/search";
import "font-awesome/css/font-awesome.min.css";
import { useRouter } from "next/navigation";

const Searchproduct = () => {
  const [productType, setProductType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [selectedCustomFields, setSelectedCustomFields] = useState([]);
  const [filterOperations, setFilterOperations] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Start with page 1
  const [totalPages, setTotalPages] = useState(0); // Track total pages
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const { jHipsterAuthToken } = useAuthJHipster();

  const router = useRouter();

  const handleEdit = (index) => {
    const id = searchResults[index].id;
    const selectedType = productType;
    console.log('the id', id)
    console.log('the selectedType', selectedType)
    router.push(
      `/backoffice/owner/edit-product?id=${id}&selectedType=${selectedType}`
    );
  };

  const handleView = (index) => {
    const id = searchResults[index].id;
    router.push(`/view-product?id=${id}`);
  };

  const toggleDropdown = (index) => {
    setDropdownOpenIndex(dropdownOpenIndex === index ? null : index);
  };

  useEffect(() => {
    if (!jHipsterAuthToken) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await mapProductTypesToCustomFields(jHipsterAuthToken);
        console.log("product type data", data);
        if (data && data.length > 0) {
          setCategoryDetails(data);
          setProductTypes(data.map((category) => category.categoryName));
          setProductType(data[0].categoryName);
          setCategoryId(data[0].categoryId);
          setCustomFields(data[0].customFields);
        }
      } catch (error) {
        console.error("Failed to fetch category details:", error);
        setError("Failed to fetch category details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jHipsterAuthToken]);

  const size = process.env.NEXT_PUBLIC_ITEMS_PER_PAGE; // Number of items per page

  const calculateTotalPages = (totalCount) => {
    // Calculate the total pages based on total count and items per page
    return Math.ceil(totalCount / size);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (payload) {
        setIsLoading(true);
        console.log("Fetching data...");
        console.log("Payload:", payload);
        console.log("Page:", currentPage); // This will be the current page (1-based)
        console.log("Items per page (size):", size);

        try {
          const results = await search(payload, currentPage, size); // Pass 0-based page to the API (page - 1)
          console.log("Search results:", results);
          setSearchResults(results.searchData);

          const totalCount = results.totalCount;
          console.log("Total count from the results:", totalCount);

          const totalPages = calculateTotalPages(totalCount); // Calculate total pages
          setTotalPages(totalPages); // Update total pages
          console.log("Total pages calculated:", totalPages);
        } catch (error) {
          console.error("Search error:", error);
          setError("Failed to fetch search results. Please try again.");
        } finally {
          setIsLoading(false);
          console.log("Data fetch complete.");
        }
      }
    };

    fetchData(); // Fetch data based on the current page
  }, [payload, currentPage]); // Effect runs whenever payload or currentPage changes

  const handleNext = () => {
    // Increment currentPage if it's less than totalPages
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1); // Increment page
    }
  };

  const handlePrevious = () => {
    // Decrement currentPage if it's greater than 1
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1); // Decrement page
    }
  };

  const handleProductTypeChange = (e) => {
    const selectedType = e.target.value;
    setProductType(selectedType);
    console.log("slected product type", selectedType);

    const selectedCategory = categoryDetails.find(
      (category) => category.categoryName === selectedType
    );
    if (selectedCategory) {
      setCategoryId(selectedCategory.categoryId);
      setCustomFields(selectedCategory.customFields);
      setSelectedCustomFields([]);
      setInputValues({});
      setFilterOperations({});
    }
  };

  const handleCustomFieldChange = (e) => {
    const value = e.target.value;
    const updatedSelection = selectedCustomFields.includes(value)
      ? selectedCustomFields.filter((field) => field !== value)
      : [...selectedCustomFields, value];

    setSelectedCustomFields(updatedSelection);

    const updatedInputValues = { ...inputValues };
    updatedSelection.forEach((field) => {
      if (!updatedInputValues[field]) {
        updatedInputValues[field] = "";
      }
    });

    setInputValues(updatedInputValues);
    setFilterOperations({});
  };

  const handleFilterOperationChange = (field, e) => {
    setFilterOperations({
      ...filterOperations,
      [field]: e.target.value,
    });
  };

  const handleInputChange = (field, e) => {
    const value = e.target.value;
    const fieldType = customFields
      .find((f) => f.name === field)
      ?.type.toLowerCase();

    let processedValue = value; // Default to string

    // Convert value based on field type
    if (fieldType === "integer") {
      processedValue = parseInt(value, 10);
    } else if (fieldType === "double") {
      processedValue = parseFloat(value);
    }

    setInputValues({
      ...inputValues,
      [field]: processedValue,
    });
  };

  const handleDeleteField = (field) => {
    const updatedSelection = selectedCustomFields.filter((f) => f !== field);
    setSelectedCustomFields(updatedSelection);

    const { [field]: _, ...restInputValues } = inputValues;
    const { [field]: __, ...restFilterOperations } = filterOperations;

    setInputValues(restInputValues);
    setFilterOperations(restFilterOperations);
  };

  const getFilterOptions = (fieldName) => {
    const selectedField = customFields.find(
      (field) => field.name === fieldName
    );
    if (!selectedField) return [];

    const type = selectedField.type.toLowerCase();
    if (["string", "textblob"].includes(type)) {
      return ["=", "starts with", "contains"];
    } else if (["date", "integer", "double", "localdate"].includes(type)) {
      return ["=", "<", ">", ">=", "<="];
    }
    return [];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('in here ee')

    const searchFields = selectedCustomFields
      .map((field) => {
        const operator = filterOperations[field] || "";
        const value = inputValues[field];

        return value != null && operator
          ? { fieldName: field, operator, value }
          : null;
      })
      .filter((field) => field !== null);

    if (searchFields.length === 0) {
      setError("Please select at least one field with a value and operator.");
      return;
    }

    const newPayload = {
      entityName: productType,
      searchFields,
    };
    console.log("Payload:", JSON.stringify(newPayload, null, 2));
    setPayload(newPayload);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="container text-black">
        <form
          className="w-[600px] mx-auto p-6 bg-white rounded-lg shadow-lg" // Fixed width
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            Search Product
          </h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="mb-4">
            <label
              htmlFor="productType"
              className="block text-md font-semibold mb-1"
            >
              Travel Product Type
            </label>
            <select
              id="productType"
              name="productType"
              value={productType}
              onChange={handleProductTypeChange}
              className="block w-full border border-gray-300 px-4 py-2 rounded focus:ring focus:ring-blue-200"
            >
              <option value="" disabled>
                Select Product Type
              </option>
              {productTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="customFields"
              className="block text-md font-semibold mb-1"
            >
              Select Custom Fields
            </label>
            <select
              id="customFields"
              name="customFields"
              value=""
              onChange={handleCustomFieldChange}
              className="block w-full border border-gray-300 px-4 py-2 rounded focus:ring focus:ring-blue-200"
            >
              <option value="" disabled>
                Select Custom Field
              </option>
              {customFields.map((field, index) => (
                <option key={index} value={field.name}>
                  {field.name} ({field.type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {selectedCustomFields.map((field, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <span className="text-lg font-semibold">{field}</span>

                  <div className="w-full">
                    <label
                      htmlFor={`filterOperation_${field}`}
                      className="block text-md font-semibold mb-1"
                      required
                    >
                      Select Filter Operation
                    </label>
                    <select
                      id={`filterOperation_${field}`}
                      name="filterOperation"
                      value={filterOperations[field] || ""}
                      onChange={(e) => handleFilterOperationChange(field, e)}
                      className="block w-full border border-gray-300 px-4 py-2 rounded focus:ring focus:ring-blue-200"
                      required
                    >
                      <option value="" disabled>
                        Select Filter Operation
                      </option>
                      {getFilterOptions(field).map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full">
                    <label
                      htmlFor={`search_${field}`}
                      className="block text-md font-semibold mb-1"
                    >
                      Search {field}
                    </label>
                    <input
                      id={`search_${field}`}
                      type="text"
                      name={`search_${field}`}
                      placeholder="Enter value"
                      value={inputValues[field] || ""}
                      onChange={(e) => handleInputChange(field, e)}
                      className="block w-full border border-gray-300 px-4 py-2 rounded focus:ring focus:ring-blue-200"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteField(field)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
          >
            Search
          </button>
        </form>

        <div className="bg-gray-100 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Search Results
            </h3>
          </div>

          {searchResults.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                <thead>
                  <tr className="bg-blue-200">
                    {Object.keys(searchResults[0])
                      .filter((key) => key !== "id") // Skip the 'id' key
                      .map((key, index) => (
                        <th
                          key={index}
                          className="py-2 px-4 border-b text-left"
                        >
                          {key === "end_date"
                            ? "End Date"
                            : key.replace(/_/g, " ")}
                        </th>
                      ))}
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((result, index) => (
                    <tr

                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {Object.entries(result)
                        .filter(([key]) => key !== "id") // Skip the 'id' key
                        .map(([key, value], i) => (
                          <td key={i} className="py-2 px-4 border-b">
                            {typeof value === "string" &&
                            value.startsWith("http") ? (
                              <img
                                src={value}
                                alt={key}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            ) : (
                              value
                            )}
                          </td>
                        ))}
                      <td className="py-2 px-4 border-b flex space-x-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold rounded px-2 py-1"
                          aria-label="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleView(index)}
                          className="bg-green-600 text-white hover:bg-green-700 text-sm font-semibold rounded px-2 py-1"
                          aria-label="View"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Searchproduct;
