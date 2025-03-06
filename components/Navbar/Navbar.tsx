"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import hasRequiredRole from "@/utils/checkRole";
import "./sidenav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useSidebar } from "@/context/SidebarContext";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import LocaleSwitcher from "../LocaleSwitcher";
import Cookies from "js-cookie";
import { getCurrentLocale } from "@/services/getCurrentLocale";

const HeaderManagement = () => {
  const [links, setLinks] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    Products: false,
    Package: false,
    Admin: false,
    Agent: false,
  });

  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1];

  const { data: session } = useSession();

  let userId = session?.user?.id;
  let userRoles = session?.user?.role;

  let lang = getCurrentLocale();

  const handleLogout = () => {
    signOut({ redirect: true, callbackUrl: `/${locale}/backoffice/welcome-login` });
  };

  const sidebarRef = useRef(null);
  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      toggleSidebar();
    }
  };

  useEffect(() => {
    let allowedLinks = [];
    if (userId) {
      allowedLinks.push({
        name: "Home",
        url: `/${lang}/backoffice/management`,
        subLinks: [],
      });
      if (hasRequiredRole(userRoles, "ADMIN")) {
        allowedLinks.push({
          name: "ADMIN",
          url: `/${lang}/backoffice/admin`,
          subLinks: [],
        });
      }
      if (hasRequiredRole(userRoles, "PRODUCTOWNER")) {
        allowedLinks.push({
          name: "Products",
          url: "#",
          subLinks: [
            {
              name: "Type Definition",
              subLinks: [
                {
                  name: "Product Type",
                  url: `/${lang}/backoffice/owner/addInitialProductCategory`,
                },
              ],
            },
            {
              name: "Manage Data",
              subLinks: [
                { name: "Add Product", url: `/${lang}/backoffice/owner/add-product` },
                {
                  name: "Search Product",
                  url: `/${lang}/backoffice/owner/search-product`,
                },
              ],
            },
            {
              name: "Search Configuration",
              subLinks: [
                { name: 'Search Configuration', url: `/${lang}/backoffice/owner/searchConfiguration` },
                { name: 'External Search Configuration', url: `/${lang}/backoffice/owner/externalSearchConfiguration` },
              ],
            },
          ],
        });
      }
      if (hasRequiredRole(userRoles, "PRODUCTOWNER")) {
        allowedLinks.push({
          name: "Localization",
          url: "#",
          subLinks: [
            { name: "Currencies", url: `/${lang}/backoffice/currencies` },
            { name: "Language Settings", url: `/${lang}/backoffice/language` },
          ],
        });
      }
      if (hasRequiredRole(userRoles, "PRODUCTOWNER")) {
        allowedLinks.push({
          name: "User Management",
          url: "#",
          subLinks: [
            { name: "Create User", url: `/${lang}/backoffice/user-management/create-user` },
            { name: "Search User", url: `/${lang}/backoffice/user-management/search-user` },
          ],
        });
      }
      if (hasRequiredRole(userRoles, "PRODUCTOWNER")) {
        allowedLinks.push({
          name: "Rule Interface",
          url: `/${lang}/backoffice/rule-interface`,
          sublinks: [],
        });
      }
      if (hasRequiredRole(userRoles, "PRODUCTOWNER")) {
        allowedLinks.push({
          name: "Create Package",
          url: `/${lang}/backoffice/package`,
          sublinks: [],
        });
      }
    } else {
      allowedLinks.push({
        name: "Login",
        url: `/${lang}/backoffice/login`,
        subLinks: null,
      });
      allowedLinks.push({
        name: "Register",
        url: `/${lang}/backoffice/register`,
        subLinks: null,
      });
    }
    setLinks(allowedLinks);
  }, [session]);

  const toggleExpand = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <>
      <button
        onClick={toggleSidebar}
        className={`toggle-button ${isSidebarOpen ? "sidebar-open-button" : "sidebar-closed-button"
          }`}
      >
        <FontAwesomeIcon
          icon={isSidebarOpen ? faTimes : faBars}
          className="icon-size closeButton text-black"
        />
      </button>

      <div
        ref={sidebarRef}
        className={`sidebar ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"
          }`}
      >
        <div className="flex h-full flex-col text-black">

          <div
            className="border-b border-gray-700 p-5 text-white "
            style={{ backgroundColor: "#2c4044" }}
          >
            <h3 className="welcome-div mobile-nav text-white">Welcome</h3>
          </div>

          <nav
            className="mobile-nav flex-grow p-5"
            style={{ backgroundColor: "#ffffff" }}
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
                          <div style={{ width: "210px" }} key={subLink.name}>
                            {subLink.subLinks && subLink.subLinks.length > 0 ? (
                              <>
                                <button
                                  onClick={() => toggleExpand(subLink.name)}
                                  className=" flex w-full items-center justify-between p-2 text-left hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                                  aria-expanded={expandedSections[subLink.name]}
                                >
                                  <p className="mobile-button mobile-nav">
                                    {subLink.name}
                                  </p>
                                  <span className="">
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
                    <button className="mobile-button w-full p-2 text-left hover:text-[#00838b] focus:outline-none focus:ring-2 focus:ring-white">
                      {link.name}
                    </button>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div style={{ maxWidth: '46%' }} className="locale-switcher-wrapper">
            <LocaleSwitcher />
          </div>

          {userId ? (
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
