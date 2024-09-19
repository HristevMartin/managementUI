"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import hasRequiredRole from "@/utils/checkRole";

const PackageUploader = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (user) {
      if (hasRequiredRole(user.roles, "PackageUploader")) {
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
      <h1>Uploader View</h1>
    </div>
  );
};

export default PackageUploader;
