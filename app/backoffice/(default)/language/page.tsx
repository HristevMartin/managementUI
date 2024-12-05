"use client";

import React, { useEffect, useState } from "react";

// The page component
const LanguageSettingsPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null); // To store the parsed API response
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>(
    []
  ); // To store available languages
  const [selectedLanguage, setSelectedLanguage] = useState<string>(""); // To store the selected language code
  const [isEditing, setIsEditing] = useState<boolean>(false); // To toggle edit mode
  const [loading, setLoading] = useState<boolean>(false); // To manage loading state
  const [errorMessage, setErrorMessage] = useState<string>(""); // To handle errors

  // Fetch URL and Bearer token from environment variables
  const apiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;
  const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;

  // Function to handle refresh button click
  const refreshLanguageSettings = async () => {
    if (!apiUrl || !bearerToken) {
      setErrorMessage("API URL or Bearer Token is missing.");
      return;
    }
  
    setLoading(true);
    setErrorMessage("");
    setData(null);
  
    try {
      const response = await fetch(`${apiUrl}/api/language/refresh`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const jsonData = await response.json();
        console.log("Received Data:", jsonData);
  
        // Keep id in the data and update state
        setData(jsonData); // Store the entire jsonData instead of filtering out id
        setSelectedLanguage(jsonData.defaultShopperLanguage); // Set the initial selected language
      } else {
        setErrorMessage("Failed to refresh language settings.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred while refreshing language settings.");
    } finally {
      setLoading(false);
    }
  };  
  
  // useEffect(() => {
  //   if (data && data.id) {
  //     saveLanguage(); // Automatically trigger save when data has been updated
  //   }
  // }, [data]); // Trigger when data changes
  
  

  // Fetch available languages
  const fetchLanguages = async () => {
    if (!apiUrl || !bearerToken) {
      setErrorMessage("API URL or Bearer Token is missing.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/languages`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${bearerToken}`, // Include Bearer token
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const languages = await response.json();
        setLanguages(
          languages.map((lang: { code: string; name: string }) => ({
            code: lang.code,
            name: lang.name,
          }))
        );
      } else {
        setErrorMessage("Failed to fetch languages.");
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
      setErrorMessage("An error occurred while fetching languages.");
    }
  };

  // Save the updated language
  const saveLanguage = async () => {
    if (!apiUrl || !bearerToken) {
      setErrorMessage("API URL or Bearer Token is missing.");
      return;
    }
  
    // Log the data state to confirm its value before using it
    console.log("Data before saving:", data);
  
    // Ensure the payload has the required fields
    const payload = {
      id: data.id, // Use id from the data state
      defaultShopperLanguage: selectedLanguage, // Set the selected language
      shopperLanguageSelectionMethod: data.shopperLanguageSelectionMethod, // Existing method
      storeCountry: data.storeCountry, // Existing country
    };
  
    console.log("Request payload:", payload); // Log the payload for debugging
  
    try {
      const response = await fetch(`${apiUrl}/api/language/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        setIsEditing(false); // Exit edit mode
        refreshLanguageSettings(); // Refresh the settings after update
      } else {
        setErrorMessage("Failed to save language settings.");
      }
    } catch (error) {
      console.error("Error saving language:", error);
      setErrorMessage("An error occurred while saving the language setting.");
    }
  };
  
  
  
  useEffect(() => {
    fetchLanguages();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Language Settings</h1>
      <button
        onClick={refreshLanguageSettings}
        className="px-4 py-2 bg-blue-500 text-white rounded"
        disabled={loading}
      >
        {loading ? "Refreshing..." : "Refresh Language Settings"}
      </button>

      <div className="mt-4">
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        {data && (
          <table className="table-auto border-collapse border border-gray-300 mt-4 w-full">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2 bg-gray-100">
                  defaultShopperLanguage
                </th>
                <th className="border border-gray-300 px-4 py-2 bg-gray-100">
                  shopperLanguageSelectionMethod
                </th>
                <th className="border border-gray-300 px-4 py-2 bg-gray-100">
                  storeCountry
                </th>
                <th className="border border-gray-300 px-4 py-2 bg-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {isEditing ? (
                  <>
                    <td className="border border-gray-300 px-4 py-2">
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded"
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {data.shopperLanguageSelectionMethod}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {data.storeCountry}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={saveLanguage}
                        className="px-2 py-1 bg-green-500 text-white rounded mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-2 py-1 bg-gray-500 text-white rounded"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border border-gray-300 px-4 py-2">
                      {data.defaultShopperLanguage}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {data.shopperLanguageSelectionMethod}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {data.storeCountry}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-2 py-1 bg-blue-500 text-white rounded"
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LanguageSettingsPage;
