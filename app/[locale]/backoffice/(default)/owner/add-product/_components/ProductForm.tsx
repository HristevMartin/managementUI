"use client";

import React, { useState, useEffect } from "react";
import AlertDialogSlide from "./AlertDialogSlide";
import {
  getPluralForm,
  mapProductTypesToCustomFields,
} from "@/services/productFormService";
import { useAuthJHipster } from "@/context/JHipsterContext";
import Select from "react-select";
import { useModal } from "@/context/useModal";
import Editor from "@/components/editor/page";

import "./ProductForm.css";
import "./page.css";
import { useTranslations } from "next-intl";

interface AnyDict {
  [key: string]: any;
}

const SPRING_URL = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;
let apiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL;

const ProductForm = () => {
  const [productName, setProductName] = useState<string>("");
  const [productType, setProductType] = useState<string>("");
  const [price, setPrice] = useState("");
  const [productTypes, setProductTypes] = useState<any>([]);
  const [customFields, setCustomFields] = useState<any[]>([
    { name: "", value: "" },
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [categoryId, setCategoryId] = useState<any>("");
  const [categoryDetails, setCategoryDetails] = useState<any>([]);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [localizedValues, setLocalizedValues] = useState<AnyDict>({});
  const [imagesBase64, setImagesBase64] = useState<any>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [supportedLanguages, setSupportedLanguages] = useState<any[]>([]);
  const [productNameLocales, setProductNameLocales] = useState<AnyDict>({});

  const { jHipsterAuthToken } = useAuthJHipster();
  const { showModal } = useModal();

  const capitalizeFirstLetter = (string: string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
    if (!jHipsterAuthToken) return;

    setIsLoading(true);

    const fetchData = async () => {
      try {
        const data = await mapProductTypesToCustomFields(jHipsterAuthToken);

        if (data && data.length > 0) {
          setCategoryDetails(data);
          setProductTypes(data.map((category) => category.categoryName));
          setProductType(data[0].categoryName);
          setCategoryId(data[0].categoryId);

          setCustomFields(
            data[0].customFields.map((field) => {
              const localizedFields = data[0].localizedFields;
              return {
                name: field.name,
                value: "",
                isLocalized: localizedFields.includes(field.name),
              };
            })
          );
        }
      } catch (error) {
        console.error("Failed to fetch category details:", error);
        showModal("error", `Failed to fetch category details`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [jHipsterAuthToken]);

  useEffect(() => {
    const allLanguages = languages.map((obj) => ({
      code: obj.code,
      label: obj.name,
    }));
    setSupportedLanguages(allLanguages);

    let languageObj = allLanguages.reduce((acc: any, lang: any) => {
      acc[lang.code] = "";
      return acc;
    }, {});

    setProductNameLocales(languageObj);
  }, [languages]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch(`${SPRING_URL}/api/languages`, {
          headers: {
            Authorization: `Bearer ${jHipsterAuthToken}`,
          },
        });

        if (!response.ok) {
          showModal(
            response.status.toString(),
            `Error: ${response.statusText}`
          );
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const languages = await response.json();
        setLanguages(languages);
      } catch (error) {
        console.error(error);

        showModal("500", "An error occurred while fetching languages.");
      }
    };

    if (jHipsterAuthToken) {
      fetchLanguages();
    }
  }, [jHipsterAuthToken]);


  const handleProductTypeChange = (e: any) => {
    const selectedType = e.target.value;
    setProductType(selectedType);
  
    const selectedCategory = categoryDetails.find(
      (category: any) => category?.categoryName === selectedType
    );
  
    if (selectedCategory) {
      const fieldsWithLocalization = selectedCategory?.customFields.map(
        (field: any) => {
          if (selectedCategory?.localizedFields.includes(field.name)) {
            return {
              ...field,
              value: "",
              isLocalized: true,
            };
          }
          return { ...field, value: "" };
        }
      );
  
      console.log("fieldsWithLocalization!!??!?", fieldsWithLocalization);
      setCustomFields(fieldsWithLocalization);
      setCategoryId(selectedCategory?.categoryId);
    } else {
      console.error("No category found for the selected type:", selectedType);
      showModal("error", `No category found for the selected type: ${selectedType}`);
  
      setCustomFields([]);
      setCategoryId("");
    }
  };
  

  const aggregatedCustomFields = customFields.reduce((acc: any, field: any) => {
    acc[field.name] = field.value;

    return acc;
  }, {});

  function populateRelationshipFields(customFieldsPayload: any) {
    customFields.forEach((field: any) => {
      if (field.type == "relationship") {
        customFieldsPayload[field.name] = {
          id: field.value,
        };
      } else {
        customFieldsPayload[field.name] = field.value;
      }
    });
  }

  console.log("productType", productType);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (isNaN(price) || price <= 0) {
      showModal("fail", "Please provide a valid price.");
      return;
    }

    // if (!imagesBase64 || imagesBase64.length === 0) {
    //   showModal("fail", "Please upload at least one image.");
    //   return;
    // }

    // const isValidBase64 = (str: string) => {
    //   const base64Pattern = /^data:image\/(png|jpg|jpeg|gif|bmp|webp);base64,/;
    //   return base64Pattern.test(str);
    // };

    // const invalidImages = imagesBase64.filter((img: string) => !isValidBase64(img));

    // if (invalidImages.length > 0) {
    //   showModal("fail", "One or more uploaded images are not valid.");
    //   return;
    // }
  

    let customFieldsPayload = { ...aggregatedCustomFields };

    populateRelationshipFields(customFieldsPayload);

    let imagesString = imagesBase64.join(",");

    customFieldsPayload.name = productName;
    customFieldsPayload.price = price;

    if (imagesString) {
      customFieldsPayload.images = imagesString;
    }

    const formData = {
      customFields: customFieldsPayload,
    };

    let correctedEndpointPathName = getPluralForm(productType);

    let submitPayload = formData.customFields;
    console.log("submitPayload", submitPayload);

    try {
      const response = await fetch(
        `${SPRING_URL}/api/${correctedEndpointPathName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jHipsterAuthToken}`,
          },
          body: JSON.stringify(submitPayload),
        }
      );



      if (!response.ok) {
        throw new Error("Network response was not ok");
      }


      const saveLocales = customFields.some((x: any) => x?.isLocalized);

      if (response.status === 201) {
        if (saveLocales) {
          if (response.status === 201) {
            // take this logic to a separate utils file
            let data = await response.json();
            console.log("show me the data", data);

            let productId = data.id;
            let newPayload = {
              entityName: productType,
              productId,
              localizationsFields: {
                name: productNameLocales,
                ...localizedValues,
              },
            };

            const localeSaved = await fetch(
              `${SPRING_URL}/api/localisation/upsert`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${jHipsterAuthToken}`,
                },
                body: JSON.stringify(newPayload),
              }
            );

            if (!localeSaved.ok) {
              throw new Error("Network response was not ok");
            }

            showModal("success", "Product added successfully");
          }
        } else {
          showModal("success", "Product added successfully");
        }
      } else {
        showModal("fail", "Please try again");
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const handleCustomFieldChange = (index: number, newValue: string) => {
    console.log("newValue", newValue);

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
          
          showModal("success", "File uploaded successfully!");
        } else {
          
          showModal("error", `Unexpected status: ${response.status}`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        
        showModal("error", `File upload failed: ${error}`);
      }
    } else {
      console.log("No file selected");
      
      showModal("error", "No file selected. Please choose a file to upload.");
    }
  };
  

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
    setShowSubmitButton(true);
  };

  const customStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: "46px",
      height: "auto",
    }),
    valueContainer: (base: any) => ({
      ...base,
      minHeight: "56px",
    }),
    input: (base: any) => ({
      ...base,
    }),
    placeholder: (base: any) => ({
      ...base,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "lightgray" : "white",
      color: "black",
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "lightblue",
      marginBottom: 12,
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "black",
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      marginBottom: 12,
    }),
    clearIndicator: (base: any) => ({
      ...base,
      marginBottom: 12,
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "red",
      ":hover": {
        backgroundColor: "red",
        color: "white",
      },
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    menu: (base: any) => ({ ...base, zIndex: 9999 }),
  };

  const isProductNameLocalized = customFields.some(
    (field) => field?.name === "name" && field?.isLocalized
  );

  const handleImageFileChange = (e: any, index: number) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result;
        let newImagesBase64 = [...imagesBase64];
        newImagesBase64[index] = base64String;

        setImagesBase64(newImagesBase64.filter((x) => x !== undefined));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-3/5 max-w-screen flex flex-col items-center">
      <div className="text-2xl font-bold mt-3 w-4/5 flex justify-center flex mt-[20px] mb-[20px]">
        {productType ? `Add ${productType}` : "Add Product"}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ width: "100%" }}
        className="w-full max-w-4xl rounded-lg bg-white p-8 shadow-md input-form-move"
      >
        <div className="relative mb-4" style={{ width: "300px" }}>
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
            <option value="" disabled>
              Select Product Type
            </option>
            {productTypes.map((type: any, index: number) => (
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
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>

        <h2 className="mb-6 text-xl font-bold">Basic Information</h2>

        <div className="mb-6 grid grid-cols-2  gap-6">
          <div className="relative flex flex-col">
            <label htmlFor="productName">Product Name *</label>
            {isProductNameLocalized ? (
              supportedLanguages.map((lang) => (
                <input
                  key={lang.code}
                  id={`productName-${lang.code}`}
                  type="text"
                  name={`productName-${lang.code}`}
                  placeholder={lang.label}
                  value={productNameLocales[lang.code]}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setProductNameLocales({
                      ...productNameLocales,
                      [lang.code]: newValue,
                    });
                    if (lang.code === "en") {
                      setProductName(newValue);
                    }
                  }}
                  required
                  className="mb-2 peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:bg-gray-100 disabled:hover:border-gray-200"
                />
              ))
            ) : (
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
            )}
          </div>

          <div className="relative flex flex-col">
            <label htmlFor="price">Price *</label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 disabled:bg-gray-100 disabled:hover:border-gray-200"
            />
          </div>

          <h1 className="relative col-span-2 flex flex-col">
            Fill out the custom fields below to add the product.
          </h1>

          {isLoading ? (
            <div className="flex justify-center items-center">
              <div className="spinner"></div>
            </div>
          ) : (
            (() => {
              return customFields.map((field: any, index: number) => {
                if (field.name === "name" || field.name === "price") {
                  return null;
                }

                if (field?.name === "images") {
                  return (
                    <div key={index} className="flex flex-col mb-4">
                      <label htmlFor={`customField-${index}`}>
                        {capitalizeFirstLetter(customFields[index].name)}
                      </label>
                      <input
                        type="file"
                        id={`customField-${index}`}
                        onChange={(e) => handleImageFileChange(e, index)}
                        className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500"
                      />
                      {imagesBase64.map((image: string, index: number) => (
                        <>
                          <img
                            key={index}
                            src={image}
                            alt={`Preview ${customFields[index].name}`}
                            style={{
                              width: "50%",
                              marginTop: "10px",
                              height: "100px",
                            }}
                          />
                        </>
                      ))}
                    </div>
                  );
                }

                if (field?.options) {
                  const transformedOptions = field?.options.map(
                    (option: any) => ({
                      value: option.id,
                      label: option.name,
                    })
                  );

                  return (
                    <div key={index} className="flex flex-col mb-4">
                      <div className="flex flex-col w-full">
                        <div>
                          <label htmlFor={`customField-${index}`}>
                            {capitalizeFirstLetter(field?.name)}
                          </label>
                        </div>

                        <Select
                          id={`customField-${index}`}
                          styles={customStyles}
                          isMulti={true}
                          options={transformedOptions}
                          menuPortalTarget={document.body}
                          className="basic-multi-select dropdown-high-z border border-red-500"
                          classNamePrefix="select"
                          onChange={(selectedOptions) => {
                            const optionsArray = Array.isArray(selectedOptions)
                              ? selectedOptions
                              : [selectedOptions];
                            const values = optionsArray.map(
                              (option) => option.value
                            );
                            handleCustomFieldChange(index, values.join(","));
                          }}
                          value={transformedOptions.filter((option: any) =>
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
                      <label
                        style={{ marginBottom: "2px", display: "inline-block" }}
                        htmlFor={`customValue-${index}`}
                      >
                        {capitalizeFirstLetter(field?.name)}
                      </label>

                      {field?.type === "TextBlob" ? (
                        <Editor
                          id={`customValue-${index}`}
                          value={field.value || ""}
                          onChange={(newValue: any) =>
                            handleCustomFieldChange(index, newValue)
                          }
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
                          className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500"
                        />
                      ) : (
                        <>
                          {field?.isLocalized ? (
                            supportedLanguages.map((lang) => (
                              <input
                                key={lang.code}
                                id={`customValue-${index}-${lang.code}`}
                                type="text"
                                value={
                                  localizedValues[field.name] &&
                                  localizedValues[field.name][lang.code]
                                }
                                onChange={(e) => {
                                  console.log(
                                    "what is the field in here",
                                    field
                                  );
                                  const newValue = e.target.value;
                                  console.log(
                                    `Updating !! ${lang.code} for ${field.name} to ${newValue}`
                                  );
                                  setLocalizedValues((prev) => ({
                                    ...prev,
                                    [field.name]: {
                                      ...prev[field.name],
                                      [lang.code]: newValue,
                                    },
                                  }));

                                  // default to english
                                  if (lang.code === "en") {
                                    handleCustomFieldChange(index, newValue);
                                  }
                                }}
                                placeholder={lang.label}
                                className="mb-2 peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500"
                              />
                            ))
                          ) : (
                            <input
                              id={`customValue-${index}`}
                              type="text"
                              value={field.value || ""}
                              onChange={(e) =>
                                handleCustomFieldChange(index, e.target.value)
                              }
                              className="peer block w-full border border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              });
            })()
          )}
        </div>

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
