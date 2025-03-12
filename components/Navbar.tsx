import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, LogOut, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import hasRequiredRole from '@/utils/checkRole';
import LocaleSwitcher from './LocaleSwitcher';
interface NavbarProps {
  toggleSidebar?: () => void;
  params: {
    locale: string;
  };
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, params }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [userName, setUserName] = useState('Guest');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [links, setLinks] = useState<any[]>([]);

  const lang = params.locale;

  const { data: session } = useSession();

  let userId = session?.user?.id;
  let userRoles = session?.user?.role;

  // Simulating session data
  useEffect(() => {
    setIsLoggedIn(true);
    setUserName('Martin');
  }, [userId, userRoles]);

  const handleLogout = () => {
    signOut({ redirect: true, callbackUrl: `/${lang}/backoffice/welcome-login` });
  };

  const toggleExpand = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };


  useEffect(() => {
    let allowedLinks = [];
    if (userId) {
      allowedLinks.push({
        name: "BigTravel Dashboard",
        url: `/${lang}/backoffice/management`,
      });
      // if (hasRequiredRole(userRoles, "ADMIN")) {
      //   allowedLinks.push({
      //     name: "ADMIN",
      //     url: `/${lang}/backoffice/admin`,
      //     subLinks: [],
      //   });
      // }
      if (hasRequiredRole(userRoles, "PRODUCTOWNER")) {
        allowedLinks.push({
          name: "Travel Services",
          url: "#",
          subLinks: [
            { 
              name: "Add New Service", 
              url: `/${lang}/backoffice/owner/addInitialProductCategory` 
            },
            {
              name: "Manage Services",
              subLinks: [
                { name: "Add Product", url: `/${lang}/backoffice/owner/add-product` },
                {
                  name: "Search Product",
                  url: `/${lang}/backoffice/owner/search-product`,
                },
              ],
            },
            {
              name: "Supplier Integration",
              subLinks: [
                { name: 'API Configuration', url: `/${lang}/backoffice/owner/searchConfiguration` },
                //{ name: 'External Search Configuration', url: `/${lang}/backoffice/owner/externalSearchConfiguration` },
              ],
            },
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
          name: "Rule Management",
          url: `/${lang}/backoffice/rule-interface`,
          sublinks: [],
        });
      }
      if (hasRequiredRole(userRoles, "PRODUCTOWNER")) {
        allowedLinks.push({
          name: "Travel Packages",
          url: "#",
          subLinks: [
            { name: "Create Packages", url: `/${lang}/backoffice/package` },
            { name: "Search Packages", url: "#" },
          ],
        });
      }
      if (hasRequiredRole(userRoles, "PRODUCTOWNER")) {
        allowedLinks.push({
          name: "Settings",
          url: "#",
          subLinks: [
            { name: "Currencies", url: `/${lang}/backoffice/currencies` },
            { name: "Languages", url: `/${lang}/backoffice/language` },
          ],
        });
      }
      if (hasRequiredRole(userRoles, "PRODUCTOWNER")) {
        allowedLinks.push({
          name: "BigTravel Guide",
          url: "#",
          subLinks: [
            { name: "Documentation", url: "#" },
            { name: "Glossary", url: "#" },
            { name: "API Review", url: "#"}
          ],
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

  return (
    <div className="flex h-full flex-col">
      <div style={{ height: '88px' }} className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-white" />
          <h3 className="text-lg font-semibold text-white truncate">
            Hello, {userName}
          </h3>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {links.map((link: any, index) => (
          <div key={`${link.name}-${index}`} className="py-1">
            {link.subLinks ? (
              <div>
                <button
                  onClick={() => toggleExpand(link.name)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-indigo-50 transition-colors"
                >
                  <span>{link.name}</span>
                  {expandedSections[link.name] ?
                    <ChevronDown className="h-4 w-4 text-gray-500" /> :
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  }
                </button>
                {expandedSections[link.name] && (
                  <div className="ml-4 space-y-1 mt-1">
                    {link.subLinks.map((subLink: any, subIdx: number) => (
                      <div key={`${subLink.name}-${subIdx}`}>
                        {subLink.subLinks ? (
                          <div>
                            <button
                              onClick={() => toggleExpand(subLink.name)}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-indigo-50 transition-colors"
                            >
                              <span>{subLink.name}</span>
                              {expandedSections[subLink.name] ?
                                <ChevronDown className="h-4 w-4 text-gray-400" /> :
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              }
                            </button>
                            {expandedSections[subLink.name] && (
                              <div className="ml-4 space-y-1 mt-1">
                                {subLink.subLinks.map((nestedLink: any, nestedIdx: number) => (
                                  <a
                                    key={`${nestedLink.name}-${nestedIdx}`}
                                    href={nestedLink.url}
                                    className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-indigo-50 transition-colors"
                                    onClick={toggleSidebar}
                                  >
                                    {nestedLink.name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <a
                            href={subLink.url}
                            className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-indigo-50 transition-colors"
                            onClick={toggleSidebar}
                          >
                            {subLink.name}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a
                href={link.url}
                className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-indigo-50 transition-colors"
                onClick={toggleSidebar}
              >
                {link.name}
              </a>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Language</span>
          <LocaleSwitcher />
        </div>
      </div>

      {userId && (
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </button>
      )}
    </div>
  );
};

export default Navbar;
