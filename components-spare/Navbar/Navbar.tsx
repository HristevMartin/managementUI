'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import hasRequiredRole from "@/utils/checkRole";
import { ChevronDown, ChevronRight } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import LocaleSwitcher from "../LocaleSwitcher";
import { getCurrentLocale } from "@/services/getCurrentLocale";

const HeaderManagement = () => {
  const [links, setLinks] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const { data: session } = useSession();
  const pathname = window.location.pathname;
  const locale = pathname?.split('/')[1];
  const lang = getCurrentLocale();

  const handleLogout = () => {
    signOut({ redirect: true, callbackUrl: `/${locale}/backoffice/welcome-login` });
  };

  useEffect(() => {
    let allowedLinks = [];
    if (session?.user?.id) {
      allowedLinks = [
        {
          name: "Home",
          url: `/${lang}/backoffice/management`,
        },
        session?.user?.role?.includes("PRODUCTOWNER") && {
          name: "Travel Services",
          url: "#",
          subLinks: [
            {
              name: "Manage Services",
              subLinks: [
                { name: "Create new service", url: `/${lang}/backoffice/owner/add-product` },
                { name: "Search Product", url: `/${lang}/backoffice/owner/search-product` },
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
        },
        session?.user?.role?.includes("PRODUCTOWNER") && {
          name: "Localization",
          url: "#",
          subLinks: [
            { name: "Currencies", url: `/${lang}/backoffice/currencies` },
            { name: "Language Settings", url: `/${lang}/backoffice/language` },
          ],
        },
        session?.user?.role?.includes("PRODUCTOWNER") && {
          name: "User Management",
          url: "#",
          subLinks: [
            { name: "Create User", url: `/${lang}/backoffice/user-management/create-user` },
            { name: "Search User", url: `/${lang}/backoffice/user-management/search-user` },
          ],
        },
        session?.user?.role?.includes("PRODUCTOWNER") && {
          name: "Rule Interface",
          url: `/${lang}/backoffice/rule-interface`,
        },
        session?.user?.role?.includes("PRODUCTOWNER") && {
          name: "Create Package",
          url: `/${lang}/backoffice/package`,
        },
      ].filter(Boolean);
    } else {
      allowedLinks = [
        { name: "Login", url: `/${lang}/backoffice/login` },
        { name: "Register", url: `/${lang}/backoffice/register` },
      ];
    }
    setLinks(allowedLinks);
  }, [session]);

  const toggleExpand = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600">
        <h3 className="text-lg font-semibold text-white">
          Welcome, {session?.user?.name || 'Guest'}
        </h3>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {links.map((link) => (
          <div key={link.name} className="py-1">
            {link.subLinks ? (
              <div>
                <button
                  onClick={() => toggleExpand(link.name)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <span>{link.name}</span>
                  {expandedSections[link.name] ? 
                    <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  }
                </button>
                {expandedSections[link.name] && (
                  <div className="ml-4 space-y-1 mt-1">
                    {link.subLinks.map((subLink) => (
                      <div key={subLink.name}>
                        {subLink.subLinks ? (
                          <div>
                            <button
                              onClick={() => toggleExpand(subLink.name)}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              <span>{subLink.name}</span>
                              {expandedSections[subLink.name] ? 
                                <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              }
                            </button>
                            {expandedSections[subLink.name] && (
                              <div className="ml-4 space-y-1 mt-1">
                                {subLink.subLinks.map((nestedLink) => (
                                  <Link
                                    key={nestedLink.name}
                                    href={nestedLink.url}
                                    className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-blue-50 transition-colors"
                                  >
                                    {nestedLink.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={subLink.url}
                            className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            {subLink.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={link.url}
                className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 transition-colors"
              >
                {link.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <LocaleSwitcher />
      </div>

      {session?.user?.id && (
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-colors"
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default HeaderManagement;