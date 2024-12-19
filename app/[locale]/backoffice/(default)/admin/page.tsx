"use client";

import { useEffect, useState } from "react";
import hasRequiredRole from "@/utils/checkRole";
import { useAuth } from "@/context/AuthContext";

const AdminPage = () => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const { user } = useAuth();
  console.log("the user is ", user);

  useEffect(() => {
    if (user.access_token) {
      console.log('heree')
      console.log('user.access_token is ', user.access_token);
      if (hasRequiredRole(user.role, "ADMIN")) {
        setHasAccess(true);
      }
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    return (
      <div style={{ color: "red" }}>
        You do not have access to view this page.
      </div>
    );
  }

  return (
    <div>
      <h1>Admin Page</h1>
    </div>
  );
};

export default AdminPage;
