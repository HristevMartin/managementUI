"use client";

import React, { useState, useEffect } from 'react';
import './page.css';
import axios from 'axios';
import { useAuthJHipster } from "@/context/JHipsterContext";
import Accordion from './_components/accordion';

interface Configuration {
  externalUrl: string;
  httpMethod: string;
  headers: string[];
  payload: string;
  responsePayload: string;
  responseParser: string[];
}

interface ApiConfigurations {
  externalEntityBookMetaData: Configuration;
  externalEntityCancellationsMetaData: Configuration;
  externalEntityPaymentMetaData: Configuration;
  externalEntityRetrieveMetaData: Configuration;
  [key: string]: Configuration;
}


function createDefaultStateDate(overrides = {}) {
  return {
    externalUrl: '',
    httpMethod: 'POST',
    headers: [],
    payload: '',
    responsePayload: '',
    responseParser: [],
    ...overrides,
  }
}

const initialState = {
  externalEntityBookMetaData: createDefaultStateDate({ bookStatus: "hold" }),
  externalEntityCancellationsMetaData: createDefaultStateDate({ orderStatus: "booked" }),
  externalEntityPaymentMetaData: createDefaultStateDate({ paymentStatus: "pay" }),
  externalEntityRetrieveMetaData: createDefaultStateDate({ orderStatus: "booked" })
};

const AddProductCategoryPage = () => {
  const { jHipsterAuthToken } = useAuthJHipster();
  const [category, setCategory] = useState('');
  const [categoryNames, setCategoryNames] = useState([]);

  const [warningMessage, setWarningMessage] = useState('');
  const [apiConfigurations, setApiConfigurations] = useState<ApiConfigurations>(initialState);

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
      }
    };

    if (jHipsterAuthToken) {
      fetchCategoryNames();
    }
  }, [jHipsterAuthToken]);


  const handleAPIConfigChange = (configKey: string, subKey: string, value: string) => {
    setApiConfigurations(prevConfigurations => ({
      ...prevConfigurations,
      [configKey]: {
        ...prevConfigurations[configKey],
        [subKey]: value
      }
    }));
  };


  const createPayload = () => {
    return {
      entityName: category,
      externalEntityBookMetaData: apiConfigurations.externalEntityBookMetaData,
      externalEntityCancellationsMetaData: apiConfigurations.externalEntityCancellationsMetaData,
      externalEntityPaymentMetaData: apiConfigurations.externalEntityPaymentMetaData,
      externalEntityRetrieveMetaData: apiConfigurations.externalEntityRetrieveMetaData
    }
  };


  async function submitExteralData() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/jdl/create-entity-external-commerce-configuration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jHipsterAuthToken}`
      },
      body: JSON.stringify(createPayload())
    })

    if (!response.ok) {
      setWarningMessage('Error submitting data');
      console.log('Error submitting data', response);
      return null
    }

    if (response.status === 200) {
      setWarningMessage('Data submitted successfully');
      console.log('Data submitted successfully', response);
    }
  }


  const handleSubmitOrUpdate = async () => {
    setWarningMessage('');
    submitExteralData();
  };


  return (
    <main>
      <section className="search-config">
        <label id="category-label" htmlFor="category">Select Category:</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select a category</option>
          {categoryNames.map((name, index) => (
            <option key={`${name}-${index}`} value={name}>{name}</option>
          ))}
        </select>

        {category && (
          <>
            <div>
              <Accordion
                title="Book API Configuration"
                configKey="externalEntityBookMetaData"
                apiConfig={apiConfigurations.externalEntityBookMetaData}
                handleAPIConfigChange={handleAPIConfigChange}
              />
              <Accordion
                title="Cancellation API Configuration"
                configKey="externalEntityCancellationsMetaData"
                apiConfig={apiConfigurations.externalEntityCancellationsMetaData}
                handleAPIConfigChange={handleAPIConfigChange}
              />
              <Accordion
                title="Payment API Configuration"
                configKey="externalEntityPaymentMetaData"
                apiConfig={apiConfigurations.externalEntityPaymentMetaData}
                handleAPIConfigChange={handleAPIConfigChange}
              />
              <Accordion
                title="Retrieve API Configuration"
                configKey="externalEntityRetrieveMetaData"
                apiConfig={apiConfigurations.externalEntityRetrieveMetaData}
                handleAPIConfigChange={handleAPIConfigChange}
              />
            </div>
          </>
        )}

        <button type="button" id="submit-button" onClick={handleSubmitOrUpdate}>
          Submit
        </button>
      </section>
    </main>
  );

};

export default AddProductCategoryPage;