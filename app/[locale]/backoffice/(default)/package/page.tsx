"use client";

import { useEffect, useState } from "react";
import { categorydata } from "./components/category";
import { searchconfig } from "./components/search-config";
import { pluraldata } from "./components/data";
import { roomdata } from "./components/rooms";
import { getSearchData } from "./components/getSearchData";
import { useAuthJHipster } from "@/context/JHipsterContext";
import './page.css'
import { set } from "react-datepicker/dist/date_utils";
import { useModal } from "@/context/useModal";

const Package = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAncillary, setSelectedAncillary] = useState(null);
  const [ancillary, setAncillary] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submittedData, setSubmittedData] = useState(false);
  const [view, setView] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [searchConfigData, setSearchConfigData] = useState([]);
  const [filteredCategoryData, setFilteredCategoryData] = useState([]);
  const [productType, setProductType] = useState([]);
  const [roomData, setroomData] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState([]);
  const [selectedHotelRooms, setSelectedHotelRooms] = useState([]);
  let [outboundFlights, setOutboundFlights] = useState({ flights: [] });
  const [inboundFlights, setInboundFlights] = useState({ flights: [] });
  const [selectedRoom, setSelectedRoom] = useState(null);
  let [searchCriteria, setSearchCriteria] = useState({});
  const [inboundOutbound, setInboundOutbound] = useState("");
  const [finalinbondproducts, setFinalInbondproducts] = useState({});
  const [selectedOutboundCard, setSelectedOutboundCard] = useState(false);
  const [loadingOutbound, setLoadingOutbound] = useState(false);
  const [loadingInbound, setLoadingInbound] = useState(false);
  const [inboundFlightSelected, setInboundFlightSelected] = useState(false);
  const [formData, setFormData] = useState({
    packageName: "",
    tags: "",
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
  const [airports, setAirports] = useState([]);
  const [outboundSelectedFlight, setOutboundSelectedFlights] = useState(true);
  const { jHipsterAuthToken } = useAuthJHipster();
  const [totalPrice, setTotalPrice] = useState(0);

  const { showModal } = useModal();


  useEffect(() => {
    if (submittedData) {
      console.log('being called here')
      setTotalPrice(0);
    } else {
      setTotalPrice(calculateTotalPrice());
    }

  }, [outboundFlights, inboundFlights, selectedRoom, selectedAncillary, submittedData]);

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
    const fetchAirports = async () => {
      const requestResponse = await fetch(`${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING}/api/airports`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jHipsterAuthToken}`,
          }
        }
      );
      if (!requestResponse.ok) {
        console.error("Error fetching airports:", requestResponse.statusText);
        return;
      }

      const airportsData = await requestResponse.json();

      setAirports(airportsData);

      if (airportsData.length > 0) {
        setFormData({
          ...formData,
          origin: airportsData?.[0].iataCode,
          destination: airportsData?.[1].iataCode ? airportsData?.[1].iataCode : airportsData?.[0].iataCode,
        })
      }
    }

    if (jHipsterAuthToken) {
      fetchAirports();
    }

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
      // setLoading(true);

      if (!jHipsterAuthToken) return;

      try {
        const response = await pluraldata(selectedCategory, jHipsterAuthToken);
        if (selectedCategory === "Hotel") {
          console.log('show me the selectedCategory', selectedCategory, response);
          setProductType(response);
        } else if (selectedCategory === "Ancillary") {
          setAncillary(response);
        }

        console.log("Response from pluraldata!!:", response);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching category data:", err);
      } finally {
        // setLoading(false);
      }
    };

    fetchPluralData();
  }, [selectedCategory, jHipsterAuthToken]);


  useEffect(() => {
    if (selectedCategory === "Hotel") {
      console.log('in here being called..')
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
          console.log('this one triggered')

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
    const selectedCategory = event.target.value;
    setSelectedCategory(selectedCategory);

    const selectedValues = [selectedCategory];
    setSelectedCategories(selectedValues);

    if (selectedCategory === "Schedule" && view === "EXTERNAL") {
      setInboundFlights({ flights: [] });
      setOutboundFlights({ flights: [] });
      handleInboundOutboundChange('outbound');
      setSelectedOutboundCard(false);
      setInboundFlightSelected(false);
      console.log('test')

      if (formData.startDate == "" || formData.endDate == "") {
        showModal("error", "Please select a start and end date");
        return;
      }
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    console.log('show me the updatedFormData', updatedFormData);
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


  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const categoryProducts = [];

    categoryProducts.push({
      category: "Flight",
      type: "External",
      details: [
        {
          outbound: outboundFlights.flights?.[0],
        },
        {
          inbound: inboundFlights.flights?.[0],
        }
      ],
    });

    console.log('in here the categoryProducts', categoryProducts);

    categoryProducts.push({
      category: "Hotel",
      type: "Internal",
      details: [{
        hotelId: selectedProduct?.id || "",
        roomId: selectedRoom?.id || "",
      }],
    });

    categoryProducts.push({
      category: "Addons",
      type: "Internal",
      details: [{
        id: selectedAncillary?.id || "",
      }],
    });


    // Add totalPrice to the form data
    const updatedFormData = {
      ...formData,
      categoryProducts,
      active: "true",
      price: totalPrice.toFixed(2),
    };

    console.log(
      "Form data with initialPrice and categoryProducts:",
      updatedFormData
    );

    console.log('show me the updatedFormData', updatedFormData);

    // uncomment this
    const resp = await fetch(`${process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING_SEARCH}/packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFormData),
    });

    if (!resp.ok) {
      showModal("error", 'Please try again later');
      console.error('Error:', resp.statusText);
      return;
    }

    showModal("success", "Package created successfully");
    // clear the form data
    setFormData({
      packageName: "",
      tags: "",
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

    setSelectedCategory(null);
    setSubmittedData(true);
    setView("");
    setFilteredCategoryData([]);
  };


  useEffect(() => {
    console.log('in here but not goooo', selectedCategory, view);
    if (selectedCategory === "Schedule" && view === "EXTERNAL") {
      handleInboundOutboundChange('outbound');
    }
  }, [selectedCategory, view]);


  // Handle view change (external or internal)
  const handleChangeView = (e: any) => {
    const selectedView = e.target.value;

    setView(selectedView);

    const filteredEntities = searchConfigData
      .filter((item) => item.entitysearchtype === selectedView)
      .map((item) => item.entityname);

    const filteredCategories = categoryData.filter((category) =>
      filteredEntities.includes(category.name)
    );

    console.log("Filtered Categories:", filteredCategories);

    setFilteredCategoryData(filteredCategories);

    if (!selectedOutboundCard) {
      setOutboundFlights({ flights: [] });
      setInboundFlights({ flights: [] });
    }
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
    const selectedOption = productType.find(
      (item) => item.id === e.target.value
    );
    const id = selectedOption.id;

    setSelectedProduct(selectedOption);
    setSelectedHotelId(id);
  };

  // Handle room selection
  const handleRoomSelect = (e) => {
    const selectedRoomId = e.target.value;
    const roomDetails = selectedHotelRooms.find(
      (room) => room.id === selectedRoomId
    );
    setSelectedRoom(roomDetails);
    setSelectedHotelRooms([]);
  };

  const uniqueEntitySearchTypes = [
    ...new Set(searchConfigData.map((item) => item.entitysearchtype)),
  ];


  const handleInboundOutboundChange = async (event: any) => {
    let selectedValue = '';

    if (typeof event === 'string') {
      selectedValue = event;
    } else {
      selectedValue = event.target.value;
    }

    // const selectedValue = event.target.value;
    console.log('show me the selectedValue', selectedValue);
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
          setOutboundFlights(outboundResponse);
        };


        // Call fetchOutboundFlights with the searchCriteria

        await fetchOutboundFlights(searchCriteria);
      } catch (error) {
        console.error("Error fetching outbound flights:", error);
      }
    } else if (selectedValue === "inbound") {
      // If the selected value is 'Inbound', apply the below logic
      console.log('it goes here', selectedValue);
      setLoadingInbound(true);
      try {
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
        await fetchInboundFlights(searchCriteria);
        setLoadingInbound(false);
      } catch (error) {
        setLoadingInbound(false);
        console.error("Error fetching inbound flights:", error);
      }
    }
  };

  // Function to calculate the total price
  const calculateTotalPrice = () => {
    let totalPrice = 0;

    // Add inbound flight price if available
    if (
      inboundFlights.flights.length > 0 &&
      inboundFlightSelected === true
    ) {
      let newInboundPrice = Number(inboundFlights.flights[0].price) || 0
      totalPrice += newInboundPrice;
    }

    // Add outbound flight price if available
    if (
      outboundFlights?.flights.length > 0
    ) {
      console.log('i was here222 outboundFlights.flights[0].price', outboundFlights.flights[0].price)
      totalPrice += Number(outboundFlights.flights[0].price) || 0;
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



  if (loading) {
    return <p style={{ fontSize: '24px', fontFamily: 'sans-serif' }} className="font-bold mt-10">Loading...</p>;
  }

  if (error) {
    return <p className="mt-10 text-lg">The Page is currently unavailable</p>;
  }


  function selectedCardOutbound(flightEvent: any, isOutbound: boolean) {
    let flightId = flightEvent.flight_id;
    let fareType = flightEvent.fare_type;
    let price = flightEvent.price;

    if (isOutbound) {
      setLoadingOutbound(true);
      const filteredOutboundFlights = outboundFlights.flights.filter((flight: any) => {
        if (flight?.flight_id === flightId && flight?.fare_type === fareType && flight?.price === price) {
          return flight;
        }
      })

      console.log('idnsandashd asfilteredOutboundFlights', filteredOutboundFlights);
      setOutboundFlights({ flights: filteredOutboundFlights });
      setSelectedOutboundCard(true);
      handleInboundOutboundChange('inbound');
      setLoadingOutbound(false);
    } else {
      const filteredInboundFlights = inboundFlights.flights.filter((flight: any) => {
        if (flight?.flight_id === flightId && flight?.fare_type === fareType && flight?.price === price) {
          return flight;
        }
      })
      setInboundFlights({ flights: filteredInboundFlights });
      setInboundFlightSelected(true);
    }
  }

  console.log('outboundFlights', outboundFlights);

  // temp solution for multiple outbound cards being rendered after we select a card
  if (outboundFlights?.flights?.length > 1 && selectedOutboundCard) {
    // Set the flights array to a new array containing only the first element
    outboundFlights.flights = [outboundFlights.flights[0]];
  }

  console.log('inboundFlights', inboundFlights);


  return (
    <div className="flex justify-center w-[98vw] mt-10">
      <div style={{ width: '40%' }} className="mb-10 max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-300 rounded-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Create Package</h1>

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

          {/*Tags  */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Tags
            </label>
            <select
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a tag</option>
              <option value="lastMinute">Last Minute Offer</option>
              <option value="vacationBeach">Vacation Beach</option>
              <option value="romanticHoliday">Couple Holiday</option>
            </select>
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

          <div></div>

          <div>
            <label
              htmlFor="origin"
              className="block text-lg font-medium mb-2">Origin:</label>
            <select
              id="origin"
              name="origin"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.origin}
              onChange={handleInputChange}
            >
              {
                airports.map((airport) => (
                  <option key={airport?.id} value={airport?.iataCode}>
                    {
                      airport?.name
                    }
                  </option>
                ))
              }
            </select>
          </div>

          {/* Destination */}
          <div>
            <label htmlFor="origin" className="block text-lg font-medium mb-2">Destination:</label>
            <select
              id="origin"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.destination}
              onChange={handleInputChange}
              name="destination"
            >
              {
                airports.map((airport) => (
                  <option
                    value={airport?.iataCode}
                    key={airport?.id}
                  >
                    {
                      airport?.name
                    }
                  </option>
                ))
              }
            </select>
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

          <div>
            {/* Dropdown for selecting type */}
            <label className="block text-lg font-medium mb-2">Type:</label>
            <select style={{ width: '100%', padding: '10px 14px', borderRadius: '6px' }}
              value={view}
              onChange={handleChangeView}
              className="border border-grey-500"
            >
              <option value="" disabled selected>
                Select Type
              </option>
              {uniqueEntitySearchTypes.map((type) => (
                <option className="font-bold" key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

          </div>

          {
            filteredCategoryData.length > 0 && (
              <div>
                <label className="block text-lg font-medium mb-2 mt-4">
                  Select Category:
                </label>

                <select
                  className="package-select border border-black-500 w-full rounded-md"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  multiple
                >
                  {filteredCategoryData.length > 0 ? (
                    filteredCategoryData.map((category: any) => (
                      <option style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '8px', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' }} key={category?.id} value={category?.name}>
                        {category?.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No categories available</option>
                  )}
                </select>

                {/* {loading && <p>Loading...</p>} */}
                {error && <p className="text-red-500">Error: {error}</p>}
              </div>
            )
          }
          <div>

          </div>
          {
            selectedCategory ? (
              <>
                <div>
                  <h6 className="text-lg font-semibold">Choose Category Products: </h6>

                  <div className="max-w-3xl">
                    {/* Inbound/Outbound Dropdown */}
                    {selectedCategory === "Schedule" && view === "EXTERNAL" && (
                      <div>
                        <select
                          id="inboundOutbound"
                          onClick={(e) => handleInboundOutboundChange('outbound')}
                          value={inboundOutbound && !selectedOutboundCard ? "Outbound" : "Outbound"}
                          disabled={true}
                          className="w-full p-3 mt-2 text-lg border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400"
                        >
                          <option className="font-bold" value="outbound">Outbound</option>
                        </select>
                      </div>
                    )}

                    {/* Display Outbound Flights if selectedValue is "outbound" */}
                    {outboundSelectedFlight &&
                      outboundFlights.flights &&
                      outboundFlights.flights.length > 0 &&
                      (
                        <div>
                          <h3 className="text-md font-semibold mt-3 mb-4">Outbound Flights</h3>
                          <ul className="space-y-6">
                            {outboundFlights.flights.map((flight, index) => (
                              <div>
                                <li
                                  key={index}
                                  className="bg-white p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg  border border-grey-500"
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
                                    <div className="text-l font-bold text-black-500">
                                      <strong>Price:</strong> ${flight.price}
                                    </div>
                                    <button type="button"
                                      style={{
                                        border: '1px solid black', borderRadius: '6px', padding: '6px 12px', fontWeight: 'bold', marginTop: '10px',
                                        ...(selectedOutboundCard ? { backgroundColor: 'grey' } : '')
                                      }}
                                      disabled={selectedOutboundCard ? true : false}
                                      onClick={() => selectedCardOutbound(flight, true)}
                                    >
                                      {
                                        selectedOutboundCard ? 'Selected' : 'Select'
                                      }
                                    </button>
                                  </div>
                                </li>
                              </div>
                            ))}
                          </ul>
                        </div>
                      )
                    }

                    {
                      selectedOutboundCard && (
                        <div className="mt-3">
                          <div className="max-w-3xl">
                            {/* Inbound/Outbound Dropdown */}
                            <div>
                              <select
                                id="inboundOutbound"
                                onClick={(e) => {
                                  console.log('clicked Here');
                                  handleInboundOutboundChange(e)
                                }}
                                disabled={true}
                                value={inboundOutbound}
                                className="w-full p-3 mt-2 text-lg border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400"
                              >
                                <option className="font-bold" value="inbound">Inbound</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    {
                      loadingInbound && (
                        <div className="font-bold ml-2 mt-2 text-md">
                          Loading...
                        </div>
                      )
                    }

                    {inboundOutbound === "inbound" &&
                      inboundFlights.flights &&
                      inboundFlights.flights.length > 0 &&
                      (
                        <div className="mt-3">
                          <h3 className="text-md font-semibold mb-4">Inbound Flights</h3>
                          <ul className="space-y-6">
                            {inboundFlights.flights.map((flight, index) => (
                              <li
                                key={index}
                                className="bg-white p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
                              >
                                <div className="space-y-3">
                                  <div className="text-lg font-medium text-gray-900">
                                    <strong>Carrier:</strong> {flight?.carrier}
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    <strong>Origin:</strong> {flight?.origin}
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    <strong>Destination:</strong> {flight?.destination}
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    <strong>Departure:</strong> {flight?.departure_time}
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    <strong>Arrival:</strong> {flight?.arrival_time}
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    <strong>Fare Type:</strong> {flight?.fare_type}
                                  </div>
                                  <div className="text-l font-bold text-black-500">
                                    <strong>Price:</strong> ${flight?.price}
                                  </div>
                                </div>
                                <button type="button" style={{
                                  border: '1px solid black', borderRadius: '6px', padding: '6px 12px', fontWeight: 'bold', marginTop: '10px',
                                  ...(inboundFlightSelected ? { backgroundColor: 'grey' } : '')
                                }}
                                  onClick={() => selectedCardOutbound(flight, false)}
                                >
                                  {
                                    inboundFlightSelected ? 'Selected' : 'Select'
                                  }
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    }
                    {/* setAncillary */}

                    {/* Hotel Dropdown */}
                    {selectedCategory === "Hotel" && view === "SEARCH_ENGINE" && (
                      <select
                        onChange={handleSelectChange}
                        defaultValue=""
                        className="w-full mt-3 p-3 text-lg border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="" disabled>
                          Select Hotel
                        </option>
                        {productType.map((item) => (
                          <option key={item.id} value={item.id}>
                            <div className="flex items-center">
                              {item?.name}
                            </div>
                          </option>
                        ))}
                      </select>
                    )}
                    {/* Display Hotel Details */}
                    {selectedProduct && (
                      <div className="mt-3 shadow-md p-3 bg-white rounded-md">
                        <h3 className="text-md font-semibold text-gray-800">
                          Selected Hotel Details:
                        </h3>
                        <h4 className="text-lg font-normal text-gray-700 mt-2">
                          {selectedProduct.name}
                        </h4>
                        <img
                          src={selectedProduct.images}
                          alt={selectedProduct.name}
                          className="h-auto rounded-lg mt-4"
                        />
                        <p className="mt-2 text-gray-600">
                          {selectedProduct.description}
                        </p>
                      </div>
                    )}
                    {/* Room Dropdown after selecting a hotel */}
                    {selectedHotelRooms.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Select Room
                        </h3>
                        <select
                          onChange={handleRoomSelect}
                          defaultValue=""
                          className="w-full p-2 mt-2 text-lg border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="" disabled>
                            Select a Room
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
                      <div className="mt-3 shadow-md p-3 bg-white rounded-md">
                        <h3 className="text-md font-semibold text-gray-800">
                          Selected Room Details:
                        </h3>
                        <h4 className="text-lg font-normal text-gray-700 mt-2">
                          {selectedRoom.name}
                        </h4>
                        <img
                          src={selectedRoom.images}
                          alt={selectedRoom.name}
                          style={{
                            objectFit: "cover",
                          }}
                          className="h-auto rounded-lg mt-4"
                        />
                        <p className="mt-2 text-gray-600">
                          <strong>Description:</strong> {selectedRoom.description}
                        </p>
                        <p className="mt-2 text-black-600">
                          <strong>Price:</strong> ${selectedRoom.price}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Ancillary Dropdown */}
                  {selectedCategory === "Ancillary" && view === "SEARCH_ENGINE" && (
                    <select
                      onChange={handleSelectChangeAncillary}
                      defaultValue=""
                      className="w-full p-3 mt-4 text-lg border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="" disabled>
                        Select Ancillary
                      </option>
                      {ancillary.map((item) => (
                        <option style={{ border: '3px solid red', marginTop: '50px' }} key={item.id} value={item.id}>
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
                    <div className="mt-3 shadow-md p-3 bg-white rounded-md">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Selected Ancillary Product:
                      </h3>
                      <h4 className="text-lg font-normal text-gray-700 mt-2">
                        {selectedAncillary?.name}
                      </h4>
                      <img
                        src={selectedAncillary?.images}
                        alt={selectedAncillary?.name}
                        style={{ objectFit: 'cover' }}
                        className="h-auto rounded-lg mt-4"
                      />
                      <p className="mt-2 text-gray-600">
                        {selectedAncillary?.description}
                      </p>
                      <span className="font-bold mt-3">Price:</span> ${selectedAncillary.price}
                    </div>
                  )}
                </div>
              </>
            ) :
              <div>

              </div>
          }

          <div>

          </div>

          {/* Total price */}
          <div className="max-w-4xl text-left p-2 bg-white shadow-sm rounded-sm">
            <div>
              <p>
                <strong>Total Price: ${totalPrice.toFixed(2)}</strong>
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="col-span-2 text-center">
            <button
              type="submit"
              style={{ width: '33%' }}
              className="py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};

export default Package;
