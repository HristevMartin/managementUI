'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  IconButton,
  Autocomplete,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


const CustomTable = ({
  data,
  handleFieldChange,
  handleValidationChange,
  handleTypeChange,
  removeField,
  typeOptions,
  validationRules,
  mode,
}: {
  data: any;
  handleFieldChange: any;
  handleValidationChange: any;
  handleTypeChange: any;
  removeField: any;
  typeOptions: any;
  validationRules: any;
  mode: any;
}) => {

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Key</TableCell>
          <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Data Type</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>Min</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>Max</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>Unique</TableCell>
          <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Required</TableCell>
          <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Locale</TableCell>
          {mode === 'fields' && <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>}
        </TableRow>
      </TableHead>

      <TableBody>
        {data.map((field: any, index: number) => (
          <TableRow key={index}>
            <TableCell>
              {mode === 'fields' ? (
                <TextField
                  fullWidth
                  value={field.key}
                  size="small"
                  onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                  margin="normal"
                  style={{ width: '100px' }}
                />
              ) : (
                <span>{field.key}</span>
              )}
            </TableCell>
            <TableCell>
              {mode === 'fields' ? (
                <Autocomplete
                  value={field.type}
                  sx={{
                    marginTop: '8px',
                    width: '128px',
                  }}
                  onChange={(event, newValue) => handleTypeChange(index, newValue)}
                  options={typeOptions}
                  size="small"
                  disableClearable
                  renderInput={(params) => <TextField {...params} />}
                />
              ) : (
                <span>{field.type}</span>
              )}
            </TableCell>
            <TableCell>
              {mode === 'fields' &&
                validationRules[field.type] &&
                validationRules[field.type].includes('min') ? (
                <TextField
                  type="number"
                  size="small"
                  style={{ width: '70px' }}
                  value={field.validations.min || ''}
                  onChange={(e) => handleValidationChange(index, 'min', e.target.value)}
                  fullWidth
                  margin="normal"
                />
              ) : (
                <span>{field.validations?.min}</span>
              )}
            </TableCell>
            <TableCell>
              {mode === 'fields' &&
                validationRules[field.type] &&
                validationRules[field.type].includes('max') ? (
                <TextField
                  type="number"
                  size="small"
                  style={{ width: '70px' }}
                  value={field.validations.max || ''}
                  onChange={(e) => handleValidationChange(index, 'max', e.target.value)}
                  fullWidth
                  margin="normal"
                />
              ) : (
                <span>{field.validations?.max}</span>
              )}
            </TableCell>
            <TableCell>
              {mode === 'fields' &&
                validationRules[field.type] &&
                validationRules[field.type].includes('unique') ? (
                <Checkbox
                  checked={field.validations.unique}
                  onChange={(e) => handleValidationChange(index, 'unique', e.target.checked)}
                />
              ) : (
                <Checkbox checked={field.validations?.unique} disabled />
              )}
            </TableCell>
            <TableCell>
              {mode === 'fields' ? (
                <Checkbox
                  checked={field.required}
                  onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                />
              ) : (
                <Checkbox checked={field.required} disabled />
              )}
            </TableCell>
            <TableCell>
              {mode === 'fields' ? (
                <Checkbox
                  checked={field.locale}
                  onChange={(e) => handleFieldChange(index, 'locale', e.target.checked)}
                />
              ) : (
                <Checkbox checked={field.locale} disabled />
              )}
            </TableCell>
            {mode === 'fields' && (
              <TableCell>
                <IconButton onClick={() => removeField(index)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CustomTable;
