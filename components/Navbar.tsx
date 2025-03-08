import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, LogOut, User } from 'lucide-react';

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
  const [userRole, setUserRole] = useState<string[]>([]);

  const locale = params.locale;

  // Simulating session data
  useEffect(() => {
    // This would come from your auth context in a real app
    setIsLoggedIn(true);
    setUserName('John Doe');
    setUserRole(['PRODUCTOWNER']);
  }, []);

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
  };

  const toggleExpand = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // Mock links data based on user role
  const links = [
    {
      name: "Home",
      url: `/${locale}/backoffice/management`,
    },
    userRole.includes("PRODUCTOWNER") && {
      name: "Travel Services",
      url: "#",
      subLinks: [
        {
          name: "Manage Services",
          subLinks: [
            { name: "Create new service", url: `/${locale}/backoffice/owner/add-product` },
            { name: "Search Product", url: `/${locale}/backoffice/owner/search-product` },
          ],
        },
        {
          name: "Search Configuration",
          subLinks: [
            { name: 'Search Configuration', url: `/${locale}/backoffice/owner/searchConfiguration` },
            { name: 'External Search Configuration', url: `/${locale}/backoffice/owner/externalSearchConfiguration` },
          ],
        },
      ],
    },
    userRole.includes("PRODUCTOWNER") && {
      name: "Localization",
      url: "#",
      subLinks: [
        { name: "Currencies", url: `/${locale}/backoffice/currencies` },
        { name: "Language Settings", url: `/${locale}/backoffice/language` },
      ],
    },
    userRole.includes("PRODUCTOWNER") && {
      name: "User Management",
      url: "#",
      subLinks: [
        { name: "Create User", url: `/${locale}/backoffice/user-management/create-user` },
        { name: "Search User", url: `/${locale}/backoffice/user-management/search-user` },
      ],
    },
    userRole.includes("PRODUCTOWNER") && {
      name: "Rule Interface",
      url: `/${locale}/backoffice/rule-interface`,
    },
    userRole.includes("PRODUCTOWNER") && {
      name: "Create Package",
      url: `/${locale}/backoffice/package`,
    },
  ].filter(Boolean);

  return (
    <div className="flex h-full flex-col">
      <div style={{ height: '88px' }} className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-white" />
          <h3 className="text-lg font-semibold text-white truncate">
            Welcome, {userName}
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
          <select
            className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-2 py-1"
            defaultValue="en"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>

      {isLoggedIn && (
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
