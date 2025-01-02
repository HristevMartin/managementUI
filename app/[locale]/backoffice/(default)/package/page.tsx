// PACKAGE FOR SINGLE FLOW

"use client";
import { useEffect, useState } from "react";
import { categorydata } from "./components/category";
import { searchconfig } from "./components/search-config";
import { pluraldata } from "./components/data";
import { roomdata } from "./components/rooms";
import { getSearchData } from "./components/getSearchData";
import {
  getPluralForm,
  mapProductTypesToCustomFields,
} from "@/services/productFormService";
import { useAuthJHipster } from "@/context/JHipsterContext";

const Package = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAncillary, setSelectedAncillary] = useState(null);
  const [ancillary, setAncillary] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [view, setView] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [searchConfigData, setSearchConfigData] = useState([]);
  const [filteredCategoryData, setFilteredCategoryData] = useState([]);
  const [productType, setProductType] = useState([]);
  const [roomData, setroomData] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState([]);
  const [selectedHotelRooms, setSelectedHotelRooms] = useState([]);
  const [outboundFlights, setOutboundFlights] = useState({ flights: [] });
  const [inboundFlights, setInboundFlights] = useState({ flights: [] });
  const [selectedRoom, setSelectedRoom] = useState(null);
  let [searchCriteria, setSearchCriteria] = useState({});
  const [inboundOutbound, setInboundOutbound] = useState("");
  // const [finaloutbondproducts, setFinalOutbondproducts] = useState({});
  const [finalinbondproducts, setFinalInbondproducts] = useState({});
  const [formData, setFormData] = useState({
    packageName: "",
    description: "",
    origin: "LHR",
    destination: "CDG",
    startDate: "",
    endDate: "",
    currency: "",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const { jHipsterAuthToken } = useAuthJHipster();


  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!jHipsterAuthToken) return;

      try {
        const response = await categorydata(jHipsterAuthToken);
        setCategoryData(response);
        console.log("Response from category:", response);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching category data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [jHipsterAuthToken]);


  useEffect(() => {
    const fetchSearchConfigData = async () => {

      if (!jHipsterAuthToken) return;

      try {
        const response = await searchconfig(jHipsterAuthToken);
        setSearchConfigData(response);
        console.log("Response from searchconfig:", response);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching searchconfig data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchConfigData();

  }, [jHipsterAuthToken]);


  useEffect(() => {
    if (!selectedCategory) return;

    const fetchPluralData = async () => {
      setLoading(true);

      if (!jHipsterAuthToken) return;

      try {
        const response = await pluraldata(selectedCategory, jHipsterAuthToken);
        if (selectedCategory === "Hotel") {
          setProductType(response);
        } else if (selectedCategory === "Ancillary") {
          setAncillary(response);
        }

        console.log("Response from pluraldata!!:", response);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching category data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPluralData();
  }, [selectedCategory, jHipsterAuthToken]);


  useEffect(() => {
    if (selectedCategory === "Hotel") {

      if (!jHipsterAuthToken) return;

      const fetchRoomData = async () => {
        setLoading(true);
        try {
          const response = await roomdata(jHipsterAuthToken);
          setroomData(response);
          console.log("Response from roomdata:", response);

          // Filter rooms by matching hotel ID
          const roomsForSelectedHotel = response.filter(
            (room) => room.hotelName.id === selectedHotelId
          );

          // Log the rooms that match the selected hotel ID
          console.log("Rooms for selected hotel:", roomsForSelectedHotel);

          // Store the rooms in a new state, if needed
          setSelectedHotelRooms(roomsForSelectedHotel);
        } catch (err) {
          setError(err.message);
          console.error("Error fetching roomdata:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchRoomData();
    }
  }, [selectedCategory, selectedHotelId, jHipsterAuthToken]);


  // useEffect hook to handle changes in localStorage or initial load
  useEffect(() => {
    // Check if there is saved data in localStorage
    const searchCriteriaData = JSON.parse(
      localStorage.getItem("searchCriteriaFlight1") || "{}"
    );

    // If data is found, set it in the searchCriteria state
    if (searchCriteriaData && Object.keys(searchCriteriaData).length > 0) {
      console.log("show me the searchCriteria!!", searchCriteriaData);
      setSearchCriteria(searchCriteriaData);
    } else {
      setSearchCriteria({});
    }
  }, [formData]);

  let modifyFlightPayload = (searchPayload) => {
    console.log("searchPayload", searchPayload);

    let modifiedCriteria = {
      entityName: "Schedule",
      customerId: "1",
      queryParameters: {
        origin: searchPayload.origin,
        destination: searchPayload.destination,
        departureDate: searchPayload.startDate,
      },
    };

    return modifiedCriteria;
  };


  const handleCategoryChange = (event: any) => {
    const selectedCategory = event.target.value; 4

    console.log('show me the selectedCategory', selectedCategory);
    setSelectedCategory(selectedCategory);

    // const { options } = event.target;
    // console.log('show me the event.target', event.target);
    // const selectedValues = Array.from(options)
    //   .filter((option) => option.selected)
    //   .map((option) => option.value);

    const selectedValues = [selectedCategory];

    setSelectedCategories(selectedValues);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('show me the name', name);


    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    // Update the state
    setFormData(updatedFormData);

    // Store the updated formData in localStorage
    localStorage.setItem(
      "searchCriteriaFlight1",
      JSON.stringify(updatedFormData)
    );

    // Optionally log the updated data to the console
    console.log("Updated formData:", updatedFormData);
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log("Form submitted with data:", formData);
  //   console.log("Type:", view);
  //   console.log("Category Selection:", selectedCategory);
  //   if (selectedCategory == "Hotel") {
  //     console.log("hotelId", selectedCategory.id);
  //     console.log("RoomId", selectedHotelRooms.id);
  //   }
  //   const updatedFormData = {
  //     ...formData,
  //     initialPrice: totalPrice.toFixed(2) // Add totalPrice as initialPrice
  //   };

  //   console.log("Form data with initialPrice:", updatedFormData);

  //   // Store the updated form data
  //   setSubmittedData(updatedFormData);
  // };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Form submitted with data:", formData);
    console.log("Categories selected:", selectedCategories);

    const categoryProducts = [];

    // Directly adding "Flight" category data
    categoryProducts.push({
      category: "Flight",
      type: "External",
      details: {
        start_date: formData.startDate || "",
        end_date: formData.endDate || "",
        origin: formData.origin || "",
        destination: formData.destination || "",
        time: formData.createdAt || "",
      },
    });

    // Directly adding "Hotel" category data
    categoryProducts.push({
      category: "Hotel",
      type: "Internal",
      details: {
        hotelId: selectedProduct.id || "",
        roomId: selectedRoom.id || "",
      },
    });

    console.log("hotelId", selectedProduct.id);
    console.log("RoomId", selectedRoom.id);

    // Directly adding "Addons" category data
    categoryProducts.push({
      category: "Addons",
      type: "Internal",
      details: {
        id: selectedAncillary.id || "",
      },
    });

    // Add totalPrice to the form data
    const updatedFormData = {
      ...formData,
      initialPrice: totalPrice.toFixed(2),
      categoryProducts,
    };

    console.log(
      "Form data with initialPrice and categoryProducts:",
      updatedFormData
    );

    // Store the updated form data
    setSubmittedData(updatedFormData);
  };

  // Handle view change (external or internal)
  const handleChangeView = (e: any) => {
    const selectedView = e.target.value;
    console.log("Selected Type:", selectedView);
    setView(selectedView);

    console.log('show me the searchConfigData', searchConfigData);

    const filteredEntities = searchConfigData
      .filter((item) => item.entitysearchtype === selectedView)
      .map((item) => item.entityname);

    console.log("Filtered Entities:", filteredEntities);

    const filteredCategories = categoryData.filter((category) =>
      filteredEntities.includes(category.name)
    );

    console.log("Filtered Categories:", filteredCategories);

    setFilteredCategoryData(filteredCategories);
  };


  // Handle the change for the ancillary selection
  const handleSelectChangeAncillary = (e) => {
    const selectedValue = ancillary.find((item) => item.id === e.target.value);

    // Update the selected ancillary value
    setSelectedAncillary(selectedValue);

    // Optional: You could also perform other actions here
    console.log("Selected Ancillary ID: ", selectedValue);
  };


  const handleSelectChange = (e) => {
    console.log('show me the e.target.value', e.target.value);
    console.log('show me the productType', productType);

    const selectedOption = productType.find(
      (item) => item.id === e.target.value
    );
    const id = selectedOption.id;

    setSelectedProduct(selectedOption);
    setSelectedHotelId(id);
    console.log("Selected Option!!!:", selectedOption);
    console.log("hotel id!!!:", id);
  };

  // Handle room selection
  const handleRoomSelect = (e) => {
    const selectedRoomId = e.target.value;
    const roomDetails = selectedHotelRooms.find(
      (room) => room.id === selectedRoomId
    );
    setSelectedRoom(roomDetails);
    console.log("Selected Room Details:", roomDetails);
  };

  const uniqueEntitySearchTypes = [
    ...new Set(searchConfigData.map((item) => item.entitysearchtype)),
  ];


  const handleInboundOutboundChange = async (event: any) => {
    const selectedValue = event.target.value;
    setInboundOutbound(selectedValue);
    console.log("inbound-outbound data", selectedValue);

    if (selectedValue === "outbound") {
      // Call fetchOutboundFlights if the selected value is 'outbound'
      try {
        console.log("searchCriteria data", searchCriteria);

        // Define the fetchOutboundFlights function here
        const fetchOutboundFlights = async (searchCriteria: any) => {
          let modifiedPayload = modifyFlightPayload(searchCriteria);
          console.log("modifiedPayload outbound", modifiedPayload);

          let outboundResponse = await getSearchData(modifiedPayload);
          console.log("cccc", outboundResponse);
          setOutboundFlights(outboundResponse);
        };

        // Call fetchOutboundFlights with the searchCriteria
        await fetchOutboundFlights(searchCriteria);
      } catch (error) {
        console.error("Error fetching outbound flights:", error);
      }
    } else if (selectedValue === "inbound") {
      // If the selected value is 'Inbound', apply the below logic
      try {
        console.log("here ee inbound");

        // Define the fetchInboundFlights function here
        const fetchInboundFlights = async (searchCriteria) => {
          let modifiedPayload = modifyFlightPayload(searchCriteria);
          console.log("modifiedPayload intbound", modifiedPayload);

          // Swap origin and destination for inbound flights
          let temp = modifiedPayload.queryParameters.origin;
          modifiedPayload.queryParameters.origin = searchCriteria.destination;
          modifiedPayload.queryParameters.destination = temp;

          let inboundResponseData = await getSearchData(modifiedPayload);
          setFinalInbondproducts(inboundResponseData);
          console.log("inboundResponseData", inboundResponseData);
          setInboundFlights(inboundResponseData);
        };

        // Call fetchInboundFlights with the searchCriteria
        await fetchInboundFlights(searchCriteria);
      } catch (error) {
        console.error("Error fetching inbound flights:", error);
      }
    }
  };


  // Function to calculate the total price
  const calculateTotalPrice = () => {
    let totalPrice = 0;

    // Add inbound flight price if available
    if (
      selectedCategory === "Schedule" &&
      inboundOutbound === "inbound" &&
      inboundFlights.flights.length > 0
    ) {
      totalPrice += inboundFlights.flights[0].price || 0;
    }

    // Add outbound flight price if available
    if (
      selectedCategory === "Schedule" &&
      inboundOutbound === "outbound" &&
      outboundFlights.flights.length > 0
    ) {
      totalPrice += outboundFlights.flights[0].price || 0;
    }

    // Add room price if available
    if (selectedRoom) {
      totalPrice += selectedRoom.price || 0;
    }

    // Add ancillary price if available
    if (selectedAncillary) {
      totalPrice += selectedAncillary.price || 0;
    }

    // Ensure totalPrice is always a number
    return Number(totalPrice);
  };

  const totalPrice = calculateTotalPrice();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="flex justify-center w-[100vw] mt-10">
      <div style={{ width: '40%' }} className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Package</h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {/* Package Name */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Package Name:
            </label>
            <input
              type="text"
              name="packageName"
              value={formData.packageName}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-lg font-medium mb-2">Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>


          {/* Origin */}
          <div>
            <label className="block text-lg font-medium mb-2">Origin:</label>
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-lg font-medium mb-2">Destination:</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-lg font-medium mb-2">Start Date:</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-lg font-medium mb-2">End Date:</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-lg font-medium mb-2">Currency:</label>
            <input
              type="text"
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Active (Disabled) */}
          {/* <div>
            <label className="block text-lg font-medium mb-2">Active:</label>
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={() =>
                setFormData({ ...formData, active: !formData.active })
              }
              disabled
              className="h-5 w-5"
            />
          </div> */}
          <div>

          </div>

          <div>
            {/* Dropdown for selecting type */}
            <label className="block text-lg font-medium mb-2">Type:</label>
            <select value={view} onChange={handleChangeView}>
              <option value="" disabled selected>
                Select Type
              </option>
              {uniqueEntitySearchTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Dropdown for selecting category based on filtered entitynames */}

            <div>
              <label className="block text-lg font-medium mb-2 mt-4">
                Select Category:
              </label>
              <select

                className="border border-black-500 w-full p-3 rounded-md"
                value={selectedCategory}
                onChange={handleCategoryChange}
                multiple
              >
                {filteredCategoryData.length > 0 ? (
                  filteredCategoryData.map((category: any) => (
                    <option style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }} key={category?.id} value={category?.name}>
                      {category?.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No categories available</option>
                )}
              </select>

              {loading && <p>Loading...</p>}
              {error && <p className="text-red-500">Error: {error}</p>}
            </div>
          </div>

          {
            selectedCategory ? (
              <div>
                <div className="max-w-3xl p-2">
                  {/* Inbound/Outbound Dropdown */}
                  {selectedCategory === "Schedule" && view === "EXTERNAL" && (
                    <div className="mt-6">
                      <label
                        htmlFor="inboundOutbound"
                        className="block text-lg font-semibold"
                      >
                        Select Flight Type
                      </label>
                      <select
                        id="inboundOutbound"
                        onChange={handleInboundOutboundChange}
                        value={inboundOutbound} // Ensure the value is tied to the state
                        className="w-full p-3 mt-2 text-lg border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="" disabled>
                          Please Select Inbound/Outbound
                        </option>
                        <option value="inbound">Inbound</option>
                        <option value="outbound">Outbound</option>
                      </select>
                    </div>
                  )}

                  {/* Display Outbound Flights if selectedValue is "outbound" */}
                  {inboundOutbound === "outbound" &&
                    outboundFlights.flights &&
                    outboundFlights.flights.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-xl font-semibold">Outbound Flights</h3>
                        <ul className="space-y-6">
                          {outboundFlights.flights.map((flight, index) => (
                            <li
                              key={index}
                              className="bg-white p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
                            >
                              <div className="space-y-3">
                                <div className="text-lg font-medium text-gray-900">
                                  <strong>Carrier:</strong> {flight.carrier}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <strong>Origin:</strong> {flight.origin}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <strong>Destination:</strong> {flight.destination}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <strong>Departure:</strong> {flight.departure_time}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <strong>Arrival:</strong> {flight.arrival_time}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <strong>Fare Type:</strong> {flight.fare_type}
                                </div>
                                <div className="text-xl font-bold text-green-500">
                                  <strong>Price:</strong> ${flight.price}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}


                  {/* Display Inbound Flights if selectedValue is "Inbound" */}
                  {inboundOutbound === "inbound" &&
                    inboundFlights.flights &&
                    inboundFlights.flights.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-xl font-semibold">Inbound Flights</h3>
                        <ul className="space-y-6">
                          {inboundFlights.flights.map((flight, index) => (
                            <li
                              key={index}
                              className="bg-white p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
                            >
                              <div className="space-y-3">
                                <div className="text-lg font-medium text-gray-900">
                                  <strong>Carrier:</strong> {flight.carrier}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <strong>Origin:</strong> {flight.origin}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <strong>Destination:</strong> {flight.destination}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <strong>Departure:</strong> {flight.departure_time}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <strong>Arrival:</strong> {flight.arrival_time}
                                </div>
                                <div className="text-sm text-gray-700">
                                  <strong>Fare Type:</strong> {flight.fare_type}
                                </div>
                                <div className="text-xl font-bold text-green-500">
                                  <strong>Price:</strong> ${flight.price}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {/* setAncillary */}

                  {/* Ancillary Dropdown */}
                  {selectedCategory === "Ancillary" && view === "SEARCH_ENGINE" && (
                    <select
                      onChange={handleSelectChangeAncillary}
                      defaultValue=""
                      className="w-full p-3 text-lg border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="" disabled>
                        Please Select Ancillary
                      </option>
                      {ancillary.map((item) => (
                        <option key={item.id} value={item.id}>
                          <div className="flex items-center">
                            <img
                              src={item.images}
                              alt={item.name}
                              className="w-5 h-5 mr-3"
                            />
                            {item.name}
                          </div>
                        </option>
                      ))}
                    </select>
                  )}
                  {/* Display Ancillary Details */}
                  {selectedAncillary && (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Selected Ancillary Details:
                      </h3>
                      <h4 className="text-lg font-normal text-gray-700 mt-2">
                        {selectedAncillary?.name}
                      </h4>
                      <img
                        src={selectedAncillary?.images}
                        alt={selectedAncillary?.name}
                        className="w-48 h-auto rounded-lg mt-4"
                      />
                      <p className="mt-2 text-gray-600">
                        {selectedAncillary?.description}
                      </p>
                    </div>
                  )}
                  {/* Hotel Dropdown */}
                  {selectedCategory === "Hotel" && view === "SEARCH_ENGINE" && (
                    <select
                      onChange={handleSelectChange}
                      defaultValue=""
                      className="w-full p-3 mt-4 text-lg border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="" disabled>
                        Please Select Hotel
                      </option>
                      {productType.map((item) => (
                        <option key={item.id} value={item.id}>
                          <div className="flex items-center">
                            <img
                              src={item.images}
                              alt={item.name}
                              className="w-5 h-5 mr-3"
                            />
                            {item.name}
                          </div>
                        </option>
                      ))}
                    </select>
                  )}
                  {/* Display Hotel Details */}
                  {selectedProduct && (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Selected Hotel Details:
                      </h3>
                      <h4 className="text-lg font-normal text-gray-700 mt-2">
                        {selectedProduct.name}
                      </h4>
                      <img
                        src={selectedProduct.images}
                        alt={selectedProduct.name}
                        className="w-48 h-auto rounded-lg mt-4"
                      />
                      <p className="mt-2 text-gray-600">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}
                  {/* Room Dropdown after selecting a hotel */}
                  {selectedHotelRooms.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Select Room
                      </h3>
                      <select
                        onChange={handleRoomSelect}
                        defaultValue=""
                        className="w-full p-3 mt-4 text-lg border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="" disabled>
                          Please select a Room
                        </option>
                        {selectedHotelRooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name} - ${room.price}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {/* Display Room Details if selected */}
                  {selectedRoom && (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Selected Room Details:
                      </h3>
                      <h4 className="text-lg font-normal text-gray-700 mt-2">
                        {selectedRoom.name}
                      </h4>
                      <img
                        src={selectedRoom.images}
                        alt={selectedRoom.name}
                        className="w-48 h-auto rounded-lg mt-4"
                      />
                      <p className="mt-2 text-green-600">
                        <strong>Price:</strong> ${selectedRoom.price}
                      </p>
                      <p className="mt-2 text-gray-600">
                        <strong>Description:</strong> {selectedRoom.description}
                      </p>
                    </div>
                  )}

                  {inboundOutbound === "inbound" && (
                    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
                      {inboundFlights.flights.length > 0 && (
                        <div className="flight-price">
                          <p>
                            InboundInitialPrice 1 Price: $
                            {inboundFlights.flights[0].price}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {inboundOutbound === "outbound" && (
                    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
                      {outboundFlights.flights.length > 0 && (
                        <div className="flight-price">
                          {console.log('outboundFlights.flights[0]', outboundFlights.flights[0])}
                          <p>
                            OutboundInitialPrice 1 Price: $
                            {outboundFlights.flights[0].price}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedRoom && (
                    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
                      <div className="room-price">
                        <p>Room Initial Price: ${selectedRoom.price}</p>
                      </div>
                    </div>
                  )}

                  {selectedAncillary && (
                    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
                      <div className="room-price">
                        <p>Ancillary Initial Price: ${selectedAncillary.price}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) :
              <div>

              </div>
          }


          {/* Total price */}
          <div className="max-w-4xl text-left p-2 bg-white shadow-sm rounded-sm">
            <div>
              <p>
                <strong>Total Price: ${totalPrice.toFixed(2)}</strong>
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="col-span-2">
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Package;
