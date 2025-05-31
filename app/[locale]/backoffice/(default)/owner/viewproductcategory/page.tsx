'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  IconButton,
  Autocomplete,
  TextField,
  Checkbox,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useAuthJHipster } from '@/context/JHipsterContext';
import {
  parseMetaCategoryDataTypes,
  transformMetaCategoryData,
} from '@/utils/managementFormUtils';
import './page.css'

const ViewProductTypes = ({ pageType = 'default' }) => {
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);
  const [editFieldIndex, setEditFieldIndex] = useState(null);
  const [fieldEdits, setFieldEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(-1);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState({
    key: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: [],
  });
  const [selectedCategoriesForDeletion, setSelectedCategoriesForDeletion] = useState([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [deleteFlag, setDeleteFlag] = useState(false);
  const [metaProductTypes, setMetaProductTypes] = useState([]);
  const { jHipsterAuthToken } = useAuthJHipster();

  const getUsedKeys = () => {
    return selectedFields.map((field) => field.key);
  };

  const apiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/mockup-product-category`);
        const data = await response.json();
        console.log('data is', data);
        setProductTypes(data);
        if (data.length > 0) {
          setSelectedProductType(data[0]);
          const customFieldsKey = `customFields_${data[0].entityName[0]}`;
          setSelectedFields(data[0][customFieldsKey] || []);
        }else{
          setError('No data found. Please add a Meta Product Type first.');
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();
  }, [deleteFlag]);

  const apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;

  useEffect(() => {
    if (!jHipsterAuthToken || !selectedProductType) return;

    const fetchCategoryMetaData = async () => {
      const response = await fetch(`${apiUrlSpring}/api/jdl/entities`, {
        headers: {
          Authorization: `Bearer ${jHipsterAuthToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        let parsedData = transformMetaCategoryData(data);
        let productTypes = parseMetaCategoryDataTypes(
          parsedData,
          selectedProductType?.entityName[0],
        );
        
        const usedKeys = getUsedKeys();
        console.log("Used Keys: ", usedKeys);
        const filteredKeys = productTypes.filter((key) => !usedKeys.includes(key));
        console.log("Filtered Keys: ", filteredKeys);
        
        setMetaProductTypes(filteredKeys);
      } else {
        console.log('error fetching data from the server');
      }
    };
    fetchCategoryMetaData();
  }, [jHipsterAuthToken, selectedProductType]);


  const handleDelete = (index) => {
    setOpenDeleteDialog(true);
    setDeleteIndex(index);
  };

  const deleteField = async () => {
    if (deleteIndex >= 0 && deleteIndex < selectedFields.length) {
      const fieldToDelete = selectedFields[deleteIndex];
      try {
        const entityName = encodeURIComponent(selectedProductType.entityName[0]);
        const fieldKey = encodeURIComponent(fieldToDelete.key);
        const response = await fetch(
          `${apiUrl}/delete-custom-field/${entityName}/custom-field/${fieldKey}`,
          { method: 'DELETE' },
        );
        if (response.ok) {
          setSelectedFields((prev) => prev.filter((_, idx) => idx !== deleteIndex));
          alert('Field deleted successfully!');
        } else {
          alert('Failed to delete the field.');
        }
      } catch (error) {
        alert('Error deleting field.');
      } finally {
        setOpenDeleteDialog(false);
      }
    }
  };

  const handleSelectChange = (event, value) => {
    console.log('Selected value:', value);
    if (value) {
      setSelectedProductType(value);
      setSelectedFields(value[`customFields_${value.entityName[0]}`] || []);
    } else {
      setSelectedProductType(null);
      setSelectedFields([]);
    }
  };

  const startEdit = (index, field) => {
    setEditFieldIndex(index);
    console.log('field is', field);
    setFieldEdits(field);
  };

  const cancelEdit = () => {
    setEditFieldIndex(null);
    setFieldEdits({});
  };

  const saveEdit = async (index) => {
    const updatedFields = [...selectedFields];
    updatedFields[index] = fieldEdits;
    setSelectedFields(updatedFields);
    setEditFieldIndex(null);
    setFieldEdits({});

    const payload = {
      customFields: [
        {
          key: fieldEdits.key,
          ...(fieldEdits.required !== undefined && { required: fieldEdits.required }),
          ...(fieldEdits.label && { label: fieldEdits.label }),
          ...(fieldEdits.placeholder && { placeholder: fieldEdits.placeholder }),
          ...(fieldEdits.type && { type: fieldEdits.type }),
          ...(fieldEdits.options && {
            options: fieldEdits.options.map((opt) => ({ value: opt.value, label: opt.label })),
          }),
        },
      ],
    };

    try {
      const response = await fetch(
        `${apiUrl}/update-product-category/${selectedProductType.entityName}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (response.ok) {
        alert('Update successful!');
      } else {
        alert('Failed to update!');
      }
    } catch (error) {
      alert('Error updating data');
    }
  };

  const handleEditChange = (key, value) => {
    setFieldEdits((prev) => ({ ...prev, [key]: value }));
  };

  const addNewField = () => {
    setShowAddField(true);
    setNewField({
      key: metaProductTypes.length > 0 ? metaProductTypes[0].key : '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: [],
    });
  };

  const handleAddOption = () => {
    const newOptions = [...newField.options, { label: '', value: '' }];
    setNewField((prev) => ({ ...prev, options: newOptions }));
  };

  const handleAddOptionEdit = () => {
    const newOptions = [...fieldEdits.options, { label: '', value: '' }];
    setFieldEdits((prev) => ({ ...prev, options: newOptions }));
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = newField.options.map((opt, idx) =>
      idx === index ? { ...opt, label: value, value: value } : opt,
    );
    setNewField((prev) => ({ ...prev, options: updatedOptions }));
  };

  const handleOptionChangeEdit = (index, value) => {
    const updatedOptions = fieldEdits.options.map((opt, idx) =>
      idx === index ? { ...opt, label: value, value: value } : opt,
    );
    setFieldEdits((prev) => ({ ...prev, options: updatedOptions }));
  };

  const handleRemoveOption = (index) => {
    const filteredOptions = newField.options.filter((_, idx) => idx !== index);
    setNewField((prev) => ({ ...prev, options: filteredOptions }));
  };

  const handleRemoveOptionEdit = (index) => {
    const filteredOptions = fieldEdits.options.filter((_, idx) => idx !== index);
    setFieldEdits((prev) => ({ ...prev, options: filteredOptions }));
  };

  const saveNewField = () => {
    setSelectedFields((prev) => [...prev, newField]);
    setShowAddField(false);

    const saveNewCustomFields = async () => {
      const makeRequest = await fetch(
        `${apiUrl}/update-product-category/${selectedProductType.entityName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newField),
        },
      );
      console.log('saveNewCustomFields is following', saveNewCustomFields);
      try {
        console.log('show me the data');
      } catch (error) {
        console.log('there is an error while fetching the data from the database');
      }
    };
    saveNewCustomFields();
  };

  const cancelNewField = () => {
    setShowAddField(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const handleBulkDelete = async () => {
    if (selectedCategoriesForDeletion.length === 0) {
      alert('No categories selected for deletion.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/bulk-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories: selectedCategoriesForDeletion }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Categories deleted successfully!');

        const remainingCategories = productTypes.filter(
          (type) => !selectedCategoriesForDeletion.includes(type.entityName),
        );

        setProductTypes(remainingCategories);

        if (remainingCategories.length > 0) {
          setSelectedProductType(remainingCategories[0]);
          setSelectedFields(remainingCategories[0].customFields || []);
        } else {
          setSelectedProductType(null);
          setSelectedFields([]);
        }
      } else {
        throw new Error(result.message || 'Failed to delete categories.');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }

    setDeleteFlag(!deleteFlag);
    setShowBulkDeleteDialog(false);
    setSelectedCategoriesForDeletion([]);
  };

  return (
    <Container className='input-form-move mt-5' maxWidth="md">
      <Typography variant="h4" sx={{ mb: 2 }}>
        View Product Types
      </Typography>
      <Autocomplete
        disablePortal
        options={productTypes}
        getOptionLabel={(option) => option.entityName[0]}
        value={selectedProductType}
        onChange={handleSelectChange}
        renderInput={(params) => <TextField {...params} label="Select Category" />}
      />
      {selectedProductType && (
        <Paper sx={{ p: 2 }}>
          <Table sx={{width: '800px' }}>
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
              {selectedFields.map((field, idx) => (
                <TableRow key={idx}>
                  {editFieldIndex === idx ? (
                    <>
                      <TableCell>
                        <TextField
                          value={fieldEdits.key}
                          onChange={(e) => handleEditChange('key', e.target.value)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <TextField
                          select
                          SelectProps={{
                            native: true,
                            style: {
                              height: '40px',
                              width: '100px ',
                              padding: '4px',
                              fontSize: '16px',
                              lineHeight: '1.5',
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: '#fff',
                            },
                          }}
                          fullWidth
                          variant="outlined"
                          value={fieldEdits.type}
                          onChange={(e) => handleEditChange('type', e.target.value)}
                        >
                          <option value="text">Text</option>
                          <option value="select">Select</option>
                          <option value="date">Date</option>
                          <option value="number">Number</option>
                          <option value="passenger">Passenger</option>
                        </TextField>
                      </TableCell>

                      <TableCell>
                        <TextField
                          value={fieldEdits.label}
                          onChange={(e) => handleEditChange('label', e.target.value)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={fieldEdits.placeholder}
                          onChange={(e) => handleEditChange('placeholder', e.target.value)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={fieldEdits.required}
                          onChange={(e) => handleEditChange('required', e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        {fieldEdits.options.map((opt, index) => (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              margin: '5px 0',
                              width: '120px',
                            }}
                          >
                            <TextField
                              fullWidth
                              value={opt.label}
                              onChange={(e) => handleOptionChangeEdit(index, e.target.value)}
                              placeholder="Label"
                              InputProps={{
                                style: { fontSize: 16 },
                              }}
                            />
                            <IconButton onClick={() => handleRemoveOptionEdit(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        ))}{' '}
                        {fieldEdits.type === 'select' && (
                          <Button onClick={handleAddOptionEdit} size="small">
                            Add Option
                          </Button>
                        )}
                      </TableCell>

                      <TableCell>
                        <IconButton onClick={() => saveEdit(idx)}>
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={cancelEdit}>
                          <CancelIcon />
                        </IconButton>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{field.key}</TableCell>
                      <TableCell>{field.type}</TableCell>
                      <TableCell>{field.label}</TableCell>
                      <TableCell>{field.placeholder}</TableCell>
                      <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        {field.options && field.options.length > 0
                          ? field.options
                              .filter((opt) => opt.label !== 'nan' && opt.value !== 'nan')
                              .map((opt) => opt.label)
                              .join(', ')
                          : 'No options'}
                      </TableCell>

                      <TableCell>
                        <IconButton onClick={() => startEdit(idx, field)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(idx)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
              {showAddField && (
                <TableRow>
                  <TableCell>
                    <Autocomplete
                      disableClearable
                      disablePortal
                      size="small"
                      sx={{ width: '100px' }}
                      options={metaProductTypes}
                      value={newField.key}
                      onChange={(event, newValue) => {
                        setNewField(prev => ({ ...prev, key: newValue }));
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Key" variant="outlined" />
                      )}
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      select
                      SelectProps={{
                        native: true,
                        style: {
                          height: '40px',
                          width: '116px ',
                          padding: '10px 14px',
                          fontSize: '16px',
                          lineHeight: '1.5',
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: '#fff',
                        },
                      }}
                      fullWidth
                      variant="outlined"
                      value={newField.type}
                      size="small"
                      onChange={(e) => setNewField((prev) => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="text">Text</option>
                      <option value="select">Select</option>
                      <option value="date">Date</option>
                      <option value="number">Number</option>
                      <option value="passenger">Passenger</option>
                    </TextField>
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Label"
                      value={newField.label}
                      onChange={(e) => setNewField((prev) => ({ ...prev, label: e.target.value }))}
                      InputProps={{
                        style: { fontSize: 16 },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Placeholder"
                      value={newField.placeholder}
                      onChange={(e) =>
                        setNewField((prev) => ({ ...prev, placeholder: e.target.value }))
                      }
                      InputProps={{
                        style: { fontSize: 16, width: '100px' },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      size="small"
                      checked={newField.required}
                      onChange={(e) =>
                        setNewField((prev) => ({ ...prev, required: e.target.checked }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {newField.options.map((option, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          margin: '5px 0',
                          width: '120px',
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          value={option.label}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder="Label"
                          InputProps={{
                            style: { fontSize: 16 },
                          }}
                        />
                        <IconButton onClick={() => handleRemoveOption(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    ))}
                    {newField.type === 'select' && (
                      <Button onClick={handleAddOption} size="small">
                        Add Option
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button onClick={saveNewField} color="primary">
                      Save
                    </Button>
                    <Button onClick={cancelNewField} color="secondary">
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between">
            <Button onClick={addNewField} variant="contained" color="primary" sx={{ mt: 2 }}>
              Add New Field
            </Button>
            <Button
              color="primary"
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => setShowBulkDeleteDialog(true)}
            >
              Bulk Delete
            </Button>
            <Dialog open={showBulkDeleteDialog} onClose={() => setShowBulkDeleteDialog(false)}>
              <DialogTitle>Delete Categories</DialogTitle>
              <DialogContent>
                {productTypes.map((type) => (
                  <div key={type.entityName}>
                    <Checkbox
                      checked={selectedCategoriesForDeletion.includes(type.entityName)}
                      onChange={() => {
                        const newSelections = selectedCategoriesForDeletion.includes(
                          type.entityName,
                        )
                          ? selectedCategoriesForDeletion.filter((name) => name !== type.entityName)
                          : [...selectedCategoriesForDeletion, type.entityName];
                        setSelectedCategoriesForDeletion(newSelections);
                      }}
                    />
                    {type.entityName}
                  </div>
                ))}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowBulkDeleteDialog(false)}>Cancel</Button>
                <Button onClick={handleBulkDelete} color="primary">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </Paper>
      )}

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Confirm Deletion'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this field?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={deleteField} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewProductTypes;
