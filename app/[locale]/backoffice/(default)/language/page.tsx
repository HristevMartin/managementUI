// Adjust the path as needed
"use client";

import React, { useEffect, useState } from "react";
import { useAuthJHipster } from "@/context/JHipsterContext"; // Adjust the path as needed
import { fetchWithToken } from "@/services/fetchCurrencies";
interface Language {
  code: string;
  name: string;
}

const apiUrl = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;
const handleError = (message: string) => {
  alert(message); // Replace with a toast notification for better UX
};

const LanguageSettingsPage: React.FC = () => {
  const { jHipsterAuthToken } = useAuthJHipster();
  const [data, setData] = useState<any | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fetchLanguages = async () => {
    if (!apiUrl || !jHipsterAuthToken) {
      setErrorMessage("API URL or Auth Token is missing.");
      return;
    }

    try {
      const data = await fetchWithToken(`${apiUrl}/api/languages`, { method: "GET" }, jHipsterAuthToken,handleError);
      setLanguages(data.map((lang: Language) => ({ code: lang.code, name: lang.name })));
    } catch (error) {
      setErrorMessage("Failed to fetch languages.");
    }
  };

  const refreshLanguageSettings = async () => {
    if (!apiUrl || !jHipsterAuthToken) {
      setErrorMessage("API URL or Auth Token is missing.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchWithToken(`${apiUrl}/api/language/refresh`, { method: "GET" }, jHipsterAuthToken,handleError);
      setData(data);
      setSelectedLanguage(data.defaultShopperLanguage);
    } catch (error) {
      setErrorMessage("Failed to refresh language settings.");
    } finally {
      setLoading(false);
    }
  };

  const saveLanguage = async () => {
    if (!apiUrl || !jHipsterAuthToken || !data) {
      setErrorMessage("API URL, Auth Token, or data is missing.");
      return;
    }

    const payload = {
      id: data.id,
      name:selectedLanguage,
      code:selectedLanguage,
      defaultShopperLanguage: selectedLanguage,
      shopperLanguageSelectionMethod: data.shopperLanguageSelectionMethod,
      storeCountry: data.storeCountry,
    };
    console.log("kkk",payload)

    try {
      await fetchWithToken(`${apiUrl}/api/language/update`, { method: "PUT", body: JSON.stringify(payload) }, jHipsterAuthToken,handleError);
      setIsEditing(false);
      refreshLanguageSettings();
    } catch (error) {
      setErrorMessage("Failed to save language settings.");
    }
  };

  useEffect(() => {
    if (jHipsterAuthToken) {
      fetchLanguages();
    }
  }, [jHipsterAuthToken]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Language Settings</h1>
      <button onClick={refreshLanguageSettings} className="px-4 py-2 bg-blue-500 text-white rounded" disabled={loading}>
        {loading ? "Refreshing..." : "Refresh Language Settings"}
      </button>
      {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
      {data && (
        <table className="table-auto border-collapse border border-gray-300 mt-4 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Default Shopper Language</th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Shopper Language Selection Method</th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Store Country</th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {isEditing ? (
                <>
                  <td className="border border-gray-300 px-4 py-2">
                    <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="px-2 py-1 border border-gray-300 rounded">
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{data.shopperLanguageSelectionMethod}</td>
                  <td className="border border-gray-300 px-4 py-2">{data.storeCountry}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button onClick={saveLanguage} className="px-2 py-1 bg-green-500 text-white rounded mr-2">Save</button>
                    <button onClick={() => setIsEditing(false)} className="px-2 py-1 bg-gray-500 text-white rounded">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border border-gray-300 px-4 py-2">{data.defaultShopperLanguage}</td>
                  <td className="border border-gray-300 px-4 py-2">{data.shopperLanguageSelectionMethod}</td>
                  <td className="border border-gray-300 px-4 py-2">{data.storeCountry}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button onClick={() => setIsEditing(true)} className="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
                  </td>
                </>
              )}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LanguageSettingsPage;
