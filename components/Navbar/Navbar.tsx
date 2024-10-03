"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import hasRequiredRole from "@/utils/checkRole";
import "./sidenav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useSidebar } from "@/context/SidebarContext";

const HeaderManagement = () => {
  const { user, logout } = useAuth();
  const [links, setLinks] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    Products: false,
    Package: false,
    Admin: false,
    Agent: false,
  });
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    let allowedLinks = [];
    if (user?.user_id) {
      allowedLinks.push({ name: "Home", url: "/backoffice/management", subLinks: [] });
      if (hasRequiredRole(user?.role, "/backoffice/admin")) {
        allowedLinks.push({ name: "Admin", url: "/backoffice/admin", subLinks: [] });
      }
      if (hasRequiredRole(user?.role, "ProductOwner")) {
        allowedLinks.push({
          name: "Products",
          url: "#",
          subLinks: [
            {
              name: "Type Definition",
              subLinks: [
                { name: "UI Component", url: "/backoffice/owner/productcategory" },
                {
                  name: "Product Type",
                  url: "/backoffice/owner/addInitialProductCategory",
                },
              ],
            },
            {
              name: "Manage Data",
              subLinks: [
                { name: 'Product', url: '/owner/add-product' },
                { name: 'UI Component', url: '/owner/viewproductcategory' },
                { name: 'Rule Management', url: '/owner/RuleForm' },
                { name: 'Rule Management', url: '/owner/RuleGrid' },      
                { name: 'Search Configuration', url: '/owner/searchConfiguration' },
                { name: "Product", url: "/backoffice/owner/add-product" },
                { name: "UI Component", url: "/backoffice/owner/viewproductcategory" },
              ],
            },
          ],
        });
      }
      if (hasRequiredRole(user?.role, "ProductOwner")) {
        allowedLinks.push({
          name: "Rule Management",
          url: "/backoffice/RuleGrid",
          sublinks: [],
        });
      }
    } else {
      allowedLinks.push({ name: "Login", url: "/backoffice/login", subLinks: null });
      allowedLinks.push({ name: "Register", url: "/backoffice/register", subLinks: null });
    }
    setLinks(allowedLinks);
  }, [user]);

  const toggleExpand = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className={`toggle-button ${
          isSidebarOpen ? "sidebar-open-button" : "sidebar-closed-button"
        }`}
      >
        <FontAwesomeIcon
          icon={isSidebarOpen ? faTimes : faBars}
          className="icon-size"
        />
      </button>

      <div
        className={`sidebar ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <div className="flex h-full flex-col bg-gray-800 text-white">
          <div
            className="border-b border-gray-700 p-5 "
            style={{ backgroundColor: "#273a8a" }}
          >
            <h3 className="welcome-div mobile-nav">Welcome</h3>
          </div>
          <nav
            className="mobile-nav flex-grow p-5"
            style={{ backgroundColor: "#34313f" }}
          >
            {links.map((link) => (
              <div key={link.name}>
                {link.subLinks && link.subLinks.length > 0 ? (
                  <>
                    <button
                      onClick={() => toggleExpand(link.name)}
                      className="flex w-full items-center justify-between p-2 text-left hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-expanded={expandedSections[link.name]}
                    >
                      <p className="mobile-button mobile-nav">{link.name}</p>
                      <span>{expandedSections[link.name] ? "▼" : "▶"}</span>
                    </button>
                    {expandedSections[link.name] && (
                      <div className="pl-4">
                        {link.subLinks.map((subLink) => (
                          <div key={subLink.name}>
                            {subLink.subLinks && subLink.subLinks.length > 0 ? (
                              <>
                                <button
                                  onClick={() => toggleExpand(subLink.name)}
                                  className="flex w-full items-center justify-between p-2 text-left hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                                  aria-expanded={expandedSections[subLink.name]}
                                >
                                  <p className="mobile-button mobile-nav">
                                    {subLink.name}
                                  </p>
                                  <span>
                                    {expandedSections[subLink.name] ? "▼" : "▶"}
                                  </span>
                                </button>
                                {expandedSections[subLink.name] && (
                                  <div className="pl-4">
                                    {subLink.subLinks.map((nestedLink) => (
                                      <Link
                                        key={nestedLink.name}
                                        href={nestedLink.url || "#"}
                                        passHref
                                      >
                                        <button className="mobile-button mobile-nav w-full p-2 text-left hover:text-gray-300">
                                          {nestedLink.name}
                                        </button>
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                              <Link href={subLink.url || "#"} passHref>
                                <button className="mobile-button mobile-nav w-full p-2 text-left hover:text-gray-300">
                                  {subLink.name}
                                </button>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={link.url} passHref>
                    <button className="mobile-button w-full p-2 text-left hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white">
                      {link.name}
                    </button>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {user && user?.user_id && user.user_id.length > 0 ? (
            <div className="mt-auto p-5" style={{ backgroundColor: "#273a8a" }}>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: "#273a8a",
                  transition: "background-color 0.3s ease",
                }}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default HeaderManagement;