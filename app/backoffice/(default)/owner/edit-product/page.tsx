'use client'
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { data } from './components/data';
import { edit } from './components/edit';
import './page.css';

const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const convertToApiUrl = (productType) => {
  const pluralizationMap = {
    Experience: 'Experiences',
    Session: 'Sessions',
    Ticket: 'Tickets',
    Arena: 'Arenas',
    'Seating Area': 'Seating-Areas',
    Section: 'Sections',
    Seat: 'Seats',
    Hotel: 'Hotels',
    Room: 'Rooms',
    Ancillary: 'Ancillaries',
    'Ticket Selection': 'Ticket-Selections',
    Bundle: 'Bundles',
  };

  const pluralType = pluralizationMap[productType] || productType;
  return pluralType.toLowerCase().replace(/\s+/g, '-');
};

const EditProduct = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const selectedType = searchParams.get('selectedType');

  const [searchData, setSearchData] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitFlag, setSubmitFlag] = useState(false);
  const [showPopup, setShowPopup] = useState(false); 

  useEffect(() => {
    if (selectedType && id) {
      const apiUrl = convertToApiUrl(selectedType);
      const fetchData = async () => {
        try {
          const dataResponse = await data(apiUrl, id);
          setSearchData(dataResponse);
          console.log("fetched data", dataResponse);
          setFormData(dataResponse);
        } catch (err) {
          setError(err);
        }
      };

      fetchData();
    }
  }, [selectedType, id]);

  useEffect(() => {
    if (submitFlag && selectedType && id) {
      const apiUrl = convertToApiUrl(selectedType);
      const submitData = async () => {
        try {
          const response = await edit(apiUrl, id, formData);
          console.log("Edit submitted successfully", response);
          setSubmitFlag(false);
          setShowPopup(true); // Show the popup after successful submission
        } catch (err) {
          setError(err);
        }
      };

      submitData();
    }
  }, [submitFlag, selectedType, id, formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDropdownChange = (name, selectedItem) => {
    if (Array.isArray(selectedItem)) {
      // Handle array case: create an array of objects with id
      setFormData(prevData => ({
        ...prevData,
        [name]: selectedItem.map(item => ({ id: item.id })) // Store array of objects
      }));
    } else if (typeof selectedItem === 'object' && selectedItem !== null) {
      // Handle object case: store the object with id
      setFormData(prevData => ({
        ...prevData,
        [name]: { id: selectedItem.id } // Store as an object
      }));
    } else {
      // For other cases (like strings), store directly
      setFormData(prevData => ({
        ...prevData,
        [name]: selectedItem
      }));
    }
  };

  const handleSubmit = () => {
    console.log("Updated Data:", formData);
    setSubmitFlag(true);
  };

  const closePopup = () => {
    setShowPopup(false); // Close popup
  };

  return (
    <div className="container">
      <h1>Edit {selectedType}</h1>
      {error && <p className="error">Error fetching data: {error.message}</p>}
      {searchData ? (
        <>
          <div className="form">
            {Object.keys(formData).map((key) => {
              if (key === 'id') return null;

              return (
                <div key={key} className="formGroup">
                  <label className="label">
                    {capitalizeFirstLetter(key)}
                  </label>
                  {Array.isArray(searchData[key]) ? (
                    <select
                      name={key}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedItem = searchData[key].find(item => item.id === selectedId);
                        handleDropdownChange(key, [selectedItem]); // Pass as an array
                      }}
                      className="select pt-2 pb-2 border-2"
                    >
                      <option value="">Select {key}</option>
                      {searchData[key].map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    typeof searchData[key] === 'object' && searchData[key] !== null ? (
                      <select
                        name={key}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          handleDropdownChange(key, { id: searchData[key].id });
                        }}
                        className="select"
                      >
                        <option value="">Select {key}</option>
                        <option value={searchData[key].id}>
                          {searchData[key].name}
                        </option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={key}
                        value={formData[key] || ''}
                        onChange={handleChange}
                        className="input"
                      />
                    )
                  )}
                </div>
              );
            })}
          </div>
          <div className="buttonContainer">
            <button onClick={handleSubmit} className="button">Save Changes</button>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Successfully updated!</h2>
            <button onClick={closePopup} className="close-popup-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProduct;
