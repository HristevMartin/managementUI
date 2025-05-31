"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaSave } from "react-icons/fa";
import { userdata } from "./components/userdata";
import { updateuser } from "./components/update-user";
import { Userrole } from "./components/user-role";
import "./page.css";
import { useSession } from "next-auth/react";
import { useModal } from "@/context/useModal";
const EditUser = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [roles, setRoles] = useState([]); 
   const { data: session, status } = useSession();
   const { showModal } = useModal();

    console.log("session data in edit", session);
    const token = session?.user?.token;
  
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await Userrole(token); 
        const formattedRoles = rolesData.map((role) => ({
          label: role,  
          value: role,  
        }));
        setRoles(formattedRoles);  
      } catch (err) {
        setError("Error fetching roles: " + err.message);
      }
    };
    fetchRoles();
  }, []); 
  useEffect(() => {
    if (!id) {
      setError("No user ID provided in the URL");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const data = await userdata(id,token);
        setUserData(data);
        console.log("User data:", data); 
      } catch (err) {
        setError("Error fetching user data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);
  useEffect(() => {
    if (formSubmitted && userData && id) {
      const updateUser = async () => {
        try {
          const updatedUserData = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            newPassword: newPassword || userData.password,
            isActive: userData.active,
            role: userData.roles,
          };
          console.log("Payload to save:", updatedUserData);
          await updateuser(id, updatedUserData,token);
          showModal("success", "User updated successfully!");
        } catch (err) {
          setError("Error updating user: " + err.message);
        } finally {
          setFormSubmitted(false);
        }
      };
      updateUser();
    }
  }, [formSubmitted, userData, id, newPassword]);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div className="error">{error}</div>;
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleRoleChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedRoles = selectedOptions.map((option) => option.value);
    setUserData((prevData) => ({
      ...prevData,
      roles: [...new Set([...prevData.roles, ...selectedRoles])],
    }));
  };
  const handleRoleDelete = (roleToDelete) => {
    setUserData((prevData) => ({
      ...prevData,
      roles: prevData.roles.filter((role) => role !== roleToDelete),
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };
  return (
    <div className="edit-container">
      <h2 className="text-center">Edit User</h2>
      {userData && (
        <form className="user-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={userData.firstName || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={userData.lastName || ""}
              onChange={handleInputChange}
            />
          </div>
          {/* Disable the email input field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email || ""}
              disabled
            />
          </div>
          {/* Role Dropdown with multiple selections */}
          <div className="form-group">
            <label htmlFor="roles">Roles</label>
            <select
              id="roles"
              name="roles"
              multiple
              value={userData.roles || []} // Prepopulate with selected roles
              onChange={handleRoleChange}
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <div className="selected-roles">
              <h4>Selected Roles:</h4>
              <div className="chips-container">
                {userData.roles &&
                  userData.roles.map((role) => (
                    <div key={role} className="chip">
                      {role}
                      <span
                        className="chip-delete"
                        onClick={() => handleRoleDelete(role)}
                      >
                        x
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="active" className="mr-6 text-xl">
              Active
            </label>
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={userData.active || false}
              onChange={(e) =>
                handleInputChange({
                  target: { name: "active", value: e.target.checked },
                })
              }
              className="scale-150"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              style={{ marginLeft: '10px', border: '1px solid gray', borderRadius: '5px', padding: '2px' }}
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn">
            <FaSave /> Save Changes
          </button>
        </form>
      )}
    </div>
  );
};
export default EditUser;