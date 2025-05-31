import { Button, IconButton, TextField, CardContent, Card } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

import { useState } from "react";

const Accordion = ({
    title,
    configKey,
    apiConfig,
    handleAPIConfigChange,
}: {
    title: string,
    configKey: string,
    apiConfig: any,
    handleAPIConfigChange: any,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [payloadError, setPayloadError] = useState('');
    const [parserError, setParserError] = useState('');

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    const debounce = (func: any, wait: number) => {
        let timeout: any;
        return function executedFunction(...args: any[]) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const handleJsonChange = debounce((configKey: string, field: string, value: string, setError: any) => {
        try {
            const parsedJson = JSON.parse(value);
            handleAPIConfigChange(configKey, field, parsedJson);
            setError('');
        } catch (error) {
            if (value.trim() !== '') {
                setError('Invalid JSON format');
            }
        }
    }, 300);


    return (
        <div className="accordion-container">
            <button className="accordion" onClick={toggleAccordion}>{title}</button>
            
            {isOpen && (
                <div className="w-full">

                    <label htmlFor={`${configKey}-url`}>URL:</label>
                    <input
                        style={{ width: '100%' }}
                        type="text"
                        id={`${configKey}-url`}
                        value={apiConfig.externalUrl || ''}
                        onChange={(e) => handleAPIConfigChange(configKey, 'externalUrl', e.target.value)}
                    />

                    {/* http method starts here */}
                    <label htmlFor={`${configKey}-httpMethod`}>HTTP Method:</label>
                    <select
                        style={{ width: '100%' }}
                        id={`${configKey}-httpMethod`}
                        value={apiConfig.httpMethod || ''}
                        onChange={(e) => handleAPIConfigChange(configKey, 'httpMethod', e.target.value)}
                    >
                        <option value="">Select HTTP Method</option>
                        <option value="POST">POST</option>
                        <option value="GET">GET</option>
                        <option value="PUT">PUT</option>
                    </select>
                    {/* http methods ends here */}

                    {/* header starts here */}
                    <div>
                        {apiConfig.headers.map((header: { key: string, value: string }, index: number) => (
                            <div style={{ textAlign: 'center' }} key={index} className="flex gap-4 mb-3">
                                <TextField
                                    variant="standard"
                                    label="Header Key"
                                    value={header.key}
                                    onChange={(e) => {
                                        const updatedHeaders = [...apiConfig.headers];
                                        updatedHeaders[index] = { ...updatedHeaders[index], key: e.target.value };
                                        handleAPIConfigChange(configKey, 'headers', updatedHeaders);
                                    }}
                                />

                                <TextField
                                    variant="standard"
                                    label="Header Value"
                                    value={header.value}
                                    onChange={(e) => {
                                        const updatedHeaders = [...apiConfig.headers];
                                        updatedHeaders[index] = { ...updatedHeaders[index], value: e.target.value };
                                        handleAPIConfigChange(configKey, 'headers', updatedHeaders);
                                    }}
                                />

                                <IconButton
                                    style={{ height: '80%', marginTop: '16px' }}
                                    onClick={() => {
                                        const filteredHeaders = apiConfig.headers.filter((_: any, idx: number) => idx !== index);
                                        handleAPIConfigChange(configKey, 'headers', filteredHeaders);
                                    }}>

                                    <DeleteIcon />

                                </IconButton>
                            </div>
                        ))}
                        <Button style={{ marginBottom: '4px' }} onClick={() => {
                            // Add a new header by appending a default header object
                            const newHeaders = [...apiConfig.headers, { key: '', value: '' }];
                            handleAPIConfigChange(configKey, 'headers', newHeaders);
                        }}>Add Header</Button>
                    </div>
                    {/* header ends here */}


                    {/* payload starts here */}
                    <label>Payload</label>
                    <textarea
                        defaultValue={apiConfig.payload ? JSON.stringify(apiConfig.payload, null, 2) : ''}
                        onChange={(e) => handleJsonChange(configKey, 'payload', e.target.value, setPayloadError)}
                        style={{ width: '100%', height: '100px' }}
                        placeholder="Enter payload details in JSON format"
                    />
                    {payloadError && <div style={{ color: 'red' }}>{payloadError}</div>}
                    {/* payload ends here */}

                    {/* response parser starts */}
                    <div className='parser-container'>
                        <label>Response Parser</label>
                        {apiConfig.responseParser.map((parser: any, index: number) => (
                            <div key={index} className='parser-input-group flex gap-3'>
                                <TextField
                                    variant="standard"
                                    label="Parser Key"
                                    value={parser.key}
                                    onChange={(e) => {
                                        const updatedParser = [...apiConfig.responseParser];
                                        updatedParser[index] = { ...updatedParser[index], key: e.target.value };
                                        handleAPIConfigChange(configKey, 'responseParser', updatedParser);
                                    }}
                                />
                                <TextField
                                    variant="standard"
                                    label="Parser Value"
                                    value={parser.value}
                                    onChange={(e) => {
                                        const updatedParser = [...apiConfig.responseParser];
                                        updatedParser[index] = { ...updatedParser[index], value: e.target.value };
                                        handleAPIConfigChange(configKey, 'responseParser', updatedParser);
                                    }}
                                />
                                <IconButton className="h-[46px]" sx={{ marginTop: '16px', marginBottom: '14  px' }} onClick={() => {
                                    const filteredParser = apiConfig.responseParser.filter((_: any, idx: number) => idx !== index);
                                    handleAPIConfigChange(configKey, 'responseParser', filteredParser);
                                }}>
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                        ))}
                        <Button onClick={() => {
                            const newParser = [...apiConfig.responseParser, { key: '', value: '' }];
                            handleAPIConfigChange(configKey, 'responseParser', newParser);
                        }}>Add Parser</Button>
                    </div>
                    {/* response parser ends */}

                    <br />
                    {/* response payload starts */}
                    <label>Response payload:</label>
                    <textarea
                        defaultValue={apiConfig.responsePayload ? JSON.stringify(apiConfig.responsePayload, null, 2) : ''}
                        onChange={(e) => handleJsonChange(configKey, 'responsePayload', e.target.value, setParserError)}
                        style={{ width: '100%', height: '100px' }}
                        placeholder="Enter payload details in JSON format"
                    />
                    {parserError && <div style={{ color: 'red' }}>{parserError}</div>}
                    {/* response payload ends */}

                </div>
            )
            }
        </div >
    );
};

export default Accordion;