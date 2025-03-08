'use client';


import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { PlusCircle, Trash2, Settings, Save, RotateCcw, ChevronDown, Database, Server, Code, FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Utility functions to validate JSON and create payload
const isValidJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// Simple function to create configuration payload
const createConfigurationPayload = (
  category: string,
  searchType: string,
  recommendation: boolean,
  selectedAttributes: any[],
  searchableAttributes: any[],
  searchableRelationFields: any[]
) => {
  return {
    category,
    searchType,
    recommendation,
    selectedAttributes,
    searchableAttributes,
    searchableRelationFields
  };
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

  // Mock categories for demo purposes
  const categoryNames = ["Product", "Order", "Customer", "Inventory"];

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const addResponseParser = () => {
    setResponseParsers([...responseParsers, { key: "", value: "" }]);
  };

  const removeResponseParser = (index: number) => {
    setResponseParsers(responseParsers.filter((_, i) => i !== index));
  };

  const validatePayload = (value: string) => {
    setPayload(value);
    if (!value.trim()) {
      setPayloadError("");
      return;
    }

    if (isValidJSON(value)) {
      setPayloadError("");
      // Update the selectedAttributes for the external attribute with the new payload
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

  const validateResponsePayload = (value: string) => {
    setResponsePayload(value);
    if (!value.trim()) {
      setResponsePayloadError("");
      return;
    }

    if (isValidJSON(value)) {
      setResponsePayloadError("");
      // Update the selectedAttributes for the external attribute with the new responsePayload
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

  const handleSubmit = () => {
    // Validate JSON payload before submission
    if (searchType === 'external' && payload && !isValidJSON(payload)) {
      setPayloadError("Cannot submit with invalid JSON payload");
      return;
    }

    if (searchType === 'external' && responsePayload && !isValidJSON(responsePayload)) {
      setResponsePayloadError("Cannot submit with invalid JSON response payload");
      return;
    }

    // Create the final payload
    const formData = createConfigurationPayload(
      category,
      searchType,
      recommendation,
      selectedAttributes.map(attr => ({
        attribute: attr.attribute,
        externalUrl: attr.externalUrl || '',
        httpMethod: attr.httpMethod || '',
        headers: attr.headers || [],
        payload: attr.payload || '',
        responsePayload: attr.responsePayload || '',
        responseParser: attr.responseParser || []
      })),
      [], // searchableAttributes (empty in this demo)
      [] // searchableRelationFields (empty in this demo)
    );

    console.log("Form submitted with data:", formData);
    // Here you would typically send this data to your API
  };

  // Event handlers for Input components
  const handleHeaderChange = (index: number, key: string, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = { key, value };
    setHeaders(newHeaders);

    // Update the selectedAttributes with the headers
    setSelectedAttributes(prev => {
      return prev.map(attr => {
        if (attr.attribute === 'external') {
          return { ...attr, headers: newHeaders };
        }
        return attr;
      });
    });
  };

  const handleResponseParserChange = (index: number, key: string, value: string) => {
    const newParsers = [...responseParsers];
    newParsers[index] = { key, value };
    setResponseParsers(newParsers);

    // Update the selectedAttributes with the response parsers
    setSelectedAttributes(prev => {
      return prev.map(attr => {
        if (attr.attribute === 'external') {
          return { ...attr, responseParser: newParsers };
        }
        return attr;
      });
    });
  };

  return (
    <div className="animate-fade-in-down">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-900">External Configuration</h1>
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
              <option value="">Select a category</option>
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
                  onChange={(e) => setSearchType(e.target.value)}
                  className="h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label htmlFor="external" className="text-sm text-gray-700">External</label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="searchEngine"
                  name="searchType"
                  value="searchEngine"
                  checked={searchType === "searchEngine"}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label htmlFor="searchEngine" className="text-sm text-gray-700">Search Engine</label>
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
                      onChange={(e) => {
                        setSelectedAttributes(prev => {
                          return prev.map(attr => {
                            if (attr.attribute === 'external') {
                              return { ...attr, externalUrl: e.target.value };
                            }
                            return attr;
                          });
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="method" className="block text-sm font-medium text-gray-700">HTTP Method</label>
                    <select
                      id="method"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => {
                        setSelectedAttributes(prev => {
                          return prev.map(attr => {
                            if (attr.attribute === 'external') {
                              return { ...attr, httpMethod: e.target.value };
                            }
                            return attr;
                          });
                        });
                      }}
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

                  {headers.map((header, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-md bg-gray-50 border border-gray-200">
                      <input
                        type="text"
                        placeholder="Header Key"
                        value={header.key}
                        onChange={(e) => {
                          handleHeaderChange(index, e.target.value, header.value);
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Header Value"
                        value={header.value}
                        onChange={(e) => {
                          handleHeaderChange(index, header.key, e.target.value);
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => removeHeader(index)}
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
                    className={`w-full min-h-[120px] px-3 py-2 border rounded-md font-mono text-sm ${
                      payloadError 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    value={payload}
                    onChange={(e) => validatePayload(e.target.value)}
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

                  {responseParsers.map((parser, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-md bg-gray-50 border border-gray-200">
                      <input
                        type="text"
                        placeholder="Parser Key"
                        value={parser.key}
                        onChange={(e) => {
                          handleResponseParserChange(index, e.target.value, parser.value);
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Parser Value"
                        value={parser.value}
                        onChange={(e) => {
                          handleResponseParserChange(index, parser.key, e.target.value);
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => removeResponseParser(index)}
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
                    className={`w-full min-h-[120px] px-3 py-2 border rounded-md font-mono text-sm ${
                      responsePayloadError 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    value={responsePayload}
                    onChange={(e) => validateResponsePayload(e.target.value)}
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

          {/* External Attributes Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Settings className="h-4 w-4 mr-2 text-indigo-500" />
              External Configuration
            </label>
            <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto shadow-sm bg-white">
              <div className="space-y-2">
                {categoryNames.map((attr) => (
                  <div key={attr} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                    <input
                      type="checkbox"
                      id={`attr-${attr}`}
                      value={attr}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAttributes([...selectedAttributes, {
                            attribute: attr,
                            externalUrl: '',
                            httpMethod: '',
                            headers: [],
                            payload: '',
                            responsePayload: '',
                            responseParser: []
                          }]);
                        } else {
                          setSelectedAttributes(selectedAttributes.filter(a => a.attribute !== attr));
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label htmlFor={`attr-${attr}`} className="text-sm text-gray-700">{attr}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 border-t p-6 bg-gray-50">
          <Button
            variant="outline"
            type="button"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            variant="destructive"
            type="button"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            disabled={searchType === 'external' && payload && !!payloadError}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExternalConfiguration;