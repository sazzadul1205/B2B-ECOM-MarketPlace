// Pages/Admin/Suppliers/Show.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiMail,
  FiPhone,
  FiMapPin,
  FiFileText,
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiUser,
  FiAward,
} from 'react-icons/fi';
import {
  MdVerified,
  MdPending,
  MdWarning,
  MdOutlineStorefront
} from 'react-icons/md';

export default function Show({ supplier, stats, recentOrders, recentProducts }) {
  // State management for active tab
  const [activeTab, setActiveTab] = useState('overview');

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Handle toggle account status (activate/deactivate)
  const handleToggleStatus = () => {
    const banglaAction = supplier.user.is_active ? 'নিষ্ক্রিয়' : 'সক্রিয়';

    if (confirm(`আপনি কি এই সাপ্লায়ারকে ${banglaAction} করতে চান?`)) {
      router.patch(route('admin.suppliers.toggle-status', supplier.id));
    }
  };

  // Handle delete supplier
  const handleDelete = () => {
    if (confirm(`আপনি কি ${supplier.company_name} মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।`)) {
      router.delete(route('admin.suppliers.destroy', supplier.id));
    }
  };

  // Get verification status badge
  const getStatusBadge = (status) => {
    const badges = {
      verified: { bg: 'bg-green-100', text: 'text-green-800', icon: MdVerified, label: 'ভেরিফাইড' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: MdPending, label: 'বিচারাধীন' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: MdWarning, label: 'প্রত্যাখ্যাত' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.label}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <Head title={`${supplier.company_name} - বিস্তারিত`} />

      <div className="space-y-6">
        {/* Header - Back button, title and action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={route('admin.suppliers.index')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{supplier.company_name}</h1>
                {getStatusBadge(supplier.verification_status)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(supplier.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })} থেকে সাপ্লায়ার
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={route('admin.suppliers.edit', supplier.id)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
            >
              <FiEdit className="w-4 h-4" />
              <span>সম্পাদনা</span>
            </Link>
            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${supplier.user.is_active
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
            >
              {supplier.user.is_active ? (
                <>
                  <FiXCircle className="w-4 h-4" />
                  <span>নিষ্ক্রিয় করুন</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  <span>সক্রিয় করুন</span>
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>মুছুন</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Key performance metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Products Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট পণ্য</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_products}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-green-600">{stats.approved_products} অনুমোদিত</span>
              <span className="text-yellow-600">{stats.pending_products} বিচারাধীন</span>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট অর্ডার</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_orders}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-green-600">{stats.completed_orders} সম্পন্ন</p>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট আয়</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.total_revenue)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Quotes Submitted Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">জমা দেওয়া কোটা</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{supplier.quotes_count}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiFileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Company Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MdOutlineStorefront className="w-5 h-5 text-indigo-600" />
                কোম্পানির বিবরণ
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiUser className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">যোগাযোগের ব্যক্তি</p>
                    <p className="font-medium text-gray-900">{supplier.user.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiMail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">ইমেইল</p>
                    <a href={`mailto:${supplier.company_email}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                      {supplier.company_email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiPhone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">ফোন</p>
                    <a href={`tel:${supplier.company_phone}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      {supplier.company_phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">ঠিকানা</p>
                    <p className="font-medium text-gray-900">{supplier.company_address}</p>
                    <p className="text-sm text-gray-500">{supplier.city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* License Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiAward className="w-5 h-5 text-indigo-600" />
                লাইসেন্স তথ্য
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">ট্রেড লাইসেন্স নম্বর</p>
                  <p className="font-medium text-gray-900">{supplier.trade_license_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">অ্যাকাউন্ট স্ট্যাটাস</p>
                  <div className="mt-1">
                    {supplier.user.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FiCheckCircle className="w-3 h-3 mr-1" />
                        সক্রিয় অ্যাকাউন্ট
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <FiXCircle className="w-3 h-3 mr-1" />
                        নিষ্ক্রিয় অ্যাকাউন্ট
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tabs Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Tab Navigation */}
              <div className="border-b border-gray-100">
                <nav className="flex gap-4 px-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 text-sm font-medium border-b-2 transition ${activeTab === 'overview'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    ওভারভিউ
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`py-4 text-sm font-medium border-b-2 transition ${activeTab === 'products'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    পণ্য
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`py-4 text-sm font-medium border-b-2 transition ${activeTab === 'orders'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    অর্ডার
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Recent Products */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">সাম্প্রতিক পণ্য</h4>
                        <Link
                          href={route('admin.products.index', { supplier_id: supplier.id })}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          সব দেখুন →
                        </Link>
                      </div>
                      <div className="space-y-3">
                        {recentProducts.map((product) => (
                          <Link
                            key={product.id}
                            href={route('admin.products.show', product.id)}
                            className="block p-3 hover:bg-gray-50 rounded-lg transition"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-500">ক্যাটাগরি: {product.category}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">{formatCurrency(product.base_price)}</p>
                                <p className="text-sm text-gray-500">স্টক: {product.stock_quantity}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">সাম্প্রতিক অর্ডার</h4>
                        <Link
                          href={route('admin.orders.index', { supplier_id: supplier.user_id })}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          সব দেখুন →
                        </Link>
                      </div>
                      <div className="space-y-3">
                        {recentOrders.map((order) => (
                          <Link
                            key={order.id}
                            href={route('admin.orders.show', order.id)}
                            className="block p-3 hover:bg-gray-50 rounded-lg transition"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">অর্ডার #{order.order_number}</p>
                                <p className="text-sm text-gray-500">ক্রেতা: {order.buyer.name}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">{formatCurrency(order.total_amount)}</p>
                                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'products' && (
                  <div>
                    <p className="text-gray-500">পণ্য ট্যাব - সম্পূর্ণ পণ্য তালিকা দেখাবে</p>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <p className="text-gray-500">অর্ডার ট্যাব - সম্পূর্ণ অর্ডার তালিকা দেখাবে</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}