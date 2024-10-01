"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import "./ProductForm.css";
import AlertDialogSlide from "./AlertDialogSlide";
import { mapProductTypesToCustomFields } from "@/services/productFormService";
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
  const [externalData, setExternalData] = useState("");

  const [apiUrls, setApiUrls] = useState("");
  const [payloadBody, setPayloadBody] = useState("");
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;

  const handleOpenDialogExternal = () => {
    setOpenDialogExternal(true);
  };

  const handleCloseDialogExternal = () => {
    setOpenDialogExternal(false);
  };

  const { jHipsterAuthToken } = useAuthJHipster();

  useEffect(() => {
    if (!jHipsterAuthToken) return;

    setIsLoading(true);

    // const fetchProductDetails = async (fieldName) => {
    //   try {
    //     const response = await fetch(
    //       `${apiUrl}/populate-package-details?package_type=${fieldName}`,
    //       {
    //         method: "GET",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //       }
    //     );
    //     if (!response.ok) {
    //       throw new Error(`Failed to fetch details for ${fieldName}`);
    //     }
    //     const data = await response.json();
    //     return data.map((product) => ({
    //       id: product.product_id,
    //       name: product.product_name,
    //     }));
    //   } catch (error) {
    //     console.error(`Error fetching details for ${fieldName}:`, error);
    //     return [];
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    const fetchData = async () => {
      if (!jHipsterAuthToken) return;

      try {
        const data = await mapProductTypesToCustomFields(jHipsterAuthToken);

        console.log("data!?!?!:", data);
        if (data && data.length > 0) {
          console.log("detailedCategories:", data);
          //
          setCategoryDetails(data);
          console.log("here..!!!.");
          setProductTypes(data.map((category) => category.categoryName));
          console.log("here...");
          setProductType(data[0].categoryName);
          console.log("data[0].categoryName:", data[0].categoryName);
          console.log("here...1");
          setCategoryId(data[0].categoryId);
          console.log("data[0].categoryId:", data[0].categoryId);
          console.log("here...2");
          setCustomFields(
            data[0].customFields.map((field) => ({
              name: field.name,
              value: "",
              external: field.external,
            }))
          );
          console.log("here...3");
          console.log("data>>>", data);
          console.log("data[0].customFields:", data[0].customFields);
        }
      } catch (error) {
        console.error("Failed to fetch category details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [jHipsterAuthToken]);

  console.log("cuustom fields:", customFields);

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
    console.log("description:", description?.value);
    let imagePayload;

    imagePayload = imageUrls.filter((url) => url !== "");

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
      // imageUrls,
      images: imagePayload,
      customFields: customFieldsPayload,
      ...(dynamicInventory && {
        apiURLInventory,
        apiHeadersInventory,
        payloadBodyInventory,
      }),
      ...(dynamicPrice && { apiURLPrice, apiHeadersPrice, payloadBodyPrice }),
    };

    console.log("Form Data:", formData);

    try {
      const response = await fetch(`${SPRING_URL}/api/jdl/create-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jHipsterAuthToken}`,
        },
        body: JSON.stringify([formData]),
      });

      // tmp as running the spring api locally is returning error at the part of running the jhipster entity create process
      alert("Product added successfully");

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // const result = await response.json();
      console.log("Product added successfully:", result);
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
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("categoryId", categoryId);

      try {
        const response = await fetch(`${apiUrl}/product-bulk-upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (response.status === 201) {
          alert("File uploaded successfully");
        }
      } catch (error) {
        console.error("Upload error:", error);
      }
    } else {
      console.log("No file selected");
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
    <div className="bg-opacity-none flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="ml-40 text-2xl font-bold mt-3">Add Product</div>
      <form
        onSubmit={handleSubmit}
        className="ml-44 w-full max-w-4xl rounded-lg bg-white p-8 shadow-md input-form-move"
      >
        <h2 className="mb-6 text-xl font-bold">Basic Information</h2>

        <div className="mb-6 grid grid-cols-2 gap-6">
          <div className="relative col-span-2 flex flex-col">
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
            <label
              htmlFor="productName"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-blue-500"
            >
              Product Name *
            </label>
          </div>

          <div className="relative col-span-2 mb-4 flex flex-col">
            <div className="form-input">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative mb-2 flex items-center">
                  <input
                    id={`imageUrl-${index}`}
                    type="text"
                    name={`imageUrl-${index}`}
                    // placeholder={
                    //   customFields.find((field) => field.name === 'images' && field.external)
                    //     ? 'Fill out external parameters'
                    //     : 'Enter Image URL'
                    // }
                    value={url}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    className="peer flex-grow border border-gray-200 px-4 text-base placeholder:text-gray-500 hover:border-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:bg-gray-100 disabled:hover:border-gray-200"
                    required={
                      !customFields.find(
                        (field) => field.name === "images" && field.external
                      )
                    }
                  />
                  <label htmlFor={`imageUrl-${index}`}>
                    {customFields.find(
                      (field) => field.name === "images" && field.external
                    )
                      ? "Press the plus icon to fill out the External API Parameters"
                      : "Image URL"}
                  </label>
                  {/* {index === imageUrls.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addImageUrl();
                      }}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      aria-label="Add another image URL"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  )}

                  {customFields.find((field) => field.name === 'images' && field.external) && (
                    <IconButton
                      onClick={handleOpenDialogExternal}
                      aria-label="Add API specification"
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  )} */}
                  {/* Check if images field is external;*/}
                  {/* {customFields.find((field) => field.name === 'images' && field.external) ? (
                    <IconButton
                      color="primary"
                      onClick={handleOpenDialogExternal}
                      aria-label="Add API specification"
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  ) : (
                    index === imageUrls.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addImageUrl();
                        }}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                        aria-label="Add another image URL"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    )
                  )} */}

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addImageUrl();
                    }}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                    aria-label="Add another image URL"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col">
            <select
              id="productType"
              name="productType"
              value={productType}
              onChange={handleProductTypeChange}
              className="peer block w-full appearance-none border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 disabled:bg-gray-100 disabled:hover:border-gray-200"
            >
              <option value="" disabled selected>
                Select Product Type
              </option>
              {productTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <label
              htmlFor="productType"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-blue-500"
            >
              Travel Product Type
            </label>

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

          <div className="relative flex flex-col">
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={priceField && priceField.external}
              required
              className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 disabled:bg-gray-100 disabled:hover:border-gray-200"
            />
            <label
              htmlFor="price"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-blue-500"
            >
              Price *
            </label>
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

          {/* <div className="col-span-2 flex items-center">
            <label className="flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={dynamicInventory}
                onChange={() => setDynamicInventory(!dynamicInventory)}
                className="mr-2"
              />
              Enable Dynamic Inventory
            </label>
            <div className="tooltip ml-2">
              <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500" />
              <span className="tooltiptext">
                Headers set here need to be added to custom fields section!
              </span>
            </div>
          </div> */}

          {/* {dynamicInventory && (
            <>
              <div className="relative col-span-2 flex flex-col">
                <input
                  id="apiURLInventory"
                  type="text"
                  value={apiURLInventory}
                  onChange={(e) => setApiURLInventory(e.target.value)}
                  required
                  className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 disabled:bg-gray-100 disabled:hover:border-gray-200"
                />
                <label
                  htmlFor="apiURLInventory"
                  className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-blue-500"
                >
                  API URL
                </label>
              </div>

              {apiHeadersInventory.map((header, index) => (
                <div key={index} className="col-span-2 grid grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Header Key"
                    value={header.key}
                    onChange={(e) => handleHeaderChangeInventory(index, 'key', e.target.value)}
                    className="col-span-1 rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Header Value"
                    value={header.value}
                    onChange={(e) => handleHeaderChangeInventory(index, 'value', e.target.value)}
                    className="col-span-1 rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div className="relative col-span-2 flex flex-col">
                <label
                  htmlFor="payloadBodyInventory"
                  className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-blue-500"
                >
                  Payload Body
                </label>
                <textarea
                  id="payloadBodyInventory"
                  value={payloadBodyInventory}
                  onChange={(e) => setPayloadBodyInventory(e.target.value)}
                  className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 disabled:bg-gray-100 disabled:hover:border-gray-200"
                />
              </div>

              <div className="col-span-2">
                <button
                  type="button"
                  onClick={handleAddHeaderFieldInventory}
                  className="transform rounded bg-blue-500 px-4 py-2 text-white transition-transform hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Header Field
                </button>
              </div>
            </>
          )} */}

          {/* <div className="col-span-2 flex items-center">
            <label className="flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={dynamicPrice}
                onChange={() => setDynamicPrice(!dynamicPrice)}
                className="mr-2"
              />
              Enable Dynamic Price
            </label>
            <div className="tooltip ml-2">
              <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500" />
              <span className="tooltiptext">
                Headers set here need to be added to custom fields section!
              </span>
            </div>
          </div>

          {dynamicPrice && (
            <>
              <div className="col-span-2 flex flex-col">
                <label className="mb-2 font-medium text-gray-700">API URL</label>
                <input
                  type="text"
                  value={apiURLPrice}
                  onChange={(e) => setApiURLPrice(e.target.value)}
                  className="rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {apiHeadersPrice.map((header, index) => (
                <div key={index} className="col-span-2 grid grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Header Key"
                    value={header.key}
                    onChange={(e) => handleHeaderChangePrice(index, 'key', e.target.value)}
                    className="col-span-1 rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Header Value"
                    value={header.value}
                    onChange={(e) => handleHeaderChangePrice(index, 'value', e.target.value)}
                    className="col-span-1 rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={handleAddHeaderFieldPrice}
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Header Field
                </button>
              </div>
              <div className="col-span-2 flex flex-col">
                <label className="mb-2 font-medium text-gray-700">Payload Body</label>
                <textarea
                  value={payloadBodyPrice}
                  onChange={(e) => setPayloadBodyPrice(e.target.value)}
                  className="rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )} */}

          <h1>Fill out the custom fields below to add the product.</h1>
          {isLoading ? (
            <div className="col-span-2 flex justify-center items-center">
              <div className="spinner"></div>
            </div>
          ) : (
            customFields.map((field, index) => {
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
                  <div
                    key={index}
                    className="col-span-2 grid grid-cols-2 gap-6"
                  >
                    <div className="flex justify-end items-center ">
                      <p htmlFor={`customField-${index}`}>{field.name}</p>
                    </div>

                    <Select
                      id={`customField-${index}`}
                      styles={customStyles}
                      isMulti={field.name === "transport"}
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
                        field.value.split(",").includes(option.value.toString())
                      )}
                    />
                  </div>
                );
              }

              return (
                <div key={index} className="col-span-2 grid grid-cols-2 gap-6">
                  <div className="relative">
                    <input
                      id={`customName-${index}`}
                      type="text"
                      value={field.name}
                      readOnly
                      className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`customName-${index}`}
                      className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-blue-500"
                    >
                      Custom Field Key
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id={`customValue-${index}`}
                      type="text"
                      placeholder="Enter value"
                      value={field.value || ""}
                      onChange={(e) =>
                        handleCustomFieldChange(index, e.target.value)
                      }
                      disabled={field.external}
                      className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`customValue-${index}`}
                      className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-blue-500"
                    >
                      Custom Field Value
                    </label>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* pop up window for external fields */}
        {/* <Dialog
          open={openDialogExternal}
          onClose={handleCloseDialogExternal}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Add External Data</DialogTitle>
          <DialogContent>
            <DialogContent>Please enter the external data for this field.</DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="externalData"
              label="External Data"
              type="text"
              fullWidth
              value={externalData}
              onChange={handleExternalDataChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogExternal} color="primary">
              Cancel
            </Button>
            <Button onClick={handleCloseDialogExternal} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog> */}
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

        {/* <div className="flex justify-evenly">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
          <div>
            <input type="file" />
          </div>
        </div> */}
        <div className="mt-4 flex justify-center space-x-4">
          <button
            type="submit"
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
          <label
            htmlFor="file-upload"
            className="cursor-pointer rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              type="button" // Use 'button' here to prevent form submission when clicking this button
              onClick={handleSubmitFile}
              className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
