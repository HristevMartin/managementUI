'use client';

import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Settings, Save, RotateCcw, ChevronDown, Database, Server, Code, FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useAuthJHipster } from '@/context/JHipsterContext';
import { useModal } from '@/context/useModal';

const isValidJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

const formatResponsePayload = (inputValue) => {
  let formattedValue = inputValue;

  const templateRegex = /<#[^>]+>/g;
  let match;
  let lastIndex = 0;
  let result = '';

  while ((match = templateRegex.exec(inputValue)) !== null) {
    const jsonPart = inputValue.substring(lastIndex, match.index);
    result += jsonPart.replace(/\\(["\\])/g, '$1');

    result += match[0];
    lastIndex = templateRegex.lastIndex;
  }

  if (lastIndex < inputValue.length) {
    const jsonPart = inputValue.substring(lastIndex);
    result += jsonPart.replace(/\\(["\\])/g, '$1');
  }

  return result;
};

const ExternalConfiguration = () => {
  const [category, setCategory] = useState("");
  const [searchType, setSearchType] = useState("");
  const [recommendation, setRecommendation] = useState(false);
  const [externalAttributes, setExternalAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [expandedAttributes, setExpandedAttributes] = useState({});
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [responseParsers, setResponseParsers] = useState([{ key: "", value: "" }]);
  const [payload, setPayload] = useState("");
  const [payloadError, setPayloadError] = useState("");
  const [responsePayload, setResponsePayload] = useState("");
  const [responsePayloadError, setResponsePayloadError] = useState("");
  const { jHipsterAuthToken } = useAuthJHipster();
  const [categoryNames, setCategoryNames] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [searchableAttributes, setSearchableAttributes] = useState([]);
  const [relatedAttributes, setRelatedAttributes] = useState({});
  const [searchableRelationFields, setSearchableRelationFields] = useState([]);
  const [isDataPresent, setIsDataPresent] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const { showModal } = useModal ? useModal() : { showModal: () => { } };

  useEffect(() => {
    console.log("Current searchType:", searchType);
  }, [searchType]);


  useEffect(() => {
    const fetchCategoryNames = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/get-entity-names-list`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jHipsterAuthToken}`
          }
        });
        setCategoryNames(response.data);
      } catch (error) {
        console.error("Error fetching category names", error);
        setErrorMessage("Error fetching category names");
      }
    };

    if (jHipsterAuthToken) {
      fetchCategoryNames();
    }
  }, [jHipsterAuthToken]);

  // Check if data exists and fetch attributes when category changes
  useEffect(() => {
    if (category) {
      // Reset form fields when category changes
      setSearchType("");
      setSelectedAttributes([]);
      setSearchableAttributes([]);
      setSearchableRelationFields([]);
      setPayload("");
      setResponsePayload("");
      setHeaders([{ key: "", value: "" }]);
      setResponseParsers([{ key: "", value: "" }]);
      setWarningMessage("");
      setNotificationMessage("");
      setPayloadError("");
      setResponsePayloadError("");
      setAttributes([]);
      setExternalAttributes([]);
      setRelatedAttributes({});
      setExpandedAttributes({});

      checkIfDataPresent();
      fetchCategoryAttributes();
    }
  }, [category]);

  // Dedicated function to fetch attributes for the selected category
  const fetchCategoryAttributes = async () => {
    if (!category) return;

    try {
      console.log("Fetching attributes for category:", category);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/get-entity-by-name/${category}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jHipsterAuthToken}`
        }
      });

      const data = response.data;
      console.log("Received entity data:", data);

      // Handle case where fields might be empty or undefined
      const fields = data.fields || [];
      const newAttributes = fields.map(field => {
        const [key, type, ...rest] = field.split(' ');
        return {
          key,
          type,
          required: rest.includes('required'),
          unique: rest.includes('unique'),
          validations: [],
          isChecked: false,
          relationships: []
        };
      });

      // Add relationship fields as attributes
      if (data.relationships && data.relationships.length > 0) {
        data.relationships.forEach(relationship => {
          const match = relationship.relationshipFrom.match(/\{(.+?)\(/);
          if (match) {
            const relationshipField = match[1];
            newAttributes.push({
              key: relationshipField,
              type: 'Relationship',
              required: false,
              unique: false,
              validations: [],
              isChecked: false,
              relationships: [relationship.relationshipTo]
            });
          }
        });
      }

      console.log("Processed attributes:", newAttributes);

      // Set attributes regardless of category type
      setAttributes(newAttributes);
      setExternalAttributes(newAttributes);

      newAttributes.forEach(attr => {
        if (attr.relationships && attr.relationships.length > 0) {
          attr.relationships.forEach(async (relatedEntityName) => {
            await fetchRelatedAttributes(relatedEntityName, attr.key);
          });
        }
      });
    } catch (error) {
      console.error("Error fetching attributes for category:", category, error);
      setErrorMessage("Error fetching attributes");

      setAttributes([]);
      setExternalAttributes([]);

      if (error.response && error.response.status === 404) {
        setWarningMessage(`No entity definition found for "${category}". Please ensure this entity is properly defined in the backend.`);
      } else {
        setWarningMessage(`Failed to fetch attributes for "${category}". Please try again or contact support if the issue persists.`);
      }
    }
  };

  const fetchRelatedAttributes = async (relatedEntityName, fieldName) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/get-entity-by-name/${relatedEntityName}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jHipsterAuthToken}`
        }
      });

      const relatedData = response.data.fields.map(field => {
        const [key, type, ...rest] = field.split(' ');
        return {
          key,
          type,
          required: rest.includes('required'),
          unique: rest.includes('unique'),
          validations: [],
          isChecked: false
        };
      });

      setRelatedAttributes(prev => ({ ...prev, [relatedEntityName]: relatedData }));

      setSearchableRelationFields(prevFields => {
        const alreadyExists = prevFields.some(
          field => field.fieldName === fieldName && field.relatedEntityName === relatedEntityName
        );

        if (!alreadyExists && relatedData.length > 0) {
          return [
            ...prevFields,
            {
              relatedEntityName: response?.data?.entityName,
              fieldName: fieldName,
              relatedFieldName: relatedData[0]?.key
            }
          ];
        }
        return prevFields;
      });
    } catch (error) {
      console.error("Error fetching related attributes", error);
    }
  };

  // const handleCategoryChange = async () => {
  //   try {
  //     const response = await axios.get(`${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/get-entity-search-configuration/${category}`, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${jHipsterAuthToken}`
  //       }
  //     });
  //     const data = response.data;

  //     if (data && data.externalAttributesMetaData && data.externalAttributesMetaData.length > 0) {
  //       const configAttributes = data.externalAttributesMetaData.map(attr => ({
  //         key: attr.attributeName,
  //         type: attr.type || "String",
  //         required: attr.required || false,
  //         validations: attr.validations || [],
  //         isChecked: true
  //       }));

  //       console.log("Found existing configuration attributes:", configAttributes);
  //       // Don't override the main attributes here, just use this for reference
  //     }
  //   } catch (error) {
  //     console.error("Error fetching existing configuration", error);
  //     // This is expected for new categories, so we don't need to set an error
  //   }
  // };

  // Check if configuration data already exists for this category


  const checkIfDataPresent = async () => {
    if (!category) return;

    try {
      console.log("Checking if data exists for category:", category);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/get-entity-search-configuration/${category}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jHipsterAuthToken}`
          }
        }
      );

      const data = response.data;
      console.log("Existing configuration data:", data);
      setIsDataPresent(!!data);

      if (data) {
        setExistingData(data);

        // Explicitly set the search type to ensure radio buttons are updated
        if (data.entitySearchType) {
          console.log("Setting search type from data:", data.entitySearchType);
          const normalizedType = data.entitySearchType.toLowerCase() === "searchengine"
            ? "searchEngine"
            : data.entitySearchType;
          setSearchType(normalizedType);
        }

        if (data.externalEntityMetaData) {
          if (data.externalEntityMetaData.payload) {
            setPayload(typeof data.externalEntityMetaData.payload === 'string'
              ? data.externalEntityMetaData.payload
              : JSON.stringify(data.externalEntityMetaData.payload, null, 2));
          }

          if (data.externalEntityMetaData.responsePayload) {
            const responsePayloadData = data.externalEntityMetaData.responsePayload;

            // If it's a template string (contains <#), use it directly without JSON processing
            if (typeof responsePayloadData === 'string' && responsePayloadData.includes('<#')) {
              setResponsePayload(responsePayloadData);
            } else {
              // Otherwise, handle as JSON
              setResponsePayload(typeof responsePayloadData === 'string'
                ? responsePayloadData
                : JSON.stringify(responsePayloadData, null, 2));
            }
          }

          if (data.externalEntityMetaData.headers && data.externalEntityMetaData.headers.length > 0) {
            setHeaders(data.externalEntityMetaData.headers);
          }

          if (data.externalEntityMetaData.responseParser && data.externalEntityMetaData.responseParser.length > 0) {
            setResponseParsers(data.externalEntityMetaData.responseParser);
          }
        }

        const externalMetadata = data.externalEntityMetaData ? { ...data.externalEntityMetaData, attribute: 'external' } : null;
        const attributesArray = data.externalAttributesMetaData || [];
        setSelectedAttributes(externalMetadata ? [...attributesArray, externalMetadata] : attributesArray);

        setRecommendation(data.recommendation || false);

        if (data.searchableRelationFields) {
          const newRelatedAttributes = {};
          const newExpandedAttributes = {};

          data.searchableRelationFields.forEach(field => {
            if (field.relatedEntityName) {
              if (!newRelatedAttributes[field.relatedEntityName]) {
                newRelatedAttributes[field.relatedEntityName] = [];
              }
              newRelatedAttributes[field.relatedEntityName].push({
                key: field.relatedFieldName,
                selected: true
              });
              newExpandedAttributes[field.fieldName] = true;
            }
          });

          setRelatedAttributes(prev => {
            const merged = { ...prev };
            Object.keys(newRelatedAttributes).forEach(entityName => {
              if (!merged[entityName]) {
                merged[entityName] = [];
              }
              newRelatedAttributes[entityName].forEach(newAttr => {
                const existingAttr = merged[entityName].find(attr => attr.key === newAttr.key);
                if (existingAttr) {
                  existingAttr.selected = true;
                } else {
                  merged[entityName].push(newAttr);
                }
              });
            });
            return merged;
          });

          setExpandedAttributes(prev => ({ ...prev, ...newExpandedAttributes }));
        }

        if (data.searchableFields) {
          console.log("Setting searchable fields from existing data:", data.searchableFields);
          setSearchableAttributes(data.searchableFields);
        }

        if (data.searchableRelationFields) {
          setSearchableRelationFields(data.searchableRelationFields);
        }
      }
    } catch (error) {
      console.error("Check data error", error);
      setIsDataPresent(false);
    }
  };

  const handleAttributeClick = (attribute) => {
    const isExpanded = expandedAttributes[attribute.key];
    setExpandedAttributes(prev => ({ ...prev, [attribute.key]: !isExpanded }));

    if (!isExpanded && attribute.relationships && attribute.relationships.length > 0) {
      attribute.relationships.forEach(async (relatedEntityName) => {
        if (!relatedAttributes[relatedEntityName]) {
          await fetchRelatedAttributes(relatedEntityName, attribute.key);
        }
      });
    }
  };

  const handleSearchTypeChange = (type) => {
    console.log("Setting search type to:", type);
    setSearchType(type);

    if (type === 'external') {
      setSelectedAttributes(prev => {
        const externalAttribute = prev.find(attr => attr.attribute === 'external');
        if (!externalAttribute) {
          return [...prev, {
            attribute: 'external',
            externalUrl: '',
            httpMethod: '',
            headers: headers,
            payload: payload,
            responsePayload: responsePayload,
            responseParser: responseParsers
          }];
        }
        return prev;
      });
    } else {
      setSelectedAttributes(prev => prev.filter(attr => attr.attribute !== 'external'));
    }
  };

  const handleSearchableAttributesChange = (e) => {
    const { value, checked } = e.target;
    setSearchableAttributes(prevState => {
      if (checked) {
        return [...prevState, value];
      } else {
        return prevState.filter(attr => attr !== value);
      }
    });
  };

  const handleRelatedAttributeChange = (checked, relAttr, attr) => {
    if (checked) {
      setSearchableRelationFields(prevFields => {
        const alreadyExists = prevFields.some(field =>
          field.fieldName === attr.key &&
          field.relatedEntityName === attr.relationships[0] &&
          field.relatedFieldName === relAttr.key
        );

        if (!alreadyExists) {
          return [
            ...prevFields,
            {
              fieldName: attr.key,
              relatedEntityName: attr.relationships[0],
              relatedFieldName: relAttr.key
            },
          ];
        }
        return prevFields;
      });
    } else {
      setSearchableRelationFields(prevFields =>
        prevFields.filter(field =>
          !(field.relatedFieldName === relAttr.key && field.fieldName === attr.key)
        )
      );
    }
  };

  const handleExternalAttributesChange = (e) => {
    const { value, checked } = e.target;

    setSelectedAttributes(prevState => {
      if (checked) {
        const existingAttribute = prevState.find(attr => attr.attribute === value || attr?.attributeName === value);

        if (existingAttribute) {
          return prevState.map(attr =>
            attr.attribute === value || attr?.attributeName === value
              ? { ...attr, attribute: value }
              : attr
          );
        }

        return [...prevState, {
          attribute: value,
          externalUrl: '',
          httpMethod: '',
          headers: [],
          payload: '',
          responsePayload: [],
          responseParser: []
        }];
      } else {
        return prevState.filter(attr => attr.attribute !== value);
      }
    });
  };

  const handleUrlChange = (url) => {
    const hasExternalAttr = selectedAttributes.some(attr => attr.attribute === 'external');

    if (hasExternalAttr) {
      setSelectedAttributes(prev => {
        return prev.map(attr => {
          if (attr.attribute === 'external') {
            return { ...attr, externalUrl: url };
          }
          return attr;
        });
      });
    } else {
      setSelectedAttributes([...selectedAttributes, {
        attribute: 'external',
        externalUrl: url,
        httpMethod: '',
        headers: headers,
        payload: payload,
        responsePayload: responsePayload,
        responseParser: responseParsers
      }]);
    }
  };

  const handleHttpMethodChange = (method) => {
    const hasExternalAttr = selectedAttributes.some(attr => attr.attribute === 'external');

    if (hasExternalAttr) {
      setSelectedAttributes(prev => {
        return prev.map(attr => {
          if (attr.attribute === 'external') {
            return { ...attr, httpMethod: method };
          }
          return attr;
        });
      });
    } else {
      setSelectedAttributes([...selectedAttributes, {
        attribute: 'external',
        externalUrl: '',
        httpMethod: method,
        headers: headers,
        payload: payload,
        responsePayload: responsePayload,
        responseParser: responseParsers
      }]);
    }
  };

  const handleHeaderChange = (index, field, value, attribute) => {
    const updatedHeaders = [...headers];
    if (index >= updatedHeaders.length) {
      while (updatedHeaders.length <= index) {
        updatedHeaders.push({ key: '', value: '' });
      }
    }
    updatedHeaders[index] = { ...updatedHeaders[index], [field]: value };
    setHeaders(updatedHeaders);

    setSelectedAttributes(prev => {
      return prev.map(attr => {
        if (attr.attribute === attribute) {
          const attrHeaders = Array.isArray(attr.headers) ? [...attr.headers] : [];
          if (index >= attrHeaders.length) {
            while (attrHeaders.length <= index) {
              attrHeaders.push({ key: '', value: '' });
            }
          }
          attrHeaders[index] = { ...attrHeaders[index], [field]: value };
          return { ...attr, headers: attrHeaders };
        }
        return attr;
      });
    });
  };

  const handleResponseParserChange = (index, field, value, attribute) => {
    const updatedParsers = [...responseParsers];
    if (index >= updatedParsers.length) {
      while (updatedParsers.length <= index) {
        updatedParsers.push({ key: '', value: '' });
      }
    }
    updatedParsers[index] = { ...updatedParsers[index], [field]: value };
    setResponseParsers(updatedParsers);

    setSelectedAttributes(prev => {
      return prev.map(attr => {
        if (attr.attribute === attribute) {
          const attrParsers = Array.isArray(attr.responseParser) ? [...attr.responseParser] : [];
          if (index >= attrParsers.length) {
            while (attrParsers.length <= index) {
              attrParsers.push({ key: '', value: '' });
            }
          }
          attrParsers[index] = { ...attrParsers[index], [field]: value };
          return { ...attr, responseParser: attrParsers };
        }
        return attr;
      });
    });
  };

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);

    setSelectedAttributes(prev => {
      return prev.map(attr => {
        if (attr.attribute === 'external') {
          const headers = Array.isArray(attr.headers) ? [...attr.headers, { key: '', value: '' }] : [{ key: '', value: '' }];
          return { ...attr, headers };
        }
        return attr;
      });
    });
  };

  const removeHeader = (index, attribute) => {
    setHeaders(headers.filter((_, i) => i !== index));

    setSelectedAttributes(prev => {
      return prev.map(attr => {
        if (attr.attribute === attribute) {
          const headers = Array.isArray(attr.headers)
            ? attr.headers.filter((_, i) => i !== index)
            : [];
          return { ...attr, headers };
        }
        return attr;
      });
    });
  };

  const addResponseParser = () => {
    setResponseParsers([...responseParsers, { key: "", value: "" }]);

    setSelectedAttributes(prev => {
      return prev.map(attr => {
        if (attr.attribute === 'external') {
          const responseParser = Array.isArray(attr.responseParser)
            ? [...attr.responseParser, { key: '', value: '' }]
            : [{ key: '', value: '' }];
          return { ...attr, responseParser };
        }
        return attr;
      });
    });
  };

  const removeResponseParser = (index, attribute) => {
    setResponseParsers(responseParsers.filter((_, i) => i !== index));

    setSelectedAttributes(prev => {
      return prev.map(attr => {
        if (attr.attribute === attribute) {
          const responseParser = Array.isArray(attr.responseParser)
            ? attr.responseParser.filter((_, i) => i !== index)
            : [];
          return { ...attr, responseParser };
        }
        return attr;
      });
    });
  };

  const validatePayload = (value) => {
    setPayload(value);
    if (!value.trim()) {
      setPayloadError("");
      return;
    }

    if (isValidJSON(value)) {
      setPayloadError("");
      setSelectedAttributes(prev => {
        return prev.map(attr => {
          if (attr.attribute === 'external') {
            return { ...attr, payload: value };
          }
          return attr;
        });
      });
    } else {
      setPayloadError("Invalid JSON format");
    }
  };

  const validateResponsePayload = (value) => {
    setResponsePayload(value);

    if (value.includes('<#')) {
      setResponsePayloadError("");

      setSelectedAttributes(prev => {
        return prev.map(attr => {
          if (attr.attribute === 'external') {
            return { ...attr, responsePayload: value };
          }
          return attr;
        });
      });
      return;
    }

    if (!value.trim()) {
      setResponsePayloadError("");
      return;
    }

    if (isValidJSON(value)) {
      setResponsePayloadError("");
      setSelectedAttributes(prev => {
        return prev.map(attr => {
          if (attr.attribute === 'external') {
            return { ...attr, responsePayload: value };
          }
          return attr;
        });
      });
    } else {
      setResponsePayloadError("Invalid JSON format");
    }
  };

  const createPayload = () => {
    const relationFieldNames = searchableRelationFields.map(field => field.fieldName);

    const externalAttributesMetaData = selectedAttributes
      .map(attribute => {
        if (attribute.attribute === 'external') return null;
        return {
          attributeName: attribute.attribute,
          externalUrl: attribute.externalUrl || '',
          httpMethod: attribute.httpMethod || '',
          headers: attribute.headers?.filter(header => header.key && header.value) || [],
          payload: attribute.payload || {},
          responsePayload: attribute.responsePayload || {},
          responseParser: attribute.responseParser?.filter(parser => parser.key && parser.value) || {}
        };
      }).filter(attribute => attribute !== null);

    const entityData = selectedAttributes.find(e => e.attribute === 'external');

    let responsePayload = entityData?.responsePayload || "";

    // If it's a string and contains template syntax, remove all escape characters
    if (typeof responsePayload === 'string' && responsePayload.includes('<#')) {
      // Remove all backslashes before quotes
      responsePayload = responsePayload.replace(/\\"/g, '"');

      // Remove any remaining double backslashes
      responsePayload = responsePayload.replace(/\\\\/g, '\\');
    }
    // Otherwise, handle it as regular JSON
    else if (typeof responsePayload === 'string') {
      try {
        // For regular JSON, parse and re-stringify to normalize
        const parsed = JSON.parse(responsePayload);
        responsePayload = JSON.stringify(parsed);
      } catch (e) {
        // If parsing fails, keep the original string
        console.log("Could not parse response payload as JSON, using as-is");
      }
    }

    if (searchType === 'searchEngine') {
      return {
        entityName: category,
        entitySearchType: searchType,
        recommendation: recommendation,
        searchableFields: searchableAttributes.filter(attr => !relationFieldNames.includes(attr)),
        searchableRelationFields: searchableRelationFields,
        externalAttributesMetaData: externalAttributesMetaData
      };
    }

    return {
      entityName: category,
      entitySearchType: searchType,
      Searchable: searchableAttributes,
      externalEntityMetaData: {
        ...entityData,
        headers: entityData?.headers?.filter(header => header.key && header.value) || [],
        responseParser: entityData?.responseParser?.filter(parser => parser.key && parser.value) || [],
        // Use the cleaned response payload
        responsePayload: responsePayload
      },
      externalAttributesMetaData: externalAttributesMetaData
    };
  };

  const handleSubmit = async () => {
    if (searchType === 'external' && payload !== undefined && payload !== null && payload !== '' && !isValidJSON(payload)) {
      setPayloadError("Cannot submit with invalid JSON payload");
      return;
    }

    if (searchType === 'external' && responsePayload !== undefined && responsePayload !== null && responsePayload !== ''
      && !responsePayload.includes('<#') && !isValidJSON(responsePayload)) {
      setResponsePayloadError("Cannot submit with invalid JSON response payload");
      return;
    }

    if (!searchType) {
      setWarningMessage('Please select a type of search before submitting.');
      return;
    }

    setWarningMessage('');

    if (searchType === 'searchEngine') {
      const hasSelectedRelatedAttribute = searchableRelationFields.length > 0;
      if (!hasSelectedRelatedAttribute) {
        // Check if there are any related attributes available
        const hasRelatedAttributes = attributes.some(attr =>
          attr.relationships && attr.relationships.length > 0
        );

        if (hasRelatedAttributes) {
          setWarningMessage('Please select at least one related attribute before submitting.');
          return;
        }
      }
    }

    const submissionPayload = createPayload();
    console.log("Payload being sent:", submissionPayload);

    try {
      if (isDataPresent) {
        // If data exists, update it
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/update-entity-search-configuration`,
          submissionPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jHipsterAuthToken}`
            }
          }
        );
        if (showModal) {
          showModal('success', 'Update successful!');
        } else {
          setNotificationMessage('Update successful!');
        }
      } else {
        // If no data, create a new entry
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/create-entity-search-configuration`,
          submissionPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jHipsterAuthToken}`
            }
          }
        );
        setNotificationMessage('Submission successful!');
      }
    } catch (error) {
      console.error("Submit/Update error", error);
      setWarningMessage('An error occurred while submitting/updating. Please try again.');
    }
  };

  // Handle deletion
  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/delete-entity-search-configuration/${category}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jHipsterAuthToken}`
          }
        }
      );

      console.log("Delete successful", response);
      setNotificationMessage('Deletion successful!');
      // Reset form after deletion
      setCategory("");
      setSearchType("");
      setSelectedAttributes([]);
      setSearchableAttributes([]);
      setSearchableRelationFields([]);
    } catch (error) {
      console.error("Delete error", error);
      setWarningMessage('An error occurred while deleting. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in-down">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-900">Supplier Integration</h1>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-700">
          <h2 className="font-medium text-white">API Configuration</h2>
        </div>

        <div className="p-6 space-y-8">
          {/* Category Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Database className="h-4 w-4 mr-2 text-indigo-500" />
              Select Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {/* <option value="">Select a category</option> */}
              {categoryNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Search Type Selection */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Server className="h-4 w-4 mr-2 text-indigo-500" />
              Type of Search
            </label>
            <div className="flex space-x-8 mt-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="external"
                  name="searchType"
                  value="external"
                  checked={searchType === "external"}
                  onChange={() => {
                    console.log("Setting to external");
                    setSearchType("external");
                  }}
                  className="h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label
                  htmlFor="external"
                  className="text-sm text-gray-700 cursor-pointer"
                  onClick={() => setSearchType("external")}
                >
                  Third-party supplier
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="searchEngine"
                  name="searchType"
                  value="searchEngine"
                  checked={searchType === "searchEngine"}
                  onChange={() => {
                    console.log("Setting to searchEngine");
                    setSearchType("searchEngine");
                  }}
                  className="h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label
                  htmlFor="searchEngine"
                  className="text-sm text-gray-700 cursor-pointer"
                  onClick={() => setSearchType("searchEngine")}
                >
                  Internal inventory
                </label>
              </div>
            </div>
          </div>

          {/* Recommendation Option (only for searchEngine) */}
          {searchType === "searchEngine" && (
            <div className="flex items-center space-x-3 p-4 bg-white rounded-md border border-gray-200">
              <input
                type="checkbox"
                id="recommendation"
                checked={recommendation}
                onChange={(e) => setRecommendation(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="recommendation" className="text-sm text-gray-700">Enable Recommendations</label>
            </div>
          )}

          {/* External API Configuration (only for external) */}
          {searchType === "external" && (
            <div className="space-y-6 p-6 border rounded-lg shadow-sm bg-white">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                <Code className="h-4 w-4 mr-2 text-indigo-500" />
                API Configuration
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700">URL</label>
                    <input
                      id="url"
                      type="text"
                      placeholder="Enter API URL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => handleUrlChange(e.target.value)}
                      defaultValue={selectedAttributes.find(attr => attr.attribute === 'external')?.externalUrl || ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="method" className="block text-sm font-medium text-gray-700">HTTP Method</label>
                    <select
                      id="method"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => handleHttpMethodChange(e.target.value)}
                      defaultValue={selectedAttributes.find(attr => attr.attribute === 'external')?.httpMethod || ''}
                    >
                      <option value="">Select HTTP Method</option>
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Headers</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addHeader}
                      className="h-8 px-3 text-xs"
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Add Header
                    </Button>
                  </div>

                  {(selectedAttributes.find(attr => attr.attribute === 'external')?.headers || headers).map((header, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-md bg-gray-50 border border-gray-200">
                      <input
                        type="text"
                        placeholder="Header Key"
                        value={header.key}
                        onChange={(e) => {
                          handleHeaderChange(index, 'key', e.target.value, 'external');
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Header Value"
                        value={header.value}
                        onChange={(e) => {
                          handleHeaderChange(index, 'value', e.target.value, 'external');
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => removeHeader(index, 'external')}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="payload" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FileJson className="h-4 w-4 mr-2 text-indigo-500" />
                      Payload
                    </label>
                    {payload && (
                      isValidJSON(payload)
                        ? <CheckCircle className="h-4 w-4 text-green-500" />
                        : <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <textarea
                    id="payload"
                    placeholder="Enter payload details in JSON format"
                    className={`w-full min-h-[120px] px-3 py-2 border rounded-md font-mono text-sm ${payloadError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                    value={payload}
                    onChange={(e) => validatePayload(e.target.value)}
                    defaultValue={selectedAttributes.find(attr => attr.attribute === 'external')?.payload || ''}
                  />
                  {payloadError && (
                    <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-md flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{payloadError}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Response Parser</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addResponseParser}
                      className="h-8 px-3 text-xs"
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Add Parser
                    </Button>
                  </div>

                  {(selectedAttributes.find(attr => attr.attribute === 'external')?.responseParser || responseParsers).map((parser, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-md bg-gray-50 border border-gray-200">
                      <input
                        type="text"
                        placeholder="Parser Key"
                        value={parser.key}
                        onChange={(e) => {
                          handleResponseParserChange(index, 'key', e.target.value, 'external');
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Parser Value"
                        value={parser.value}
                        onChange={(e) => {
                          handleResponseParserChange(index, 'value', e.target.value, 'external');
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => removeResponseParser(index, 'external')}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label htmlFor="responsePayload" className="block text-sm font-medium text-gray-700 flex items-center">
                    <FileJson className="h-4 w-4 mr-2 text-indigo-500" />
                    Response Payload
                  </label>
                  <textarea
                    id="responsePayload"
                    placeholder="Enter response payload details"
                    className={`w-full min-h-[120px] px-3 py-2 border rounded-md font-mono text-sm ${responsePayloadError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                    value={responsePayload}
                    onChange={(e) => validateResponsePayload(e.target.value)}
                    defaultValue={selectedAttributes.find(attr => attr.attribute === 'external')?.responsePayload || ''}
                  />
                  {responsePayloadError && (
                    <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-md flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{responsePayloadError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Searchable Attributes Section (only for searchEngine) */}
          {searchType === "searchEngine" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Database className="h-4 w-4 mr-2 text-indigo-500" />
                Select Searchable Attributes
              </label>
              <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto shadow-sm bg-white">
                {attributes.length > 0 ? (
                  <div className="space-y-2">
                    {attributes.map(attr => (
                      <div key={`${category}-${attr.key}`}>
                        <label onClick={() => handleAttributeClick(attr)} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                          <input
                            type="checkbox"
                            name="searchable-attributes"
                            value={attr.key}
                            checked={searchableAttributes.includes(attr.key) || searchableRelationFields.some(field => field.fieldName === attr.key)}
                            onChange={handleSearchableAttributesChange}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{attr.key.charAt(0).toUpperCase() + attr.key.slice(1)}</span>
                        </label>
                        {expandedAttributes[attr.key] && attr.relationships && attr.relationships.length > 0 && relatedAttributes[attr.relationships[0]] && (
                          <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
                            {relatedAttributes[attr.relationships[0]].map((relAttr) => (
                              <label key={`${category}-${attr.key}-${relAttr.key}`} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                                <input
                                  type="checkbox"
                                  name="related-attributes"
                                  value={relAttr.key}
                                  checked={relAttr.selected || searchableRelationFields.some(field =>
                                    field.fieldName === attr.key &&
                                    field.relatedEntityName === attr.relationships[0] &&
                                    field.relatedFieldName === relAttr.key
                                  )}
                                  onChange={(e) => {
                                    const { checked } = e.target;
                                    handleRelatedAttributeChange(checked, relAttr, attr);
                                  }}
                                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">{relAttr.key.charAt(0).toUpperCase() + relAttr.key.slice(1)}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {category ?
                      `No searchable attributes found for ${category}. Please check if the entity definition is correct.` :
                      "Please select a category to view searchable attributes."}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* External Attributes Section */}
          {/* <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Settings className="h-4 w-4 mr-2 text-indigo-500" />
              External Configuration
            </label>
            <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto shadow-sm bg-white">
              {externalAttributes.length > 0 ? (
                <div className="space-y-2">
                  {externalAttributes.map((attr) => (
                    <div key={`${category}-ext-${attr.key}`} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                      <input
                        type="checkbox"
                        id={`attr-${attr.key}`}
                        value={attr.key}
                        checked={selectedAttributes.some(a => a.attribute === attr.key || a?.attributeName === attr.key)}
                        onChange={handleExternalAttributesChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <label htmlFor={`attr-${attr.key}`} className="text-sm text-gray-700">{attr.key.charAt(0).toUpperCase() + attr.key.slice(1)}</label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {category ?
                    `No external attributes found for ${category}. Please check if the entity definition is correct.` :
                    "Please select a category to view external attributes."}
                </div>
              )}
            </div>
          </div> */}

          {/* Display warnings and notifications */}
          {warningMessage && (
            <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">{warningMessage}</span>
            </div>
          )}

          {notificationMessage && (
            <div className="p-4 bg-green-50 text-green-800 border border-green-200 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">{notificationMessage}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 border-t p-6 bg-gray-50">
          <Button
            variant="outline"
            type="button"
            className="gap-2"
            onClick={() => {
              setCategory("");
              setSearchType("");
              setSelectedAttributes([]);
              setSearchableAttributes([]);
              setSearchableRelationFields([]);
              setPayload("");
              setResponsePayload("");
              setHeaders([{ key: "", value: "" }]);
              setResponseParsers([{ key: "", value: "" }]);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            variant="destructive"
            type="button"
            className="gap-2"
            onClick={handleDelete}
            disabled={!category}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            disabled={!category || !searchType || (searchType === 'external' && payload && !!payloadError)}
          >
            <Save className="h-4 w-4 text-white" />
            <p className='text-white'>{isDataPresent ? 'Update' : 'Save'}</p>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExternalConfiguration;