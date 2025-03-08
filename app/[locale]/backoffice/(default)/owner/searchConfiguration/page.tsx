'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Trash2, Settings, Save, RotateCcw, ChevronDown, Database, Server, Code, FileJson, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isValidJSON, createConfigurationPayload } from "@/utils/utils";
// import { isValidJSON, createConfigurationPayload } from "@//utils";

const Index = () => {
  const [category, setCategory] = useState("");
  const [searchType, setSearchType] = useState("");
  const [recommendation, setRecommendation] = useState(false);
  const [externalAttributes, setExternalAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [expandedAttributes, setExpandedAttributes] = useState({});
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [responseParsers, setResponseParsers] = useState([{ key: "", value: "" }]);
  const [payloadError, setPayloadError] = useState("");
  const [payload, setPayload] = useState("");
  const [responsePayload, setResponsePayload] = useState("");
  const [responsePayloadError, setResponsePayloadError] = useState("");

  // Mock categories for demo purposes - in real implementation this would be fetched from API
  const categoryNames = ["Product", "Order", "Customer", "Inventory"];

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const addResponseParser = () => {
    setResponseParsers([...responseParsers, { key: "", value: "" }]);
  };

  const removeResponseParser = (index) => {
    setResponseParsers(responseParsers.filter((_, i) => i !== index));
  };

  const validatePayload = (value) => {
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

  const validateResponsePayload = (value) => {
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

  const handleExternalAttributesChange = (attribute: string, value: any) => {
    setSelectedAttributes(prev => {
      return prev.map(attr => {
        if (attr.attribute === attribute) {
          return { ...attr, ...value };
        }
        return attr;
      });
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 md:p-16">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-xl border-gray-100 overflow-hidden">
          <CardHeader className="border-b pb-6 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-bold text-white">
                External Configuration
              </CardTitle>
              {/* <Button
                variant="outline"
                size="sm"
                className="rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <Settings className="h-5 w-5 mr-2" />
                Manage UI
              </Button> */}
            </div>
          </CardHeader>
          <CardContent className="pt-10 space-y-10">
            <div className="space-y-8">
              {/* Category Selection */}
              <div className="space-y-4">
                <Label htmlFor="category" className="text-lg font-medium flex items-center">
                  <Database className="h-5 w-5 mr-3 text-blue-500" />
                  Select Category
                </Label>
                <Select value={category} onValueChange={setCategory} className="w-full">
                  <SelectTrigger className="rounded-md border border-gray-300 shadow-sm hover:border-blue-400 transition-colors">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="border border-gray-300 rounded-md shadow-lg z-10">
                    {categoryNames.map((name) => (
                      <SelectItem key={name} value={name} className="hover:bg-blue-100 transition-colors">
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Type Selection */}
              <div className="space-y-4 bg-blue-50 p-8 rounded-lg border border-blue-100">
                <Label className="text-lg font-medium flex items-center">
                  <Server className="h-5 w-5 mr-3 text-blue-500" />
                  Type of Search
                </Label>
                <div className="flex space-x-8 mt-3">
                  <div className="flex items-center space-x-3 hover:bg-white/60 p-3 rounded-md transition-colors cursor-pointer">
                    <input
                      type="radio"
                      id="external"
                      name="searchType"
                      value="external"
                      checked={searchType === "external"}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Label htmlFor="external" className="font-normal text-gray-700 cursor-pointer">External</Label>
                  </div>
                  <div className="flex items-center space-x-3 hover:bg-white/60 p-3 rounded-md transition-colors cursor-pointer">
                    <input
                      type="radio"
                      id="searchEngine"
                      name="searchType"
                      value="searchEngine"
                      checked={searchType === "searchEngine"}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Label htmlFor="searchEngine" className="font-normal text-gray-700 cursor-pointer">Search Engine</Label>
                  </div>
                </div>
              </div>

              {/* Recommendation Option (only for searchEngine) */}
              {searchType === "searchEngine" && (
                <div className="flex items-center space-x-3 ml-5 mt-3 p-4 bg-white rounded-md border border-gray-100 shadow-sm transition-all">
                  <Checkbox
                    id="recommendation"
                    checked={recommendation}
                    onCheckedChange={(checked) => setRecommendation(checked === true)}
                    className="text-blue-600 border-gray-300"
                  />
                  <Label htmlFor="recommendation" className="font-normal text-gray-700">Enable Recommendations</Label>
                </div>
              )}

              {/* External API Configuration (only for external) */}
              {searchType === "external" && (
                <div className="space-y-6 p-6 border rounded-lg shadow-md bg-white">
                  <h3 className="font-semibold text-xl text-gray-800 flex items-center">
                    <Code className="h-5 w-5 mr-3 text-blue-500" />
                    API Configuration
                  </h3>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="url" className="text-gray-700">URL</Label>
                        <Input
                          id="url"
                          placeholder="Enter API URL"
                          className="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          onChange={(e) => {
                            // Update the external attribute with the URL
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

                      <div className="space-y-3">
                        <Label htmlFor="method" className="text-gray-700">HTTP Method</Label>
                        <Select onValueChange={(value) => {
                          // Update the external attribute with the method
                          setSelectedAttributes(prev => {
                            return prev.map(attr => {
                              if (attr.attribute === 'external') {
                                return { ...attr, httpMethod: value };
                              }
                              return attr;
                            });
                          });
                        }}>
                          <SelectTrigger className="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                            <SelectValue placeholder="Select HTTP Method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-700">Headers</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addHeader}
                          className="h-9 px-4 text-sm rounded-full border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Header
                        </Button>
                      </div>

                      {headers.map((header, index) => (
                        <div key={index} className="flex items-center space-x-3 p-4 rounded-md bg-blue-50/50 border border-blue-100 animate-in fade-in duration-300">
                          <Input
                            placeholder="Header Key"
                            value={header.key}
                            onChange={(e) => {
                              handleHeaderChange(index, e.target.value, header.value);
                            }}
                            className="flex-1 border-gray-300"
                          />
                          <Input
                            placeholder="Header Value"
                            value={header.value}
                            onChange={(e) => {
                              handleHeaderChange(index, header.key, e.target.value);
                            }}
                            className="flex-1 border-gray-300"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeHeader(index)}
                            className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Label htmlFor="payload" className="text-gray-700 flex items-center">
                          <FileJson className="h-5 w-5 mr-3 text-blue-500" />
                          Payload
                        </Label>
                        {payload && (
                          isValidJSON(payload)
                            ? <CheckCircle className="h-5 w-5 text-green-500" />
                            : <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <Textarea
                        id="payload"
                        placeholder="Enter payload details in JSON format"
                        className={`min-h-[120px] border-gray-300 rounded-md font-mono text-sm ${payloadError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'}`}
                        value={payload}
                        onChange={(e) => validatePayload(e.target.value)}
                      />
                      {payloadError && (
                        <Alert variant="destructive" className="py-3 bg-red-50 text-red-800 border-red-200">
                          <AlertCircle className="h-5 w-5" />
                          <AlertDescription className="text-sm font-medium ml-3">
                            {payloadError}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-700">Response Parser</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addResponseParser}
                          className="h-9 px-4 text-sm rounded-full border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Parser
                        </Button>
                      </div>

                      {responseParsers.map((parser, index) => (
                        <div key={index} className="flex items-center space-x-3 p-4 rounded-md bg-blue-50/50 border border-blue-100 animate-in fade-in duration-300">
                          <Input
                            placeholder="Parser Key"
                            value={parser.key}
                            onChange={(e) => {
                              handleResponseParserChange(index, e.target.value, parser.value);
                            }}
                            className="flex-1 border-gray-300"
                          />
                          <Input
                            placeholder="Parser Value"
                            value={parser.value}
                            onChange={(e) => {
                              handleResponseParserChange(index, parser.key, e.target.value);
                            }}
                            className="flex-1 border-gray-300"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeResponseParser(index)}
                            className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="responsePayload" className="text-gray-700 flex items-center">
                        <FileJson className="h-5 w-5 mr-3 text-blue-500" />
                        Response Payload
                      </Label>
                      {responsePayload && (
                        isValidJSON(responsePayload)
                          ? <CheckCircle className="h-5 w-5 text-green-500" />
                          : <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Textarea
                        id="responsePayload"
                        placeholder="Enter response payload details"
                        className={`min-h-[120px] border-gray-300 rounded-md font-mono text-sm ${responsePayloadError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'}`}
                        value={responsePayload}
                        onChange={(e) => validateResponsePayload(e.target.value)}
                      />
                      {responsePayloadError && (
                        <Alert variant="destructive" className="py-3 bg-red-50 text-red-800 border-red-200">
                          <AlertCircle className="h-5 w-5" />
                          <AlertDescription className="text-sm font-medium ml-3">
                            {responsePayloadError}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* External Attributes Section */}
              <div className="space-y-4">
                <Label className="text-lg font-medium flex items-center">
                  <Settings className="h-5 w-5 mr-3 text-blue-500" />
                  External Configuration
                </Label>
                <div className="border rounded-lg p-5 max-h-[300px] overflow-y-auto shadow-sm bg-gradient-to-b from-white to-gray-50">
                  <div className="space-y-3">
                    {categoryNames.map((attr) => (
                      <div key={attr} className="flex items-center space-x-3 p-3 hover:bg-blue-50 rounded-md transition-colors">
                        <Checkbox
                          id={`attr-${attr}`}
                          value={attr}
                          onCheckedChange={(checked) => {
                            if (checked === true) {
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
                          className="text-blue-600 border-gray-300"
                        />
                        <Label htmlFor={`attr-${attr}`} className="font-normal text-gray-700 cursor-pointer">{attr}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-5 border-t pt-6 bg-gray-50">
            <Button
              variant="outline"
              type="button"
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-100"
            >
              <RotateCcw className="h-5 w-5" />
              Reset
            </Button>
            <Button
              variant="destructive"
              type="button"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              Delete
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center gap-2"
              disabled={searchType === 'external' && payload && !!payloadError}
            >
              <Save className="h-5 w-5" />
              Save
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
