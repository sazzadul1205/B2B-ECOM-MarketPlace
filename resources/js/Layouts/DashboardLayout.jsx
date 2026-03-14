
// React
import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

// Icons
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiMessageSquare,
  FiFileText,
  FiUsers,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiChevronDown,
  FiDollarSign,
  FiBarChart2,
  FiAlertCircle
} from 'react-icons/fi';
import {
  BsTruck,
  BsBuilding,
  BsGraphUp,
  BsShieldCheck,
  BsCartCheck,
  BsEnvelope,
  BsBoxSeam,
  BsClockHistory
} from 'react-icons/bs';
import {
  MdVerified,
  MdOutlineInventory,
  MdConstruction
} from 'react-icons/md';
import { IoMdBusiness } from 'react-icons/io';

const DashboardLayout = ({ children }) => {
  const { props, url } = usePage();
  const { auth, flash } = props;
  const [openMenus, setOpenMenus] = useState({});
  const [currentRoute, setCurrentRoute] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Get authenticated user
  const user = auth?.user;

  // Get current route name
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentRoute(url || window.location.pathname);
    }
  }, [url]);

  // Check if current page is dashboard
  const isDashboard = () => {
    return currentRoute.startsWith('/dashboard') ||
      currentRoute.startsWith('/admin') ||
      currentRoute.startsWith('/supplier') ||
      currentRoute.startsWith('/buyer') ||
      currentRoute.startsWith('/profile');
  };

  // Mock notifications - replace with real data later
  useEffect(() => {
    if (user?.role === 'admin') {
      setNotifications([
        { id: 1, text: 'New supplier registration pending', time: '5 min ago', unread: true },
        { id: 2, text: '3 products need approval', time: '1 hour ago', unread: true },
      ]);
    } else if (user?.role === 'supplier') {
      setNotifications([
        { id: 1, text: 'New RFQ from Buyer', time: '10 min ago', unread: true },
        { id: 2, text: 'Your product was approved', time: '2 hours ago', unread: false },
      ]);
    } else if (user?.role === 'buyer') {
      setNotifications([
        { id: 1, text: 'New quote received', time: '15 min ago', unread: true },
        { id: 2, text: 'Order confirmed', time: '1 day ago', unread: false },
      ]);
    }
  }, [user]);


  // Open menus
  useEffect(() => {
    if (currentRoute.includes('/admin/reports')) {
      setOpenMenus(prev => ({ ...prev, Reports: true }));
    }
    if (currentRoute.includes('/supplier/analytics')) {
      setOpenMenus(prev => ({ ...prev, Analytics: true }));
    }
  }, [currentRoute]);

  const handleLogout = () => {
    router.post(route('logout'));
  };

  const isRouteActive = (routeName) => {
    if (!routeName) return false;
    try {
      if (route().current(routeName)) return true;
      const routeUrl = route(routeName);
      const baseUrl = window.location.origin;
      const routePath = routeUrl.replace(baseUrl, '');
      const currentPath = window.location.pathname;

      if (currentPath === routePath) return true;

      if (routeName.includes('index') && currentPath.includes(routePath.replace('/index', ''))) {
        return true;
      }

      if (routeName === 'admin.supplier-verification.index' &&
        (currentPath.includes('/verify/') || currentPath.includes('/verified') || currentPath.includes('/rejected'))) {
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  };

  // Check if a menu item is active
  const isMenuItemActive = (item) => {
    if (item.placeholder) return false;
    if (item.subItems) {
      return item.subItems.some(sub => isRouteActive(sub.route));
    }
    return isRouteActive(item.route);
  };

  // Role-based menu items with placeholder routes
  const getMenuItems = () => {
    const dashboardRouteByRole = {
      admin: 'admin.dashboard',
      supplier: 'supplier.dashboard',
      buyer: 'buyer.dashboard',
    };

    const commonItems = [
      {
        name: 'Dashboard',
        icon: FiHome,
        route: dashboardRouteByRole[user?.role] || 'dashboard',
        roles: ['admin', 'supplier', 'buyer'],
      },
    ];

    const adminItems = [
      { name: 'Manage Suppliers', icon: IoMdBusiness, route: 'admin.suppliers.index', roles: ['admin'] },
      { name: 'Verify Suppliers', icon: MdVerified, route: 'admin.supplier-verification.index', roles: ['admin'] },
      { name: 'Product Approvals', icon: MdOutlineInventory, route: 'admin.product-approval.index', roles: ['admin'] },
      { name: 'All Products', icon: FiPackage, route: 'admin.products.index', roles: ['admin'] },
      { name: 'All Orders', icon: FiShoppingCart, route: 'admin.orders.index', roles: ['admin'] },
      { name: 'All RFQs', icon: FiFileText, route: 'admin.rfqs.index', roles: ['admin'] },
      { name: 'Manage Users', icon: FiUsers, route: 'admin.users.index', roles: ['admin'] },
      {
        name: 'Reports',
        icon: FiBarChart2,
        route: 'admin.reports.sales',
        roles: ['admin'],
        subItems: [
          { name: 'Sales Reports', icon: FiDollarSign, route: 'admin.reports.sales' },
          { name: 'Supplier Reports', icon: IoMdBusiness, route: 'admin.reports.suppliers' },
          { name: 'Buyer Reports', icon: FiUsers, route: 'admin.reports.buyers' },
          { name: 'Product Reports', icon: FiPackage, route: 'admin.reports.products' },
          { name: 'RFQ Reports', icon: FiFileText, route: 'admin.reports.rfqs' },
          { name: 'Financial Reports', icon: FiDollarSign, route: 'admin.reports.financial' },
        ]
      },
    ];

    const supplierItems = [
      { name: 'Company Profile', icon: BsBuilding, route: 'supplier.profile.index', roles: ['supplier'] },
      { name: 'Products', icon: FiPackage, route: 'supplier.products.index', roles: ['supplier'] },
      { name: 'Add Product', icon: BsBoxSeam, route: 'supplier.products.create', roles: ['supplier'] },
      { name: 'Orders', icon: FiShoppingCart, route: 'supplier.orders.index', roles: ['supplier'] },
      { name: 'RFQs', icon: FiFileText, route: 'supplier.rfqs.index', roles: ['supplier'] },
      { name: 'Quotes Sent', icon: BsGraphUp, route: 'supplier.quotes.index', roles: ['supplier'] },
      { name: 'Messages', icon: FiMessageSquare, route: 'supplier.messages.index', roles: ['supplier'] },
      {
        name: 'Analytics',
        icon: FiBarChart2,
        route: 'supplier.analytics.sales',
        roles: ['supplier'],
        subItems: [
          { name: 'Sales Analytics', icon: FiDollarSign, route: 'supplier.analytics.sales' },
          { name: 'Product Analytics', icon: FiPackage, route: 'supplier.analytics.products' },
          { name: 'Quote Analytics', icon: FiFileText, route: 'supplier.analytics.quotes' },
        ]
      },
    ];

    const buyerItems = [
      { name: 'Browse Products', icon: FiPackage, route: 'buyer.products.index', roles: ['buyer'] },
      { name: 'My RFQs', icon: FiFileText, route: 'buyer.rfqs.index', roles: ['buyer'] },
      { name: 'Create RFQ', icon: BsEnvelope, route: 'buyer.rfqs.create', roles: ['buyer'] },
      { name: 'My Orders', icon: FiShoppingCart, route: 'buyer.orders.index', roles: ['buyer'] },
      { name: 'Quotes Received', icon: BsCartCheck, route: 'buyer.quotes.index', roles: ['buyer'] },
      { name: 'Messages', icon: FiMessageSquare, route: 'buyer.messages.index', roles: ['buyer'] },
    ];

    const allItems = [...commonItems, ...adminItems, ...supplierItems, ...buyerItems];

    if (user) {
      return allItems.filter(item => item.roles.includes(user.role));
    }

    return [];
  };

  // Generate menu items
  const menuItems = getMenuItems();

  // Placeholder component for under construction pages
  const UnderConstruction = ({ pageName }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-full mb-6">
        <MdConstruction className="w-16 h-16 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{pageName || 'Page'} Coming Soon</h3>
      <div className="max-w-md">
        <p className="text-gray-600 mb-4">
          This section is currently under development. We're working hard to bring you this feature.
        </p>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
          <div className="flex items-center space-x-3 text-indigo-700">
            <BsClockHistory className="w-5 h-5" />
            <span className="text-sm font-medium">Expected completion: Next update</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Get current page title
  const getPageTitle = () => {
    const activeItem = menuItems.find(item => isMenuItemActive(item));
    return activeItem?.name || 'Dashboard';
  };

  // Toggle menu
  const toggleMenu = (name) => {
    setOpenMenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Flash Messages */}
      {flash?.success && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in">
          {flash.success}
        </div>
      )}
      {flash?.error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in">
          {flash.error}
        </div>
      )}

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-indigo-900 to-purple-900 text-white transform transition-transform duration-300 ease-in-out z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-indigo-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BsTruck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">B2B Market</h2>
                <p className="text-xs text-indigo-300">Enterprise Marketplace</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-indigo-300 hover:text-white"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="mt-4 p-3 bg-indigo-800/50 rounded-lg">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-indigo-300 mt-1 flex items-center">
                <BsShieldCheck className="w-3 h-3 mr-1" />
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                {!user.is_active && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-xs rounded-full">
                    Pending
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-200px)]">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = isMenuItemActive(item);
              const itemKey = item.route || item.name;

              // If item has sub menu
              if (item.subItems) {
                const isOpen = openMenus[item.name];
                const isSubActive = item.subItems.some(sub => isRouteActive(sub.route));

                return (
                  <div key={itemKey}>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg ${isSubActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                        : 'text-indigo-100 hover:bg-indigo-800'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>

                      <FiChevronDown
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems.map((sub) => (
                          <Link
                            key={`${item.name}-${sub.route || sub.name}`}
                            href={route(sub.route)}
                            className={`flex items-center space-x-3 px-4 py-2 text-sm rounded-lg ${isRouteActive(sub.route)
                              ? 'bg-indigo-800 text-white'
                              : 'text-indigo-200 hover:bg-indigo-800'
                              }`}
                          >
                            <sub.icon className="w-4 h-4" />
                            <span>{sub.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Normal menu item
              return (
                <Link
                  key={itemKey}
                  href={route(item.route)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${isActive
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                    : "text-indigo-100 hover:bg-indigo-800"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-indigo-100 hover:bg-indigo-800 rounded-lg transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72 min-h-screen min-w-0">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <FiMenu className="w-6 h-6" />
              </button>

              {/* Page Title with active state indicator */}
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold text-gray-800">
                  {getPageTitle()}
                </h1>
                {menuItems.some(item => isMenuItemActive(item)) && (
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                    Active
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications - Placeholder */}
              <div className="relative">
                <button
                  onClick={() => alert('Notifications will be implemented soon!')}
                  className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                >
                  <FiBell className="w-5 h-5" />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                  <FiChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                    <Link
                      href={route(user?.role === 'supplier' ? 'supplier.profile.edit' : 'profile.edit')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 min-w-0">

          {/* Main Content Area */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-w-0">
            {isDashboard() ? (
              children
            ) : (
              <UnderConstruction pageName="This Feature" />
            )}
          </div>

          {/* Development Notice */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
            <FiAlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              🚧 Development Mode: Only Dashboard and Supplier Verification are fully functional. Other features coming soon.
            </p>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
