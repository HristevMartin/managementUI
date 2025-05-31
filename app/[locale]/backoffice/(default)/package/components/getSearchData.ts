"use server";
const apiUrlSpring = process.env.NEXT_PUBLIC_SPRING_API_URL_SPRING;

function simulateApiResponse() {
  // Simulated API response data
  const apiResponse = {
    flights: [
      {
        productCode: "FL123",
        productId: "1",
        cabin: "Economy",
        name: "Flight A",
        departureDate: "2024-10-01",
        departureTime: "10:00",
        arrivalDate: "2024-10-01",
        arrivalTime: "13:00",
        duration: "3h",
        origin: "London",
        destination: "Paris",
        carrier: "Airways X",
        carrierLogo: "https://example.com/logo-airwaysx.png",
        totalPrice: 150,
        tax: 20,
      },
      {
        productCode: "FL123",
        productId: "1",
        cabin: "Economy",
        name: "Flight A",
        departureDate: "2024-10-01",
        departureTime: "10:00",
        arrivalDate: "2024-10-01",
        arrivalTime: "13:00",
        duration: "3h",
        origin: "London",
        destination: "Paris",
        carrier: "Airways X",
        carrierLogo: "https://example.com/logo-airwaysx.png",
        totalPrice: 150,
        tax: 20,
      },
      {
        productCode: "FL123",
        productId: "1",
        cabin: "Business",
        name: "Flight A",
        departureDate: "2024-10-01",
        departureTime: "10:00",
        arrivalDate: "2024-10-01",
        arrivalTime: "13:00",
        duration: "3h",
        origin: "London",
        destination: "Paris",
        carrier: "Airways X",
        carrierLogo: "https://example.com/logo-airwaysx.png",
        totalPrice: 150,
        tax: 20,
      },
      {
        productCode: "FL456",
        cabin: "Business",
        name: "Flight B",
        departureDate: "2024-10-01",
        departureTime: "15:00",
        arrivalDate: "2024-10-01",
        arrivalTime: "18:00",
        duration: "3h",
        origin: "London",
        destination: "Paris",
        carrier: "Airways Y",
        carrierLogo: "https://example.com/logo-airwaysy.png",
        totalPrice: 130,
        tax: 18,
      },
      {
        productCode: "FL456",
        cabin: "Business",
        name: "Flight B",
        departureDate: "2024-10-01",
        departureTime: "15:00",
        arrivalDate: "2024-10-01",
        arrivalTime: "18:00",
        duration: "3h",
        origin: "Paris",
        destination: "London",
        carrier: "Airways Y",
        carrierLogo: "https://example.com/logo-airwaysy.png",
        totalPrice: 130,
        tax: 18,
      },
    ],
  };

  console.log("Simulated API Response:", JSON.stringify(apiResponse, null, 2));
  return apiResponse;
}

async function fetchFlightData(payload) {
  const SPRING_URL_SEARCH =
    process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING_SEARCH;
  console.log("urllll", SPRING_URL_SEARCH);

  console.log("the payload is the following has", payload);

  const response = await fetch(`${SPRING_URL_SEARCH}/api/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: (payload),
  });

  console.log("the response is", response);

  if (response.ok) {
    const data = await response.json();
    console.log("the data is", data);
    const responsePayload = { flights: data };
    console.log("modifiedResponse", responsePayload.flights.content[0].results);
    let modifiedResponsePayload = responsePayload.flights.content[0].results;
    console.log('modifiedResponsePayload', modifiedResponsePayload);
    return modifiedResponsePayload;
  }

  return null;
}

export async function getSearchData(payload) {
  console.log("show me the payload", payload);

  payload.queryParameters.departure_date =
    payload.queryParameters.departureDate;
  delete payload.queryParameters.departureDate;
  console.log("the new payload is", payload);

  // Convert the payload to a properly formatted JSON string
  let formattedPayload = JSON.stringify(payload, null, 2);

  // Log the new payload in the required format
  console.log("the new isss", formattedPayload);

  let flightData = await fetchFlightData(formattedPayload);

  if (Array.isArray(flightData) && flightData.length > 0) {
    flightData = flightData.slice(0, 5);
  } else {
    console.error("Invalid or empty array received:", flightData);
    flightData = [];
  }

  let modifiedFlightData = {
    flights: flightData,
  };

  console.log("the modified flight data is", modifiedFlightData);

  return modifiedFlightData;
}
