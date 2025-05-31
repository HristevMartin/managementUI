"use client";

import { useState, useEffect } from "react";
import { useAuthJHipster } from "@/context/JHipsterContext"; // Update with the correct path
import { fetchWithToken } from "@/services/fetchCurrencies";

interface Currency {
  id: string;
  currencyCode: string;
  currencySymbol: string;
  exchangeRate: string; // Change to string for easier handling
  // updatedAt: string | { $date: string } | Array<number>; // Handle backend formats
}

const apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;

export default function CurrenciesPage() {
  const { jHipsterAuthToken } = useAuthJHipster(); // Get the token from context
  const [currencies, setCurrencies] = useState<Currency[] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCurrency, setEditCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (jHipsterAuthToken) {
      fetchCurrencies();
    }
  }, [jHipsterAuthToken]); // Trigger when the token is available

  const handleError = (message: string) => {
    alert(message); // Replace with a toast notification for better UX
  };

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const data = await fetchWithToken(`${apiUrlSpring}/api/sync/currencies`, {
        method: "GET",
      }, jHipsterAuthToken, handleError);

      const mappedData = mapCurrencyData(data);
      setCurrencies(mappedData);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCurrencies = async () => {
    setLoading(true);
    try {
      await fetchWithToken(`${apiUrlSpring}/api/sync/currencies/refresh`, {
        method: "POST",
      }, jHipsterAuthToken, handleError);
      await fetchCurrencies();
    } catch (error) {
      console.error("Error refreshing currencies:", error);
    } finally {
      setLoading(false);
    }
  };


  const mapCurrencyData = (data: any[]): Currency[] => {
    return data.map((item) => ({
      id: item.id.toString(),
      bigId: item.bigId,
      currencyCode: item.currencyCode,
      currencySymbol: item.token || "",
      exchangeRate: item.currencyExchangeRate.toString(), // Ensure this is a string
      updatedAt: item.updated_at,
    }));
  };


  const handleEdit = (currency: Currency) => {
    setIsEditing(true);
    setEditCurrency(currency);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditCurrency(null);
  };



  const handleSave = async (bigItemId) => {

    if (editCurrency && parseFloat(editCurrency.exchangeRate) > 0) {
      try {
        const requestBody = {
          currency_exchange_rate: editCurrency.exchangeRate,
        };
        await fetchWithToken(
          `${apiUrlSpring}/api/sync/currencies/${bigItemId}`,
          {
            method: "PUT",
            body: JSON.stringify(requestBody),
          }, jHipsterAuthToken, handleError
        );
        await fetchCurrencies();
      } catch (error) {
        console.error("Error saving currency:", error);
      } finally {
        setIsEditing(false);
        setEditCurrency(null);
      }
    } else {
      handleError("Please enter a valid exchange rate.");
    }
  };

  // const formatDate = (date: string | { $date: string } | Array<number>) => {
  //   let dateString: string;
  //   if (typeof date === "string") {
  //     dateString = date;
  //   } else if (Array.isArray(date)) {
  //     const [year, month, day, hour, minute, second] = date;
  //     const constructedDate = new Date(
  //       Date.UTC(year, month - 1, day, hour, minute, second)
  //     );
  //     return constructedDate.toLocaleString("en-US", {
  //       year: "numeric",
  //       month: "short",
  //       day: "numeric",
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     });
  //   } else if (date && typeof date === "object" && "$date" in date) {
  //     dateString = date.$date;
  //   } else {
  //     return "Invalid date";
  //   }

  //   const parsedDate = new Date(dateString);
  //   return parsedDate.toLocaleString("en-US", {
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Currency Management</h1>
      {!currencies ? (
        <button
          onClick={handleRefreshCurrencies}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Currencies"}
        </button>
      ) : (
        <div >
          <button
            onClick={handleRefreshCurrencies}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Currencies"}
          </button>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Code</th>
                <th className="border border-gray-300 px-4 py-2">Symbol</th>
                <th className="border border-gray-300 px-4 py-2">Exchange Rate</th>
                {/* <th className="border border-gray-300 px-4 py-2">Updated At</th> */}
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currencies.map((currency) => (
                <tr key={currency.id}>
                  <td>
                    <span className="ml-2">
                      {currency.currencyCode}
                    </span>
                  </td>
                  <td style={{ borderLeft: '1px solid grey' }}>
                    <span className="ml-2">
                      {currency.currencySymbol}
                    </span>
                  </td>
                  <td>
                    {isEditing && editCurrency?.id === currency.id ? (
                      <input
                        type="number"
                        value={editCurrency.exchangeRate}
                        onChange={(e) =>
                          setEditCurrency({
                            ...editCurrency,
                            exchangeRate: e.target.value,
                          })
                        }
                        className="border border-gray-300 rounded p-1"
                      />
                    ) : (
                      <td style={{ borderLeft: '1px solid grey' }}>
                        <span className="ml-2">
                          {currency.exchangeRate}
                        </span>
                      </td>
                    )}
                  </td>

                  <td>
                    {isEditing && editCurrency?.id === currency.id ? (
                      <>
                        <button
                          onClick={() => handleSave(currency.bigId)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mx-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 mx-1"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <div style={{borderLeft: '1px solid grey'}}>
                        <button
                          onClick={() => handleEdit(currency)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ml-2"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
