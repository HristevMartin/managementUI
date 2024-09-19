'use client';

import './category.css';

import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Autocomplete,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthJHipster } from '@/context/JHipsterContext';
import {
  transformMetaCategoryData,
  transformMetaCategoryDataToFeComponent,
} from '@/utils/managementFormUtils';
import { useRouter } from 'next/navigation';
import './page.css'

const AddProductCategoryPage = () => {
  const [categoryName, setCategoryName] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [optionsSelect, setOptionsSelect] = useState([]);
  const [availableKeys, setAvailableKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  const { jHipsterAuthToken } = useAuthJHipster();
  const [rawData, setRawData] = useState([]);
  const [isDataAvailable, setIsDataAvailable] = useState(true);
  const [file, setFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert('No file selected!');
      return;
    }
    setFile(file);
  };

  const router = useRouter();

  const onSelectKey = (newValue, index) => {
    const updatedFields = customFields.map((field, idx) => {
      if (idx === index) {
        return { ...field, key: newValue };
      }
      return field;
    });
    setCustomFields(updatedFields);
    setSelectedKey(newValue);
  };

  console.log('Selected key1:', selectedKey);

  const apiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL;

  const handleFileSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityName', JSON.stringify([categoryName]));
    formData.append('customFields', JSON.stringify(customFields));

    try {
      const response = await fetch(`${apiUrl}/bulk-upload`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        alert('Category added successfully');
        console.log(result);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Failed to submit category:', error);
      alert('Failed to add category');
    }
  };

  const apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;
  const defaultKeys = ['fare', 'date', 'passenger'];

  useEffect(() => {
    if (jHipsterAuthToken) {
      const fetchData = async () => {
        const response = await fetch(`${apiUrlSpring}/api/jdl/entities`, {
          headers: {
            Authorization: `Bearer ${jHipsterAuthToken}`,
          },
        });
        if (response.ok) {
          if (response.status === 204) {
            setIsDataAvailable(false);
            return;
          }

          const data = await response.json();
          console.log('Data:', data);
          const parsedData = transformMetaCategoryData(data);
          setRawData(parsedData);
          let transformedData = transformMetaCategoryDataToFeComponent(parsedData);
          const CategoryNames = transformedData.map((item) => item.entityName);

          if (data.length > 0) {
            setCustomFields([transformedData[0].customFields[0]]);
            setCategoryName(transformedData[0].entityName);
            setOptionsSelect(CategoryNames);

            const initialKeys = new Set(transformedData[0].customFields.map((field) => field.key));
            const availableKeys = [...initialKeys];
            console.log('Available keys:', availableKeys);
            setAvailableKeys(availableKeys);
          }
        } else {
          console.error('Failed to fetch data');
        }
      };

      fetchData();
    } else {
      console.log('Token not available, fetching token...');
      // trigger token fetch if needed
    }
  }, [jHipsterAuthToken]);

  // useEffect(() => {
  //   const updateKeysForSelectedCategory = () => {
  //     const categoryData = rawData.find((cat) => cat.entityName === categoryName);
  //     if (categoryData) {
  //       const keys = categoryData.customFields.map((field) => field.key);
  //       setAvailableKeys(keys);
  //     }
  //   };

  //   updateKeysForSelectedCategory();
  // }, [categoryName, rawData]);

  useEffect(() => {
    const updateKeysForSelectedCategory = () => {
      const categoryData = rawData.find((cat) => cat.entityName === categoryName);
      let newKeys = new Set(defaultKeys);

      if (categoryData) {
        categoryData.customFields.forEach((field) => newKeys.add(field.key));
      }

      setAvailableKeys([...newKeys]);
    };

    updateKeysForSelectedCategory();
  }, [categoryName, rawData]);

  const typeOptions = ['text', 'number', 'date', 'select', 'passenger'];

  const handleFieldChange = (index, field, value) => {
    const updatedFields = customFields.map((cf, i) =>
      i === index ? { ...cf, [field]: value } : cf,
    );
    setCustomFields(updatedFields);
  };

  const validateFields = () => {
    return customFields.every((field) => field.key && field.type && field.label);
  };

  const handleAddCustomField = () => {
    if (!selectedKey) {
      alert('Please select a key first.');
      return;
    }
    console.log('Selected key:', selectedKey);
    const fieldTemplate = {
      key: selectedKey,
      type: '',
      label: '',
      required: false,
      placeholder: '',
      options: [],
    };

    console.log('Adding field:', fieldTemplate);
    setCustomFields((prevFields) => [...prevFields, fieldTemplate]);
    setSelectedKey('');
  };

  useEffect(() => {
    setSelectedKey('');
  }, [categoryName]);

  const handleRemoveField = (index) => {
    const newCustomFields = customFields.filter((_, i) => i !== index);
    setCustomFields(newCustomFields);

    const keyExists = newCustomFields.some((field) => field.key === selectedKey);
    if (!keyExists) {
      setSelectedKey('');
    }
  };

  const handleAddOption = (fieldIndex) => {
    const newFields = [...customFields];
    newFields[fieldIndex].options.push({ value: '', label: '' });
    setCustomFields(newFields);
  };

  const handleOptionChange = (fieldIndex, optionIndex, optionPart, value) => {
    const newFields = [...customFields];
    console.log('Before updating', newFields[fieldIndex].options[optionIndex]);

    if (optionPart === 'value') {
      newFields[fieldIndex].options[optionIndex]['value'] = value;
      newFields[fieldIndex].options[optionIndex]['label'] = value;
    } else {
      newFields[fieldIndex].options[optionIndex][optionPart] = value;
    }

    console.log('After updating', newFields[fieldIndex].options[optionIndex]);
    setCustomFields(newFields);
  };

  const handleRemoveOption = (fieldIndex, optionIndex) => {
    const newFields = [...customFields];
    newFields[fieldIndex].options.splice(optionIndex, 1);
    setCustomFields(newFields);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateFields()) {
      alert('Please complete all fields correctly.');
      return;
    }

    const payload = { entityName: [categoryName], customFields };

    console.log('Submitting:', payload);
    const apiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL;

    const apiRequest = async () => {
      let request = await fetch(`${apiUrl}/mockup-product-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (request.ok) {
        alert('Category added successfully');
      } else {
        alert('Failed to add category');
      }
    };
    apiRequest();
  };

  if (!isDataAvailable) {
    return (
      <Container maxWidth="md" style={{ marginTop: '20px' }}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <div>No data available. Please add meta category first.</div>
          <Button
            variant="contained"
            color="primary"
            // navigate to addInitialProductCategoryPage.
            onClick={() => router.push('/owner/addInitialProductCategory')}
            style={{ marginTop: '20px' }}
          >
            Add Meta Category
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container className='input-form-move mt-4' maxWidth="md">
      <Paper elevation={3} style={{ padding: '20px' }}>
        <h1>Add Travel Product Type</h1>
        <form onSubmit={handleSubmit}>
          <Autocomplete
            fullWidth
            options={optionsSelect}
            value={categoryName}
            onChange={(event, newValue) => {
              setCategoryName(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Travel Product Type Name" margin="normal" required />
            )}
          />

          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Key</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Label</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Placeholder</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Required</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Options</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {customFields.map((field, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Autocomplete
                      options={availableKeys}
                      size="small"
                      sx={{ width: '110px', marginTop: '20px' }}
                      disableClearable
                      renderInput={(params) => <TextField {...params} />}
                      onChange={(event, newValue) => {
                        console.log(`availableKeys:!!!`, availableKeys);
                        onSelectKey(newValue, index);
                      }}
                      style={{ marginBottom: '20px' }}
                    />
                  </TableCell>

                  <TableCell key={index}>
                    <Autocomplete
                      size="small"
                      style={{ marginBottom: '8px', width: '110px' }}
                      value={field.type}
                      onChange={(event, newValue) => {
                        handleFieldChange(index, 'type', newValue);
                      }}
                      options={typeOptions}
                      disableClearable
                      renderInput={(params) => (
                        <TextField {...params} label="Type" margin="normal" fullWidth />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={field.label}
                      onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={field.placeholder}
                      onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      size="small"
                      checked={field.required}
                      onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                    />
                  </TableCell>

                  <TableCell>
                    {field.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '10px',
                        }}
                      >
                        <TextField
                          size="small"
                          sx={{ maxWidth: '400px', fontSize: '10px' }}
                          value={option.value}
                          onChange={(e) =>
                            handleOptionChange(index, optIndex, 'value', e.target.value)
                          }
                          placeholder="Label"
                          style={{ marginTop: '4px', flex: 1 }}
                        />
                        <IconButton onClick={() => handleRemoveOption(index, optIndex)}>
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    ))}
                    {field.type === 'select' && (
                      <Button onClick={() => handleAddOption(index)}>Add Option</Button>
                    )}
                  </TableCell>

                  <TableCell>
                    <IconButton onClick={() => handleRemoveField(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div style={{ margin: '20px 0' }}>
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileUpload}
              style={{ display: 'block', marginBottom: '10px', width: '28%' }}
            />

            {file && (
              <Button onClick={handleFileSubmit} variant="contained" color="primary">
                Upload & Submit File
              </Button>
            )}
          </div>

          <div className="mt-3">
            <Button
              onClick={handleAddCustomField}
              variant="contained"
              color="primary"
              sx={{ marginRight: '16px' }}
              disabled={!selectedKey}
            >
              Add Custom Field
            </Button>

            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </div>
        </form>
      </Paper>
    </Container>
  );
};

export default AddProductCategoryPage;
