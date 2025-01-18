"use client";
import React, { useState, useEffect } from 'react';
import './page.css'; // Import the CSS file
import axios from 'axios';
import { Button, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthJHipster } from "@/context/JHipsterContext"; // Import the context
import { useTranslations } from 'next-intl';

const AddProductCategoryPage = () => {
  const { jHipsterAuthToken } = useAuthJHipster(); // Get the token from context
  const [category, setCategory] = useState('');
  const [categoryNames, setCategoryNames] = useState([]);
  const [searchType, setSearchType] = useState('');
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [apiDetails, setApiDetails] = useState({
    attribute: '',
    externalUrl: '',
    httpMethod: '',
    headers: [],
    payload: '',
    responsePayload: [],
    responseParser: []
  });
  const [isDataPresent, setIsDataPresent] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [searchableAttributes, setSearchableAttributes] = useState([]);
  const [externalAttributes, setExternalAttributes] = useState([]);
  const [expandedAttributes, setExpandedAttributes] = useState({});
  const [relatedAttributes, setRelatedAttributes] = useState({});
  const [searchableRelationFields, setSearchableRelationFields] = useState([])
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages
  const [warningMessage, setWarningMessage] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  // Function to clear error messages
  const clearError = () => setErrorMessage('');
  const [recommendation, setRecommendation] = useState(false);
  console.log("result", searchableRelationFields)
  const handleHeaderChange = (index, field, value, attribute) => {
    const updatedHeaders = apiDetails.headers.map((header, idx) => {
      if (idx === index) {
        return { ...header, [field]: value };
      }
      return header;
    });
    const findD = selectedAttributes.find(e => e.attribute === attribute).headers.map((header, idx) => {
      if (idx === index) {
        return { ...header, [field]: value };
      }
      return header;
    });

    setSelectedAttributes(prev => {
      return prev.map(attr =>
        attr.attribute === attribute ? { ...attr, headers: findD } : attr
      );
    });
    setApiDetails((prev) => ({ ...prev, headers: updatedHeaders }));
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

  const handleResponseParserChange = (index, field, value, attribute) => {
    const updatedResponseParser = apiDetails.responseParser.map((responseParser, idx) => {
      if (idx === index) {
        return { ...responseParser, [field]: value };
      }
      return responseParser;
    });

    const findD = selectedAttributes.map(attr => {
      if (attr.attribute === attribute) {
        return {
          ...attr,
          responseParser: attr.responseParser.map((responseParser, idx) => {
            if (idx === index) {
              return { ...responseParser, [field]: value };
            }
            return responseParser;
          })
        };
      }
      return attr;
    });

    setSelectedAttributes(findD);
    setApiDetails((prev) => ({ ...prev, responseParser: updatedResponseParser }));
  };

  const removeHeader = (index, attribute) => {
    setSelectedAttributes(prev => {
      return prev.map(attr => {
        if (attr.attribute === attribute) {
          return { ...attr, headers: attr.headers.filter((_, idx) => idx !== index) };
        }
        return attr;
      });
    });
    setApiDetails((prev) => ({
      ...prev,
      headers: prev.headers.filter((_, idx) => idx !== index),
    }));
  };
  const removeResponseParser = (index, attribute) => {
    setSelectedAttributes(prev => {
      return prev.map(attr => {
        if (attr.attribute === attribute) {
          return { ...attr, responseParser: attr.responseParser.filter((_, idx) => idx !== index) };
        }
        return attr;
      });
    });
    setApiDetails((prev) => ({
      ...prev,
      responseParser: prev.responseParser.filter((_, idx) => idx !== index),
    }));
  };

  useEffect(() => {
    checkIfDataPresent();
    handleCategoryChange();
  }, [category]);


  useEffect(() => {
    const fetchCategoryNames = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/get-entity-names-list`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jHipsterAuthToken}` // Use the token from context
          }
        });
        setCategoryNames(response.data);
      } catch (error) {
        setErrorMessage("Error fetching category names");
        console.error("Error fetching category names", error);
      }
    };

    if (jHipsterAuthToken) {
      fetchCategoryNames();
    }
  }, [jHipsterAuthToken]);

  useEffect(() => {
    if (category) {
      const fetchAttributes = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/get-entity-by-name/${category}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jHipsterAuthToken}`
            }
          });

          const data = response.data;
          const newAttributes = data.fields.map(field => {
            const [key, type, ...rest] = field.split(' ');
            return {
              key,
              type,
              required: rest.includes('required'),
              unique: rest.includes('unique'),
              validations: [],
              isChecked: false,
              relationships: [] // Store relationships for later use
            };
          });

          // Add relationship fields as attributes
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

          setAttributes(newAttributes);
          setExternalAttributes(newAttributes);

          // Fetch related attributes for all attributes
          newAttributes.forEach(attr => {
            if (attr.relationships.length > 0) {
              attr.relationships.forEach(async (relatedEntityName) => {
                await fetchRelatedAttributes(relatedEntityName, attr.key);
              });
            }
          });
        } catch (error) {
          setErrorMessage("Error fetching attributes");

          console.error("Error fetching attributes", error);
        }
      };

      if (jHipsterAuthToken) {
        fetchAttributes();
      }
    }
  }, [category, jHipsterAuthToken]);

  const handleAttributeClick = (attribute) => {
    // Check if the attribute is currently expanded
    const isExpanded = expandedAttributes[attribute.key];
    console.log(attribute, " kk");
    // Toggle the expanded state for the main attribute
    setExpandedAttributes(prev => ({ ...prev, [attribute.key]: !isExpanded }));

    // If the attribute is being expanded, fetch related attributes if necessary
    if (!isExpanded && attribute.relationships.length > 0) {
      // Fetch related attributes if expanding
      attribute.relationships.forEach(async (relatedEntityName) => {
        if (!relatedAttributes[relatedEntityName]) {
          await fetchRelatedAttributes(relatedEntityName, attribute.key);
        }
      });
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
      console.log("result1", relatedEntityName)
      console.log("result3", relatedData)

      setRelatedAttributes(prev => ({ ...prev, [relatedEntityName]: relatedData }));
      console.log("result2", relatedAttributes)
      // Only add new searchableRelationFields if it does not already exist
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
              relatedFieldName: relatedData[0]?.key // Ensure valid relatedFieldName
            }
          ];
        }
        return prevFields;
      });

      console.log(searchableAttributes, relatedData, " entity name 8 pm");
    } catch (error) {
      console.error("Error fetching related attributes", error);
    }
  };
  const handleCategoryChange = async (e) => {
    // const { value } = e.target;
    // setCategory(value);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/get-entity-search-configuration/${value}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jHipsterAuthToken}` // Use the token from context
        }
      });
      const data = response.data;

      const newAttributes = data.externalAttributesMetaData.map(attr => ({
        key: attr.attributeName,
        type: attr.type,
        required: attr.required,
        validations: attr.validations,
        isChecked: data.externalAttributesMetaData.some(dataAttr => dataAttr.attributeName === attr.attributeName)
      }));

      setAttributes(newAttributes);
      setExternalAttributes(newAttributes);
    } catch (error) {
      console.error("Error fetching attributes", error);
      setAttributes([]);
      setExternalAttributes([]);
    }
  };

  const handleSearchTypeChange = (e) => {
    const { value } = e.target;
    setSearchType(value);
    if (value === 'external') {
      setSelectedAttributes(prev => {
        const externalAttribute = prev.find(attr => attr.attribute === 'external');
        if (!externalAttribute) {
          return [...prev, { ...apiDetails, attribute: 'external' }];
        }
        return prev;
      });
    } else {
      setSelectedAttributes(prev => prev.filter(attr => attr.attribute !== 'external'));
    }
  };


  const handleRelatedAttributeChange = (checked, relAttr, attr) => {
    if (checked) {
      // Only add if it does not already exist
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
        return prevFields; // No change if it already exists
      });
    } else {
      // Remove the unchecked related attribute from searchableRelationFields
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

  const resetApiDetails = () => {
    setApiDetails({
      externalUrl: '',
      httpMethod: '',
      headers: [],
      payload: '',
      responsePayload: [],
      responseParser: []
    });
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
          headers: attribute.headers.filter(header => header.key && header.value) || [],
          payload: attribute.payload || {},
          responsePayload: attribute.responsePayload && Object.keys(attribute.responsePayload).length > 0 ? attribute.responsePayload : {},
          responseParser: attribute.responseParser.filter(parser => parser.key && parser.value) || {}
        };
      }).filter(attribute => attribute !== null);

    const entityData = selectedAttributes.find(e => e.attribute === searchType);
    // Ensure responsePayload is correctly set
    let responsePayload = entityData?.responsePayload ? entityData.responsePayload : {};

    // remove the backslashes from the responsePayload
    responsePayload = responsePayload.replace(/\\+"/g, '"').replace(/([^\\])\\([^\\])/g, '$1$2');
    console.log('show me the responsePayload', responsePayload)

    // const responsePayload = entityData?.responsePayload ? btoa(entityData?.responsePayload || '') : {};

    // Check if the searchType is 'searchengine'
    if (searchType === 'searchEngine') {
      return {
        entityName: category,
        entitySearchType: searchType,
        recommendation: recommendation,
        searchableFields: searchableAttributes.filter(attr => !relationFieldNames.includes(attr)), // Filter out relation field names
        searchableRelationFields: searchableRelationFields, // Keep this as is
        externalAttributesMetaData: externalAttributesMetaData // No external attributes for search engine
      };
    }

    // If it's not 'searchengine', return the payload for external search
    let finalObj = {
      entityName: category,
      entitySearchType: searchType,
      Searchable: searchableAttributes,
      externalEntityMetaData: {
        ...entityData,
        headers: entityData.headers.filter(header => header.key && header.value),
        responseParser: entityData.responseParser.filter(parser => parser.key && parser.value),
        responsePayload: responsePayload
      },
      externalAttributesMetaData: externalAttributesMetaData
    }

    return finalObj;

  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/delete-entity-search-configuration/${category}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jHipsterAuthToken}` // Use the token from context
          }
        }
      );
      console.log('Delete successful', response);
      setNotificationMessage('Deletion successful!');
    } catch (error) {
      console.error("Delete error", error);
    }
  };
  const handleSubmitOrUpdate = async () => {
    // Check if searchType is selected
    if (!searchType) {
      setWarningMessage('Please select a type of search before submitting.');
      return; // Prevent further execution
    }

    // Clear any existing warning message
    setWarningMessage('');

    // Check for related attributes only if searchType is 'searchEngine'
    if (searchType === 'searchEngine') {
      const hasSelectedRelatedAttribute = searchableRelationFields.length > 0;
      if (!hasSelectedRelatedAttribute) {
        // Check if there are any related attributes available
        const hasRelatedAttributes = selectedAttributes.some(attr =>
          attr.relationships && attr.relationships.length > 0
        );

        if (hasRelatedAttributes) {
          setWarningMessage('Please select at least one related attribute before submitting.');
          return;
        }
      }
    }

    const payload = createPayload();
    console.log("Payload being sent:", payload);
    // if (payload && payload.externalEntityMetaData && payload.externalEntityMetaData.responsePayload) {
    //   payload.externalEntityMetaData.responsePayload = JSON.stringify(payload.externalEntityMetaData.responsePayload);
    // }
    try {
      console.log('show me the payload', payload)
      if (isDataPresent) {
        // If data exists, update it
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/update-entity-search-configuration`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jHipsterAuthToken}`
            }
          }
        );
        setNotificationMessage('Update successful!');
        // console.log('Update successful', response);
      } else {
        // If no data, create a new entry
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/create-entity-search-configuration`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jHipsterAuthToken}`
            }
          }
        );
        setNotificationMessage('Submission successful!');
        console.log('Submit successful', response);
      }
    } catch (error) {
      console.error("Submit/Update error", error);
      setWarningMessage('An error occurred while submitting/updating. Please try again.');
    }
  };
  const checkIfDataPresent = async () => {
    if (!category) return;
    try {
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
      setIsDataPresent(!!data);
      if (data) {
        setExistingData(data);
        setSearchType(data.entitySearchType);
        setSelectedAttributes([...data.externalAttributesMetaData, { ...data.externalEntityMetaData, attribute: 'external' }]);
        setRecommendation(data.recommendation || false);
        // Handle related attributes
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
                selected: true // Mark as selected
              });
              newExpandedAttributes[field.fieldName] = true; // Expand the main attribute
            }
          });

          // Merge with existing related attributes
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

          // Update expanded attributes
          setExpandedAttributes(prev => ({ ...prev, ...newExpandedAttributes }));
        }

        // Set searchable attributes
        if (data.searchableFields) {
          setSearchableAttributes(data.searchableFields);
        }

        // Set searchable relation fields
        if (data.searchableRelationFields) {
          setSearchableRelationFields(data.searchableRelationFields);
        }
      }
    } catch (error) {
      console.error("Check data error", error);
      setIsDataPresent(false);
    }
  };

  const addHeader = () => {
    // setSelectedAttributes(p => p.map(e => ({ ...e, headers: [...e.headers, { key: '', value: '' }] })));
    setSelectedAttributes(p => p.map(e => ({
      ...e,
      headers: Array.isArray(e.headers) ? [...e.headers, { key: '', value: '' }] : [{ key: '', value: '' }]
    })));

    setApiDetails((prev) => ({
      ...prev,
      headers: [...prev.headers, { key: '', value: '' }],
    }));
  };

  const addResponseParser = () => {
    // setSelectedAttributes(p => p.map(e => ({ ...e, responseParser: [...e.responseParser, { key: '', value: '' }] })));
    setSelectedAttributes(p => p.map(e => ({
      ...e,
      responseParser: Array.isArray(e.responseParser) ? [...e.responseParser, { key: '', value: '' }] : [{ key: '', value: '' }]
    })));


    setApiDetails((prev) => ({
      ...prev,
      responseParser: [...prev.responseParser, { key: '', value: '' }],
    }));
  };


  return (
    <main>
      <section className="search-config">
        <label id="category-label" htmlFor="category">Select Category:</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select a category</option>
          {categoryNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <fieldset>
          <legend>Type of Search:</legend>
          <div className="radio-group">
            <label><input type="radio" name="searchType" value="external" checked={searchType === 'external'} onChange={handleSearchTypeChange} /> External</label>
            <label><input type="radio" name="searchType" value="searchEngine" checked={searchType === 'searchEngine'} onChange={handleSearchTypeChange} /> Search Engine</label>
          </div>
        </fieldset>

        {searchType === 'searchEngine' && (
          <div className="recommendation-checkbox">
            <label>
              <input
                type="checkbox"
                checked={recommendation}
                onChange={(e) => setRecommendation(e.target.checked)}
              />
              Enable Recommendations
            </label>
          </div>
        )}

        <div id="searchType-accordion-container">
          {searchType === 'external' && selectedAttributes.find(e => (e.attribute === 'external')) && (
            <Accordion attribute={searchType} existingData={existingData} setApiDetails={setSelectedAttributes} handleHeaderChange={handleHeaderChange} handleResponseParserChange={handleResponseParserChange} removeHeader={removeHeader} removeResponseParser={removeResponseParser} apiDetails={selectedAttributes.find(e => e.attribute === 'external')} addHeader={addHeader} addResponseParser={addResponseParser} />
          )}
        </div>
        {searchType == 'searchEngine' && (
          <fieldset>
            <legend>Select Searchable Attributes:</legend>
            <div id="attributes-container" style={{ height: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
              {attributes.map(attr => (
                <div key={attr.key}>
                  <label onClick={() => handleAttributeClick(attr)}>
                    <input
                      type="checkbox"
                      name="Searchable-attributes"
                      value={attr.key}
                      checked={searchableAttributes.includes(attr.key) || searchableRelationFields.some(field => field.fieldName === attr.key)}
                      onChange={handleSearchableAttributesChange}
                      style={{ marginRight: '10px' }}
                    />
                    {attr.key.charAt(0).toUpperCase() + attr.key.slice(1)}
                  </label>
                  {expandedAttributes[attr.key] && attr.relationships.length > 0 && relatedAttributes[attr.relationships[0]] && (
                    <div style={{ paddingLeft: '20px' }}>
                      {relatedAttributes[attr.relationships[0]].map((relAttr) => (
                        <div key={relAttr.key}>
                          <label>
                            <input
                              type="checkbox"
                              name="Related-attributes"
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
                              style={{ marginRight: '10px' }}
                            />
                            {relAttr.key.charAt(0).toUpperCase() + relAttr.key.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </fieldset>
        )}
        <fieldset>
          <legend>External Configuration:</legend>
          <label>Select Specific Attributes:</label>
          <div id="external-attributes-container" style={{ height: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
            {externalAttributes.map(attr => (
              <label key={attr.key}>
                <input
                  type="checkbox"
                  name="external-attributes"
                  value={attr.key}
                  checked={selectedAttributes.find(e => e.attribute === attr.key || e?.attributeName === attr.key)}
                  onChange={handleExternalAttributesChange}
                  style={{ marginRight: '10px' }}
                /> {attr.key.charAt(0).toUpperCase() + attr.key.slice(1)} {/* Capitalize first character */}

              </label>
            ))}
          </div>
        </fieldset>
        {selectedAttributes.map(attr => {
          if (attr.attribute === 'external' || attr?.attributeName === 'external') return;
          return <Accordion key={attr.attribute} attribute={attr.attribute} existingData={attr} setApiDetails={setSelectedAttributes} handleHeaderChange={handleHeaderChange} handleResponseParserChange={handleResponseParserChange} removeHeader={removeHeader} removeResponseParser={removeResponseParser} apiDetails={attr} addHeader={addHeader} addResponseParser={addResponseParser} />
        })}
        {warningMessage && <p className="warning-message">{warningMessage}</p>}
        {notificationMessage && <p className="notification-message">{notificationMessage}</p>}

        <button type="button" id="submit-button" onClick={handleSubmitOrUpdate}>
          {isDataPresent ? 'Update' : 'Submit'}
        </button>
        <button type="button" id="delete-button" onClick={handleDelete}>Delete</button>
      </section>
    </main>
  );
};

function formatResponsePayload(inputValue) {
  // Initially assume the input is a straightforward JSON string
  let formattedValue = inputValue;

  // Check and handle template parts
  const templateRegex = /<#[^>]+>/g; // Adjust regex to accurately capture your template syntax
  let match;
  let lastIndex = 0;
  let result = '';

  while ((match = templateRegex.exec(inputValue)) !== null) {
    // Add the part before the template, handling JSON escaping
    const jsonPart = inputValue.substring(lastIndex, match.index);
    result += jsonPart.replace(/\\(["\\])/g, '$1'); // Unescape JSON-specific characters

    // Add the template part unchanged
    result += match[0];
    lastIndex = templateRegex.lastIndex;
  }

  // Handle the last part of the string after the final template, if any
  if (lastIndex < inputValue.length) {
    const jsonPart = inputValue.substring(lastIndex);
    result += jsonPart.replace(/\\(["\\])/g, '$1');
  }

  return result;
}

const Accordion = ({ attribute, existingData, setApiDetails, handleHeaderChange, removeHeader, apiDetails, addHeader, addResponseParser, handleResponseParserChange, removeResponseParser }) => {
  const [error, setError] = useState('');

  const toggleAccordion = (e) => {
    e.target.classList.toggle('active');
    const panel = e.target.nextElementSibling;
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  };

  const handleJsonChange = (e, key, attribute) => {
    // try {
    //   console.log('e.target.value', e.target.value);
    //   const parsedJson = JSON.parse(e.target.value);
    //   setApiDetails(prev =>
    //     prev.map(item =>
    //       item.attribute === attribute
    //         ? { ...item, [key]: [parsedJson] }
    //         : item
    //     )
    //   )
    //   setError('');
    // } catch (error) {
    //   setError('Invalid JSON format');
    // }


    const inputValue = e.target.value;
    const cleanInputValue = formatResponsePayload(inputValue);

    console.log('Input value:', inputValue);

    // Directly update the state with the input string
    setApiDetails(prev => prev.map(item =>
      item.attribute === attribute ? { ...item, [key]: cleanInputValue } : item
    ));
  };

  existingData = apiDetails;
  return (
    <>
      <button className="accordion" onClick={toggleAccordion}>
        {attribute === 'external' ? 'API Configuration' : existingData?.attributeName || attribute}
      </button>
      <div className="panel" style={{ display: 'none' }}>
        <label htmlFor={`${attribute}-url`}>URL:</label>
        <input type="text" id={`${attribute}-url`} placeholder="Enter API URL" defaultValue={existingData.externalUrl || ''} onChange={(e) => setApiDetails(prev =>
          prev.map(item =>
            item.attribute === attribute
              ? { ...item, externalUrl: e.target.value }
              : item
          )
        )} /><br />
        <label htmlFor={`${attribute}-httpMethod`}>HTTP Method:</label>
        <select id={`${attribute}-httpMethod`} defaultValue={existingData.httpMethod || ''} onChange={(e) => setApiDetails(prev =>
          prev.map(item =>
            item.attribute === attribute
              ? { ...item, httpMethod: e.target.value }
              : item
          )
        )}>
          <option value="">Select HTTP Method</option>
          <option value="POST">POST</option>
          <option value="GET">GET</option>
          <option value="PUT">PUT</option>
        </select><br />
        <label htmlFor={`${attribute}-headers`}>Headers:</label>
        {apiDetails?.headers?.map((header, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px',
              marginTop: '14px',
            }}
          >
            <TextField
              variant="standard"
              label="Header Key"
              value={header.key}
              onChange={(e) => handleHeaderChange(index, 'key', e.target.value, attribute)}
              style={{ marginRight: '10px' }}
            />



            <TextField
              variant="standard"
              label="Header Value"
              value={header.value}
              onChange={(e) => handleHeaderChange(index, 'value', e.target.value, attribute)}
            />
            <div className='ml-6'>
              <IconButton onClick={() => removeHeader(index, attribute)}>
                <DeleteIcon />
              </IconButton>
            </div>
          </div>
        ))}
        <Button onClick={() => addHeader(attribute)} variant="outlined">
          Add Header
        </Button>
        <label htmlFor={`${attribute}-payload`}>Payload:</label>
        <textarea id={`${attribute}-payload`} placeholder="Enter payload details in JSON format" defaultValue={existingData.payload ? JSON.stringify(existingData.payload) : ''} onChange={(e) => handleJsonChange(e, 'payload', attribute)}></textarea><br />
        <label htmlFor={`${attribute}-responseParser`}>Response Parser</label>
        {apiDetails?.responseParser?.map((header, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px',
              marginTop: '14px',
            }}
          >
            <TextField
              variant="standard"
              label="Response Parser Key"
              value={header.key}
              onChange={(e) => handleResponseParserChange(index, 'key', e.target.value, attribute)}
              style={{ marginRight: '10px' }}
            />
            <TextField
              variant="standard"
              label="Response Parser Value"
              value={header.value}
              onChange={(e) => handleResponseParserChange(index, 'value', e.target.value, attribute)}
            />
            <div className='ml-6'>
              <IconButton onClick={() => removeResponseParser(index, attribute)}>
                <DeleteIcon />
              </IconButton>
            </div>
          </div>
        ))}
        <Button onClick={() => addResponseParser(attribute)} variant="outlined">
          Add Response Parser
        </Button>

        <label htmlFor={`${attribute}-response-payload`}>Response Payload:</label>
        {console.log(" existingData responsePayload", existingData.responsePayload)}
        {console.log("the attribute is", attribute)}
        <textarea id={`${attribute}-response-payload`}
          placeholder="Enter response payload details"
          defaultValue={existingData.responsePayload ? JSON.stringify(existingData.responsePayload[0]) : ''}
          // defaultValue={existingData.responsePayload || ''}
          onChange={(e) => handleJsonChange(e, 'responsePayload', attribute)}>
        </textarea>
        <br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </>
  );
};

export default AddProductCategoryPage;