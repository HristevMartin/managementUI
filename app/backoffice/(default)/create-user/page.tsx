"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { role } from "./components/role_add";
import { Userrole } from "./components/user_role";
import { useSession } from "next-auth/react";
const CreateUser = () => {
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: [] as string[],
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  console.log("session data", session);
  const token = session?.user?.token;
  console.log("tokken", token);
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (name === "confirmPassword" || name === "password") {
      setError("");
    }
  };
  const handleRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedRoles = event.target.value as string[];
    setFormValues((prev) => ({
      ...prev,
      role: selectedRoles,
    }));
  };
  const handleSubmit = () => {
    if (formValues.password !== formValues.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const payload = {
      ...formValues,
    };
    console.log("Form Submitted", payload);
    setSubmitted(true);
  };
  useEffect(() => {
   
    const token = session?.user?.token;
    console.log("Session data:", session);
    console.log("Token:", token);
    const fetchUserRoles = async () => {
      if (!token) {
        console.error("No token found");
        return;
      }
      setLoading(true);
      try {
        
        const response = await Userrole(token);  
        console.log("Fetched roles:", response);
        setUserRoles(response);
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchUserRoles();
    }
  }, [session]);
  useEffect(() => {
    const jwttoken = session?.user?.token;
    console.log("Token from session:", jwttoken); // Debugging token
  
    // If there's no token, log and stop the function execution
    if (!jwttoken) {
      console.error("No token found, cannot call role function.");
      return;
    }
  
    console.log("Session data has:", session);
    console.log("Token has:", jwttoken);
  
    if (submitted && jwttoken) {
      const payload = {
        ...formValues,
      };
  
      role(payload, jwttoken)
        .then((response) => {
          console.log("Role function response:", response);
        })
        .catch((error) => {
          console.error("Error calling role function:", error);
        })
        .finally(() => {
          setSubmitted(false);
        });
    }
  }, [submitted, formValues, session]);
  
  
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={3}
      maxWidth="600px"
      mx="auto"
      component="form"
    >
      <Typography variant="h4" mb={3} align="center">
        Create User
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns="repeat(2, 1fr)"
        gap={3}
        width="100%"
      >
        <TextField
          label="First Name"
          name="firstName"
          value={formValues.firstName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={formValues.lastName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formValues.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formValues.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formValues.confirmPassword}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!error}
          helperText={error}
        />
        {/* Enhanced Roles Section */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Roles</InputLabel>
          <Select
            multiple
            value={formValues.role}
            onChange={handleRoleChange}
            input={<OutlinedInput label="Roles" />}
            renderValue={(selected) => {
              // Map the selected role values to their corresponding labels
              const selectedLabels = selected.map((role: string) => role);
              return selectedLabels.join(", ");
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 130,
                  width: "15%",
                  borderRadius: 8,
                },
              },
            }}
          >
            {loading ? (
              <MenuItem disabled>Loading roles...</MenuItem>
            ) : (
              userRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  <Checkbox checked={formValues.role.indexOf(role) > -1} />
                  <ListItemText primary={role} />
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>
      {/* Submit Button */}
      <Box mt={3} width="100%">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
          disabled={loading}
        >
          {loading ? "Loading..." : "Submit"}
        </Button>
      </Box>
    </Box>
  );
};
export default CreateUser;