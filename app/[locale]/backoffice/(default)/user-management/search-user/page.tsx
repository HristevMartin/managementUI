"use client";

import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { searchrole } from "./components/search";
import { useRouter } from "next/navigation";
import './page.css';
import { useSession } from "next-auth/react";


const SearchUser = ({ params }: any) => {
  const [searchQuery, setSearchQuery] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [results, setResults] = useState([]);
  const router = useRouter();
  const { data: session, status } = useSession();

  const locale = params.locale;

  const token = session?.user?.token;

  const handleSearchChange = (e: any) => {
    const { name, value } = e.target;
    setSearchQuery((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    try {
      const payload = {
        firstName: searchQuery.firstName,
        lastName: searchQuery.lastName,
        email: searchQuery.email
      };
      const data = await searchrole(payload, token);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleEditUser = (userId: string) => {
    router.push(`/${locale}/backoffice/user-management/edit-user/?id=${userId}`);
  };

  return (
    <div className="search-container">
      <h2 className="text-center font-bold leading-tight">Search for a User</h2>

      <div className="search-inputs">
        <input
          type="text"
          name="firstName"
          value={searchQuery.firstName}
          onChange={handleSearchChange}
          placeholder="First Name"
        />
        <input
          type="text"
          name="lastName"
          value={searchQuery.lastName}
          onChange={handleSearchChange}
          placeholder="Last Name"
        />
        <input
          type="email"
          name="email"
          value={searchQuery.email}
          onChange={handleSearchChange}
          placeholder="Email"
        />
        <button onClick={handleSearch} className="search-btn">Search</button>
      </div>

      {/* Display search results */}
      <div className="results-table">
        {results.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Active</th>
                <th>Roles</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.active ? "Yes" : "No"}</td>
                  <td>{user.roles.join(", ")}</td>
                  <td>
                    <button onClick={() => handleEditUser(user.id)}>
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};
export default SearchUser;