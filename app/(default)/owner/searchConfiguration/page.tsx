"use client";
import React, { useState, useEffect } from 'react';
import './page.css'; // Import the CSS file
import axios from 'axios';
import fieldTemplates from './fieldtemplates';
import { Button, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const AddProductCategoryPage = () => {
  const [category, setCategory] = useState('');
  const [searchType, setSearchType] = useState('');
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [apiDetails, setApiDetails] = useState({
    externalUrl: '',
    httpMethod: '',
    headers: [],
    payload: '',
    responseParser: []
  });
  const [isDataPresent, setIsDataPresent] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [externalAttributes, setExternalAttributes] = useState([]);

  const handleHeaderChange = (index, field, value) => {
    const updatedHeaders = apiDetails.headers.map((header, idx) => {
      if (idx === index) {
        return { ...header, [field]: value };
      }
      return header;
    });
    setApiDetails((prev) => ({ ...prev, headers: updatedHeaders }));
  };

  const removeHeader = (index) => {
    setApiDetails((prev) => ({
      ...prev,
      headers: prev.headers.filter((_, idx) => idx !== index),
    }));
  };

  useEffect(() => {
    checkIfDataPresent();
    handleCategoryChange();
  }, [category]);

  const handleCategoryChange = (rizz) => {
    const template = fieldTemplates[category];
    if (template) {
      const newAttributes = template.map(attr => ({
        ...attr,
        isChecked: rizz?.externalAttributesMetaData?.some(data => data.attributeName === attr.key)
      }));
      setAttributes(newAttributes);
      setExternalAttributes(newAttributes);
    } else {
      setAttributes([]);
      setExternalAttributes([]);
    }
  };

  const handleSearchTypeChange = (e) => {
    const { value } = e.target;
    setSearchType(value);

    if (value !== 'external') {
      resetApiDetails();
    } else {
      setSelectedAttributes([]);
    }
  };

  const handleExternalAttributesChange = (e) => {
    const { value, checked } = e.target;
    setSelectedAttributes(prevState => checked ? [...prevState, value] : prevState.filter(attr => attr !== value));
  };

  const resetApiDetails = () => {
    setApiDetails({
      externalUrl: '',
      httpMethod: '',
      headers: [],
      payload: '',
      responseParser: []
    });
  };

  const createPayload = () => {
    const externalAttributesMetaData = selectedAttributes.map(attribute => ({
      attributeName: attribute,
      externalUrl: apiDetails.externalUrl || '',
      httpMethod: apiDetails.httpMethod || '',
      headers: [apiDetails.headers.length ? apiDetails.headers[0] : []],
      payload: apiDetails.payload || {},
      responseParser: [apiDetails.responseParser.length ? apiDetails.responseParser[0] : []]
    }));

    return {
      entityName: category,
      entitySearchType: searchType,
      externalEntityMetaData: apiDetails,
      externalAttributesMetaData: externalAttributesMetaData
    };
  };

  const handleSubmit = async () => {
    const payload = createPayload();
    try {
      const response = await axios.post(
        'http://localhost:8080/api/jdl/create-entity-search-configuration',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcyODA1MTU1MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzI3OTY1MTUwfQ.8racOUe6UJlJLfnnYo4GEtBW-vl4LSOm4HI3uHkhYjXV_1HUkalnC8Yv1JOuSStATSe-VQtOV7QrskCho3Kv4A'
          }
        }
      );
      console.log('Submit successful', response);
    } catch (error) {
      console.error("Submit error", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/jdl/delete-entity-search-configuration/${category}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcyODA1MTU1MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzI3OTY1MTUwfQ.8racOUe6UJlJLfnnYo4GEtBW-vl4LSOm4HI3uHkhYjXV_1HUkalnC8Yv1JOuSStATSe-VQtOV7QrskCho3Kv4A'
          }
        }
      );
      console.log('Delete successful', response);
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  const handleUpdate = async () => {
    const payload = createPayload();
    console.log("Current Data:", existingData);
    console.log("Updated Data:", payload);
    try {
      const response = await axios.put(
        'http://localhost:8080/api/jdl/update-entity-search-configuration',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcyODA1MTU1MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzI3OTY1MTUwfQ.8racOUe6UJlJLfnnYo4GEtBW-vl4LSOm4HI3uHkhYjXV_1HUkalnC8Yv1JOuSStATSe-VQtOV7QrskCho3Kv4A'
          }
        }
      );
      console.log('Update successful', response);
    } catch (error) {
      console.error("Update error", error);
    }
  };

  const checkIfDataPresent = async () => {
    if (!category) return;
    try {
      const response = await axios.get(
        `http://localhost:8080/api/jdl/get-entity-search-configuration/${category}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcyODA1MTU1MCwiYXV0aCI6IlJPTEVfQURNSU4gUk9MRV9VU0VSIiwiaWF0IjoxNzI3OTY1MTUwfQ.8racOUe6UJlJLfnnYo4GEtBW-vl4LSOm4HI3uHkhYjXV_1HUkalnC8Yv1JOuSStATSe-VQtOV7QrskCho3Kv4A'
          }
        }
      );
      const data = response.data;
      setIsDataPresent(!!data);
      if (data) {
        setExistingData(data);
        setSearchType(data.entitySearchType);
        setApiDetails(data.externalEntityMetaData);
        setSelectedAttributes(data.externalAttributesMetaData.map(attr => attr.attributeName));
        handleCategoryChange(data);
      }
    } catch (error) {
      console.error("Check data error", error);
      setIsDataPresent(false);
    }
  };

  const addHeader = () => {
    setApiDetails((prev) => ({
      ...prev,
      headers: [...prev.headers, { key: '', value: '' }],
    }));
  };


  return (
    <main>
      <section className="search-config">
        <label id="category-label" htmlFor="category">Select Category:</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Choose a category</option>
          {Object.keys(fieldTemplates).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <fieldset>
          <legend>Type of Search:</legend>
          <div className="radio-group">
            <label><input type="radio" name="searchType" value="external" checked={searchType === 'external'} onChange={handleSearchTypeChange} /> External</label>
            <label><input type="radio" name="searchType" value="search-engine" checked={searchType === 'search-engine'} onChange={handleSearchTypeChange} /> Search Engine</label>
            <label><input type="radio" name="searchType" value="vector-search" checked={searchType === 'vector-search'} onChange={handleSearchTypeChange} /> Vector Search</label>
          </div>
        </fieldset>

        <div id="searchType-accordion-container">
          {searchType === 'external' && (
            <Accordion attribute="API Details" existingData={existingData} setApiDetails={setApiDetails} handleHeaderChange={handleHeaderChange} removeHeader={removeHeader} apiDetails={apiDetails} addHeader={addHeader}/>
          )}
        </div>

        <fieldset>
          <legend>Select Searchable Attributes:</legend>
          <div id="attributes-container" style={{ height: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
            {attributes.map(attr => (
              <label key={attr.key}>
                <input
                  type="checkbox"
                  name="attributes"
                  value={attr.key}
                  checked={selectedAttributes.includes(attr.key)}
                  onChange={handleExternalAttributesChange}
                /> {attr.key}
              </label>
            ))}
          </div>
        </fieldset>

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
                  checked={selectedAttributes.includes(attr.key)}
                  onChange={handleExternalAttributesChange}
                /> {attr.key}
              </label>
            ))}
          </div>
        </fieldset>
        {searchType === 'external' && selectedAttributes.map(attr => (
          <Accordion key={attr} attribute={attr} existingData={existingData} setApiDetails={setApiDetails} handleHeaderChange={handleHeaderChange} removeHeader={removeHeader} apiDetails={apiDetails} addHeader={addHeader}/>
        ))}

        <button type="submit" id="submit-button" onClick={handleSubmit}>Submit</button>
        <button type="button" id="delete-button" onClick={handleDelete}>Delete</button>
        {isDataPresent && <button type="button" id="update-button" onClick={handleUpdate}>Update</button>}
      </section>
    </main>
  );
};

const Accordion = ({ attribute, existingData, setApiDetails, isApiDetails, handleHeaderChange, removeHeader, apiDetails, addHeader }) => {
  const [error, setError] = useState('');

  const toggleAccordion = (e) => {
    e.target.classList.toggle('active');
    const panel = e.target.nextElementSibling;
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  };

  const handleJsonChange = (e, key) => {
    try {
      const parsedJson = JSON.parse(e.target.value);
      setApiDetails(prev => ({ ...prev, [key]: [parsedJson] }));
      setError('');
    } catch (error) {
      setError('Invalid JSON format');
    }
  };

  const existingAttributeData = isApiDetails ? existingData : existingData?.externalAttributesMetaData?.find(attr => attr.attributeName === attribute) || {};
  console.log(existingAttributeData," anan");
  return (
    <>
      <button className="accordion" onClick={toggleAccordion}>
        {attribute}
      </button>
      <div className="panel" style={{ display: 'none' }}>
        <label htmlFor={`${attribute}-url`}>URL:</label>
        <input type="text" id={`${attribute}-url`} placeholder="Enter API URL" defaultValue={existingAttributeData.externalUrl || ''} onChange={(e) => setApiDetails(prev => ({ ...prev, externalUrl: e.target.value }))} /><br />
        <label htmlFor={`${attribute}-httpMethod`}>HTTP Method:</label>
        <select id={`${attribute}-httpMethod`} defaultValue={existingAttributeData.httpMethod || ''} onChange={(e) => setApiDetails(prev => ({ ...prev, httpMethod: e.target.value }))}>
          <option value="">Select HTTP Method</option>
          <option value="POST">POST</option>
          <option value="GET">GET</option>
          <option value="PUT">PUT</option>
        </select><br />
        <label htmlFor={`${attribute}-headers`}>Headers:</label>
        {apiDetails?.headers.map((header, index) => (
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
                            label="Header Key"
                            value={header.key}
                            onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                            style={{ marginRight: '10px' }}
                          />
                          <TextField
                            label="Header Value"
                            value={header.value}
                            onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                          />
                          <IconButton onClick={() => removeHeader(index)}>
                          </IconButton>
                        </div>
                      ))}
                       <Button onClick={() => addHeader()} variant="outlined">
                        Add Header
                      </Button>
        {/* <textarea id={`${attribute}-headers`} placeholder="Enter headers in JSON format" defaultValue={existingAttributeData.headers ? JSON.stringify(existingAttributeData.headers[0]) : ''} onChange={(e) => handleJsonChange(e, 'headers')}></textarea><br /> */}
        <label htmlFor={`${attribute}-payload`}>Payload:</label>
        <textarea id={`${attribute}-payload`} placeholder="Enter payload details in JSON format" defaultValue={existingAttributeData.payload ? JSON.stringify(existingAttributeData.payload) : ''} onChange={(e) => handleJsonChange(e, 'payload')}></textarea><br />
        <label htmlFor={`${attribute}-response-parser`}>Response Parser:</label>
        <textarea id={`${attribute}-response-parser`} placeholder="Enter response parser details" defaultValue={existingAttributeData.responseParser ? JSON.stringify(existingAttributeData.responseParser[0]) : ''} onChange={(e) => handleJsonChange(e, 'responseParser')}></textarea><br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </>
  );
};

export default AddProductCategoryPage;