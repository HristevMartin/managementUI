"use client";

import { useState, useEffect } from "react";

interface Currency {
  id: string;
  currencyCode: string;
  currencySymbol: string;
  exchangeRate: string;  // Change to string
  updatedAt: string;
}
const apiUrlSpring = process.env.NEXT_PUBLIC_LOCAL_BASE_URL_SPRING;

const apiToken = process.env.NEXT_PUBLIC_API_TOKEN; 
export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCurrency, setEditCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrlSpring}/api/currencies/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Currency[] = await response.json();
      setCurrencies(data);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      alert("Failed to fetch currencies. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleRefreshCurrencies = async () => {
    setLoading(true);
    try {
      await fetch(`${apiUrlSpring}/api/currencies/refresh`, { method: "POST" });
      await fetchCurrencies();
    } catch (error) {
      console.error("Error refreshing currencies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (currency: Currency) => {
    setIsEditing(true);
    setEditCurrency(currency);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditCurrency(null);
  };

  const handleSave = async () => {
    if (editCurrency && parseFloat(editCurrency.exchangeRate) > 0) {
      try {
        await fetch(`${apiUrlSpring}/api/currencies/${editCurrency.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exchangeRate: editCurrency.exchangeRate }),
        });
        await fetchCurrencies();
      } catch (error) {
        console.error("Error saving currency:", error);
      } finally {
        setIsEditing(false);
        setEditCurrency(null);
      }
    } else {
      alert("Please enter a valid exchange rate.");
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
  };

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
        <div>
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
                <th className="border border-gray-300 px-4 py-2">Updated At</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currencies.map((currency) => (
                <tr key={currency.id}>
                  <td>{currency.currencyCode}</td>
                  <td>{currency.currencySymbol}</td>
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
                      />
                    ) : (
                      currency.exchangeRate
                    )}
                  </td>
                  <td>{formatDate(currency.updatedAt)}</td>
                  <td>
                    {isEditing && editCurrency?.id === currency.id ? (
                      <>
                        <button onClick={handleSave}>Save</button>
                        <button onClick={handleCancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => handleEdit(currency)}>Edit</button>
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

