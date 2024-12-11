"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import "./ProductForm.css";
import AlertDialogSlide from "./AlertDialogSlide";
import {
  getPluralForm,
  mapProductTypesToCustomFields,
} from "@/services/productFormService";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { MdRemoveCircle } from "react-icons/md";
import "./page.css";
import { useAuthJHipster } from "@/context/JHipsterContext";
import Select from "react-select";
import { transformPayloadSubmitProduct } from "@/utils/managementFormUtils";
import Editor from "@/app/backoffice/editor/page";
import Papa from "papaparse";

const ProductForm = () => {
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [price, setPrice] = useState("");
  const [productTypes, setProductTypes] = useState([]);
  const [customFields, setCustomFields] = useState([{ key: "", value: "" }]);
  const [openDialog, setOpenDialog] = useState(false);
  const [categoryId, setCategoryId] = useState("");

  const [dynamicInventory, setDynamicInventory] = useState(false);
  const [apiURLInventory, setApiURLInventory] = useState("");
  const [apiHeadersInventory, setApiHeadersInventory] = useState([
    { key: "", value: "" },
  ]);
  const [payloadBodyInventory, setPayloadBodyInventory] = useState("");

  const [dynamicPrice, setDynamicPrice] = useState(false);
  const [apiURLPrice, setApiURLPrice] = useState("");
  const [apiHeadersPrice, setApiHeadersPrice] = useState([
    { key: "", value: "" },
  ]);
  const [payloadBodyPrice, setPayloadBodyPrice] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);

  const [categoryDetails, setCategoryDetails] = useState([]);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [hotelCategoryId, setHotelCategoryId] = useState("");

  // state for external images..
  const [openDialogExternal, setOpenDialogExternal] = useState(false);

  const [apiUrls, setApiUrls] = useState("");
  const [payloadBody, setPayloadBody] = useState("");
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [isLoading, setIsLoading] = useState(false);

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };


  const handleCloseDialogExternal = () => {
    setOpenDialogExternal(false);
  };

  const { jHipsterAuthToken } = useAuthJHipster();

  useEffect(() => {
    if (!jHipsterAuthToken) return;

    setIsLoading(true);

    const fetchData = async () => {
      if (!jHipsterAuthToken) return;

      try {
        const data = await mapProductTypesToCustomFields(jHipsterAuthToken);
        console.log('show me the data', data);
        
        if (data && data.length > 0) {

          setCategoryDetails(data);

          setProductTypes(data.map((category) => category.categoryName));

          setProductType(data[0].categoryName);

          setCategoryId(data[0].categoryId);

          setCustomFields(
            data[0].customFields.map((field) => ({
              name: field.name,
              value: "",
              external: field.external,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch category details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [jHipsterAuthToken]);


  const [selectedHotel, setSelectedHotel] = useState("");
  const [hotels, setHotels] = useState([]);

  const SPRING_URL = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;
  let apiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL;

  useEffect(() => {
    if (hotelCategoryId) {
      const fetchHotelDetails = async () => {
        const url = `${SPRING_URL}/api/jdl/hotel-details?categoryId=${hotelCategoryId}`;
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jHipsterAuthToken}`,
            },
          });
          if (!response.ok) throw new Error("Failed to fetch hotel details");
          const hotelData = await response.json();
          setHotels(hotelData);
          if (hotelData.length > 0) {
            setSelectedHotel(hotelData[0].name);
          }
        } catch (error) {
          console.error("Error fetching hotel details:", error);
          setHotels([]);
        }
      };

      fetchHotelDetails();
    }
  }, [hotelCategoryId]);

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const updateImageUrl = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const handleProductTypeChange = (e) => {
    const selectedType = e.target.value;
    setProductType(selectedType);

    const selectedCategory = categoryDetails.find(
      (category) => category.categoryName === selectedType
    );

    if (selectedCategory) {
      setCustomFields(
        selectedCategory.customFields.map((field) => ({ ...field, value: "" }))
      );
      setCategoryId(selectedCategory.categoryId);

      if (selectedType === "Room") {
        const hotelCategory = categoryDetails.find(
          (category) => category.categoryName === "Hotel"
        );
        if (hotelCategory) {
          setHotelCategoryId(hotelCategory.categoryId);
        }
      } else {
        setSelectedHotel("");
        setHotelCategoryId("");
      }
    } else {
      console.error("No category found for the selected type:", selectedType);
      setCustomFields([]);
      setCategoryId("");
      setSelectedHotel("");
      setHotelCategoryId("");
    }
  };

  const aggregatedCustomFields = customFields.reduce((acc, field) => {
    acc[field.name] = field.value;
    return acc;
  }, {});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // let customFieldsPayload = aggregatedCustomFields;
    let customFieldsPayload = { ...aggregatedCustomFields };

    const imageField = customFields.find(
      (field) => field.name === "images" && field.external
    );
    const description = customFields.find(
      (field) => field.name === "description"
    );

    if (productType === "Room" && selectedHotel) {
      customFieldsPayload = {
        ...customFieldsPayload,
        hotelName: selectedHotel,
      };
      delete customFieldsPayload.hotelname;
      delete customFieldsPayload.name;
    } else if (productType === "Hotel") {
      delete customFieldsPayload.name;
      delete customFieldsPayload.images;
    } else if (productType === "Flight") {
      delete customFieldsPayload.name;
    } else if (productType === "Adon") {
      delete customFieldsPayload.images;
    } else if (productType === "Bundle") {
      delete customFieldsPayload.name;
      delete customFieldsPayload.images;
    } else if (
      productType === "TravelInsurance" ||
      productType === "Travel Insurance"
    ) {
      // delete customFieldsPayload.images;
      let newAddOnType = productType
        .replace(/\s+/g, "")
        .replace(/([a-z])([A-Z])/g, "$1 $2");
      customFieldsPayload.addOnType = newAddOnType;
      console.log("passing");
    }

    customFieldsPayload.price = price;

    console.log("show me the productName", productName);

    customFieldsPayload.name = productName;

    const formData = {
      productName,
      productType,
      price,
      description: description?.value,
      categoryId,
      imageUrls,
      customFields: customFieldsPayload,
      ...(dynamicInventory && {
        apiURLInventory,
        apiHeadersInventory,
        payloadBodyInventory,
      }),
      ...(dynamicPrice && { apiURLPrice, apiHeadersPrice, payloadBodyPrice }),
    };

    let correctedEndpointPathName = getPluralForm(productType);
    console.log("correctedEndpointPathName", correctedEndpointPathName);

    let transformedFormData = transformPayloadSubmitProduct(formData);
    console.log("transformedFormData:", transformedFormData);

    try {
      const response = await fetch(
        `${SPRING_URL}/api/${correctedEndpointPathName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jHipsterAuthToken}`,
          },
          body: JSON.stringify(transformedFormData),
        }
      );

      
      alert("Product added successfully");

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }


    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const handleCustomFieldChange = (index, newValue) => {
    const updatedFields = customFields.map((field, idx) => {
      if (idx === index) {
        return {
          ...field,
          value: newValue,
        };
      }
      return field;
    });

    console.log("Updated Fields:", updatedFields);

    setCustomFields(updatedFields);
  };

  const handleAddHeaderFieldInventory = () => {
    setApiHeadersInventory([...apiHeadersInventory, { key: "", value: "" }]);
  };

  const handleHeaderChangeInventory = (index, type, value) => {
    const updatedHeaders = apiHeadersInventory.map((header, i) => {
      if (i === index) {
        return { ...header, [type]: value };
      }
      return header;
    });
    setApiHeadersInventory(updatedHeaders);
  };

  const handleAddHeaderFieldPrice = () => {
    setApiHeadersPrice([...apiHeadersPrice, { key: "", value: "" }]);
  };

  const handleHeaderChangePrice = (index, type, value) => {
    const updatedHeaders = apiHeadersPrice.map((header, i) => {
      if (i === index) {
        return { ...header, [type]: value };
      }
      return header;
    });
    setApiHeadersPrice(updatedHeaders);
  };

  const [file, setFile] = useState(null);

  const handleSubmitFile = async () => {
    if (!productType) {
      alert("Please select a product type before uploading the CSV file.");
      return;
    }
  
    if (!file) {
      alert("No file selected");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("categoryId", categoryId);
  
  
    try {
      const response = await fetch(`${apiUrl}/product-bulk-upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jHipsterAuthToken}` },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Bulk upload failed");
      }
  
      const products = await response.json();
  
    
      for (const product of products) {
        await saveProduct(product);
      }
  
      alert("Bulk upload completed successfully.");
    } catch (error) {
      console.error("Error during bulk upload:", error);
      alert("Bulk upload failed.");
    }
  };


  const saveProduct = async (productData) => {
    if (!productData.productType) {
      console.error("Missing productType for product:", productData.name);
      return;
    }
  
    if (isNaN(productData.price)) {
      console.error("Invalid price format:", productData.price);
      return;
    }
  
    const formData = {
      productName: productData.name,
      productType: productData.productType,
      price: Number(productData.price),
      description: productData.description,
      images: productData.images ? productData.images.split(";") : [], 
      customFields: productData.customFields || {},
      ...(dynamicInventory && {
        apiURLInventory,
        apiHeadersInventory,
        payloadBodyInventory,
      }),
      ...(dynamicPrice && { apiURLPrice, apiHeadersPrice, payloadBodyPrice }),
    };
  
    const correctedEndpointPathName = getPluralForm(productData.productType);
    if (!correctedEndpointPathName) {
      console.error("Invalid product type:", productData.productType);
      return;
    }
  
    const transformedFormData = transformPayloadSubmitProduct(formData);
  
    try {
      const response = await fetch(
        `${SPRING_URL}/api/${correctedEndpointPathName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jHipsterAuthToken}`,
          },
          body: JSON.stringify(transformedFormData),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to save product");
      }
      console.log("Product saved successfully:", productData.name);
    } catch (error) {
      console.error("Error saving product:", productData.name, error);
    }
  };


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setShowSubmitButton(true);
  };


  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, idx) => idx !== index));
  };

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const handleSaveExternalData = () => {
    const externalData = {
      apiUrl,
      headers: headers.reduce(
        (acc, cur) => ({ ...acc, [cur.key]: cur.value }),
        {}
      ),
      payloadBody,
    };
    console.log("External Data:", externalData);
    handleCloseDialogExternal();
  };

  const priceField = customFields.find((field) => field.name === "price");

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "56px",
    }),
    valueContainer: (base) => ({
      ...base,
      height: "56px",
      padding: "0 16px",
    }),
    input: (base) => ({
      ...base,
      margin: "0px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "lightgray" : "white",
      color: "black",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "lightblue",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "black",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "red",
      ":hover": {
        backgroundColor: "red",
        color: "white",
      },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className="bg-opacity-none flex min-h-screen flex-col items-center justify-center bg-gray-100 text-black">
      <div className="ml-40 text-2xl font-bold mt-3">
        {productType ? `Add ${productType}` : "Add Product"}
      </div>
      <form
        onSubmit={handleSubmit}
        className="ml-44 w-full max-w-4xl rounded-lg bg-white p-8 shadow-md input-form-move"
      >
        <div className="relative flex flex-col mb-4" style={{ width: "300px" }}>
          <label htmlFor="productType" className="">
            Travel Product Type
          </label>

          <select
            id="productType"
            name="productType"
            value={productType}
            onChange={handleProductTypeChange}
            className="peer block w-full appearance-none border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 disabled:bg-gray-100 disabled:hover:border-gray-200"
          >
            <option value="" disabled >
              Select Product Type
            </option>
            {productTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="h-5 w-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                // stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>

        <h2 className="mb-6 text-xl font-bold">Basic Information</h2>

        <div className="mb-6 grid grid-cols-2  gap-6">
          <div className="relative flex flex-col">
            <label htmlFor="productName" className="">
              Product Name *
            </label>
            <input
              id="productName"
              type="text"
              name="productName"
              placeholder=" "
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:bg-gray-100 disabled:hover:border-gray-200"
            />
          </div>

          <div className="relative flex flex-col">
            <label htmlFor="price" className="">
              Price *
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={priceField && priceField.external}
              required
              className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 disabled:bg-gray-100 disabled:hover:border-gray-200"
            />
          </div>

          {/* room type */}
          {productType === "Room" && (
            <div className="relative col-span-2 flex flex-col">
              {" "}
              {/* Adjusted for full width if needed */}
              <label
                htmlFor="hotelSelect"
                className="text-sm font-medium text-gray-700"
              >
                Select Hotel
              </label>
              <select
                id="hotelSelect"
                value={selectedHotel}
                onChange={(e) => setSelectedHotel(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.name}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* ending room type */}

          <h1 className="relative col-span-2 flex flex-col">
            Fill out the custom fields below to add the product.
          </h1>

          {isLoading ? (
            <div className="col-span-2 flex justify-center items-center">
              <div className="spinner"></div>
            </div>
          ) : (
            (() => {
              return customFields.map((field, index) => {
                if (
                  field.name === "name" ||
                  field.name === "images" ||
                  field.name === "price" ||
                  field.name === "hotelname"
                ) {
                  return null;
                }

                if (field?.options) {
                  console.log("field.name:", field.name);
                  console.log("field.options:", field.options);

                  const transformedOptions = field.options.map((option) => ({
                    value: option.id,
                    label: option.name,
                  }));

                  return (
                    <div key={index} className="flex flex-col mb-4">
                      {/* Container for fields */}
                      <div className="flex flex-col w-full">
                        <div className="mb-2">
                          <label htmlFor={`customField-${index}`}>
                            {field.name}
                          </label>
                        </div>

                        <Select
                          id={`customField-${index}`}
                          styles={customStyles}
                          isMulti={true}
                          options={transformedOptions}
                          menuPortalTarget={document.body}
                          className="basic-multi-select dropdown-high-z"
                          classNamePrefix="select"
                          onChange={(selectedOptions) => {
                            console.log("selectedOptions", selectedOptions);
                            const optionsArray = Array.isArray(selectedOptions)
                              ? selectedOptions
                              : [selectedOptions];
                            const values = optionsArray.map(
                              (option) => option.value
                            );
                            handleCustomFieldChange(index, values.join(","));
                          }}
                          value={transformedOptions.filter((option) =>
                            field.value
                              .split(",")
                              .includes(option.value.toString())
                          )}
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={index} className="grid grid-rows-1 gap-6">
                    <div
                      className={
                        field.type === "TextBlob" ? "col-span-2" : "relative"
                      }
                    >
                      <label htmlFor={`customValue-${index}`}>
                        {capitalizeFirstLetter(field.name)}
                      </label>
                    
                      {field.type === "TextBlob" ? (
                        <Editor
                          id={`customValue-${index}`}
                          value={field.value || ""}
                          onChange={(newValue) =>
                            handleCustomFieldChange(index, newValue)
                          }
                          disabled={field.external}
                          className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500"
                        />
                      ) : field.name?.toLowerCase() === "startdate" ||
                        field.name?.toLowerCase() === "enddate" ? (
                        <input
                          id={`customValue-${index}`}
                          type="date"
                          value={field.value || ""}
                          onChange={(e) =>
                            handleCustomFieldChange(index, e.target.value)
                          }
                          disabled={field.external}
                          className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500"
                        />
                      ) : (
                        <input
                          id={`customValue-${index}`}
                          type="text"
                          value={field.value || ""}
                          onChange={(e) =>
                            handleCustomFieldChange(index, e.target.value)
                          }
                          disabled={field.external}
                          className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>
                );
              });
            })()
          )}
        </div>

        <Dialog
          open={openDialogExternal}
          onClose={handleCloseDialogExternal}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Add External Data</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="apiUrl"
              label="API URL"
              type="text"
              fullWidth
              value={apiUrls}
              onChange={(e) => setApiUrls(e.target.value)}
            />
            {headers.map((header, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <TextField
                  margin="dense"
                  label="Header Key"
                  type="text"
                  value={header.key}
                  onChange={(e) =>
                    handleHeaderChange(index, "key", e.target.value)
                  }
                  style={{ marginRight: "10px" }}
                />
                <TextField
                  margin="dense"
                  label="Header Value"
                  type="text"
                  value={header.value}
                  onChange={(e) =>
                    handleHeaderChange(index, "value", e.target.value)
                  }
                />
                <IconButton onClick={() => removeHeader(index)}>
                  <MdRemoveCircle />
                </IconButton>
                {headers.length - 1 === index && (
                  <IconButton onClick={addHeader}>
                    <AddCircleOutlineIcon />
                  </IconButton>
                )}
              </div>
            ))}
            <TextField
              margin="dense"
              id="payloadBody"
              label="Payload Body"
              type="text"
              multiline
              rows={4}
              fullWidth
              value={payloadBody}
              onChange={(e) => setPayloadBody(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogExternal} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveExternalData} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <div className="mt-4 flex justify-center space-x-2">
          <button
            type="submit"
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[44px] mt-[10px]"
          >
            Save
          </button>
          <label
            htmlFor="file-upload"
            className=" mt-[10px] mb-[0px] cursor-pointer rounded bg-blue-500 px-6 py-2.5 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Upload File
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {showSubmitButton && (
            <button
              type="button" 
              onClick={handleSubmitFile}
              className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[44px] mt-[10px]"
            >
              Submit File
            </button>
          )}
        </div>

      </form>
      <AlertDialogSlide
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
      />
    </div>
  );
};

export default ProductForm;