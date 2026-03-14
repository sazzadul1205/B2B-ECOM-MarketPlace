// resources/js/Pages/Admin/Dashboard.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head, Link } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing various icon sets for UI elements
import {
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import {
  MdVerified,
  MdPending,
} from 'react-icons/md';


// Recharts - Charting library components for data visualization
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard({
  stats,
  charts,
  pendingItems,
  recentOrders,
  recentRfqs,
  systemHealth
}) {

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get status color - Returns appropriate color classes based on status
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      approved: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-gray-100 text-gray-800',
      open: 'bg-blue-100 text-blue-800',
      quoted: 'bg-indigo-100 text-indigo-800',
      closed: 'bg-gray-100 text-gray-800',
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <Head title="অ্যাডমিন ড্যাশবোর্ড" />

      <div className="space-y-6">
        {/* Header - Page title and action buttons */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-sm text-gray-600 mt-1">
              স্বাগতম! আজ আপনার মার্কেটপ্লেসে কী ঘটছে তা এখানে দেখা যাচ্ছে।
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition">
              <FiDownload className="w-4 h-4" />
              <span>রিপোর্ট এক্সপোর্ট</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              <FiRefreshCw className="w-4 h-4" />
              <span>রিফ্রেশ</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Cards - Main metrics overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Card - Today's revenue with comparison */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">আজকের আয়</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(stats?.revenue_today || 0)}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FiDollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="opacity-90">গত মাসের তুলনায়</span>
              <span className="ml-2 flex items-center">
                {stats?.revenue_this_month > stats?.revenue_last_month ? (
                  <>
                    <FiTrendingUp className="w-4 h-4 mr-1" />
                    {Math.round((stats.revenue_this_month - stats.revenue_last_month) / stats.revenue_last_month * 100)}%
                  </>
                ) : (
                  <>
                    <FiTrendingDown className="w-4 h-4 mr-1" />
                    {Math.round((stats.revenue_last_month - stats.revenue_this_month) / stats.revenue_last_month * 100)}%
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Orders Card - Today's orders with status breakdown */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">আজকের অর্ডার</p>
                <p className="text-2xl font-bold mt-1">{stats?.orders_today || 0}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FiShoppingCart className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="opacity-90">বিচারাধীন</span>
                <p className="font-bold">{stats?.orders_by_status?.pending_confirmation || 0}</p>
              </div>
              <div>
                <span className="opacity-90">প্রক্রিয়াধীন</span>
                <p className="font-bold">{stats?.orders_by_status?.processing || 0}</p>
              </div>
              <div>
                <span className="opacity-90">ডেলিভারি</span>
                <p className="font-bold">{stats?.orders_by_status?.delivered || 0}</p>
              </div>
            </div>
          </div>

          {/* Users Card - User statistics breakdown */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">মোট ব্যবহারকারী</p>
                <p className="text-2xl font-bold mt-1">{stats?.total_users || 0}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FiUsers className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-xs">
              <div>
                <span className="opacity-90">ক্রেতা</span>
                <p className="font-bold">{stats?.users_by_role?.buyer || 0}</p>
              </div>
              <div>
                <span className="opacity-90">সাপ্লায়ার</span>
                <p className="font-bold">{stats?.users_by_role?.supplier || 0}</p>
              </div>
              <div>
                <span className="opacity-90">আজকের নতুন</span>
                <p className="font-bold">{stats?.new_users_today || 0}</p>
              </div>
            </div>
          </div>

          {/* Products Card - Product inventory overview */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">সক্রিয় পণ্য</p>
                <p className="text-2xl font-bold mt-1">{stats?.approved_products || 0}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FiPackage className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-xs">
              <div>
                <span className="opacity-90">স্টক কম</span>
                <p className="font-bold">{stats?.low_stock_products || 0}</p>
              </div>
              <div>
                <span className="opacity-90">স্টক নেই</span>
                <p className="font-bold">{stats?.out_of_stock || 0}</p>
              </div>
              <div>
                <span className="opacity-90">বিচারাধীন</span>
                <p className="font-bold">{stats?.pending_products || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals Section - Items waiting for admin review */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Suppliers - Suppliers waiting for verification */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MdPending className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">সাপ্লায়ার ভেরিফিকেশন বিচারাধীন</h3>
                    <p className="text-sm text-gray-500">অনুমোদনের অপেক্ষায় থাকা সাপ্লায়ার</p>
                  </div>
                </div>
                <Link
                  href={route('admin.supplier-verification.index')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  সব দেখুন →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingItems?.suppliers?.length > 0 ? (
                pendingItems.suppliers.map((supplier) => (
                  <div key={supplier.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                          <FiUsers className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{supplier.company_name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <span>{supplier.contact}</span>
                            <span>•</span>
                            <span>{supplier.email}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{supplier.submitted_at}</p>
                        </div>
                      </div>
                      <Link
                        href={supplier.url}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition"
                      >
                        পর্যালোচনা
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiCheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-600">কোন সাপ্লায়ার ভেরিফিকেশন বিচারাধীন নেই</p>
                  <p className="text-sm text-gray-400 mt-1">সব সাপ্লায়ার পর্যালোচনা করা হয়েছে</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Products - Products waiting for approval */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FiClock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">পণ্য অনুমোদন বিচারাধীন</h3>
                    <p className="text-sm text-gray-500">পর্যালোচনার অপেক্ষায় থাকা নতুন পণ্য</p>
                  </div>
                </div>
                <Link
                  href={route('admin.product-approval.index')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  সব দেখুন →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingItems?.products?.length > 0 ? (
                pendingItems.products.map((product) => (
                  <div key={product.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
                          <FiPackage className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <span>দ্বারা: {product.supplier}</span>
                            <span>•</span>
                            <span>{formatCurrency(product.price)}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{product.submitted_at}</p>
                        </div>
                      </div>
                      <Link
                        href={product.url}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition"
                      >
                        পর্যালোচনা
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiCheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-600">কোন পণ্য অনুমোদন বিচারাধীন নেই</p>
                  <p className="text-sm text-gray-400 mt-1">সব পণ্য পর্যালোচনা করা হয়েছে</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section - Revenue and Order trends visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart - 30 days revenue trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">আয়ের প্রবণতা (৩০ দিন)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.revenue_trend}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `৳${value / 1000}K`} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Trend Chart - 30 days order trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">অর্ডারের প্রবণতা (৩০ দিন)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.order_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="orders" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders & RFQs - Latest transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders - Latest 10 orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">সাম্প্রতিক অর্ডার</h3>
                    <p className="text-sm text-gray-500">সর্বশেষ ১০টি অর্ডার</p>
                  </div>
                </div>
                <Link
                  href={route('admin.orders.index')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  সব দেখুন →
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">অর্ডার #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ক্রেতা</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">পরিমাণ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">পেমেন্ট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders?.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <Link href={order.url} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.buyer}</p>
                          <p className="text-xs text-gray-500">{order.supplier}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status === 'pending' ? 'বিচারাধীন' :
                            order.status === 'processing' ? 'প্রক্রিয়াধীন' :
                              order.status === 'shipped' ? 'পাঠানো হয়েছে' :
                                order.status === 'delivered' ? 'ডেলিভারি হয়েছে' :
                                  order.status === 'cancelled' ? 'বাতিল' : order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.payment_status)}`}>
                          {order.payment_status === 'paid' ? 'পরিশোধিত' :
                            order.payment_status === 'unpaid' ? 'অপরিশোধিত' :
                              order.payment_status === 'pending' ? 'বিচারাধীন' : order.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent RFQs - Latest 10 RFQs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiFileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">সাম্প্রতিক RFQ</h3>
                    <p className="text-sm text-gray-500">সর্বশেষ ১০টি কোটা অনুরোধ</p>
                  </div>
                </div>
                <Link
                  href={route('admin.rfqs.index')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  সব দেখুন →
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RFQ #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">শিরোনাম</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ক্রেতা</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">কোটা</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentRfqs?.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <Link href={rfq.url} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                          {rfq.rfq_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                          <p className="text-xs text-gray-500">পরিমাণ: {rfq.quantity}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {rfq.buyer}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {rfq.quotes_count}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rfq.status)}`}>
                          {rfq.status === 'open' ? 'খোলা' :
                            rfq.status === 'quoted' ? 'কোটা প্রাপ্ত' :
                              rfq.status === 'closed' ? 'বন্ধ' : rfq.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Stats Row - Additional metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <MdVerified className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">ভেরিফাইড সাপ্লায়ার</p>
                <p className="text-xl font-bold text-gray-900">{stats?.verified_suppliers || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">অনুমোদিত পণ্য</p>
                <p className="text-xl font-bold text-gray-900">{stats?.approved_products || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiFileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">খোলা RFQ</p>
                <p className="text-xl font-bold text-gray-900">{stats?.open_rfqs || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiDollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">গড় অর্ডার মূল্য</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(stats?.average_order_value || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Health - System status monitoring */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">সিস্টেম হেলথ</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">স্টোরেজ ব্যবহার</span>
                <span className="text-sm font-medium text-gray-900">{systemHealth?.storage_usage?.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${systemHealth?.storage_usage?.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {systemHealth?.storage_usage?.used} / {systemHealth?.storage_usage?.total}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">পেন্ডিং জব</p>
              <p className="text-xl font-bold text-gray-900">{systemHealth?.pending_jobs || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ফেইলড জব</p>
              <p className="text-xl font-bold text-gray-900">{systemHealth?.failed_jobs || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">সর্বশেষ ব্যাকআপ</p>
              <p className="text-xl font-bold text-gray-900">{systemHealth?.last_backup || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Quick Navigation - Common admin actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href={route('admin.suppliers.index')}
            className="bg-white p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition">
                <FiUsers className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">সাপ্লায়ার</p>
                <p className="text-sm text-gray-500">সব সাপ্লায়ার ব্যবস্থাপনা</p>
              </div>
            </div>
          </Link>
          <Link
            href={route('admin.products.index')}
            className="bg-white p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition">
                <FiPackage className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">পণ্য</p>
                <p className="text-sm text-gray-500">সব পণ্য ব্যবস্থাপনা</p>
              </div>
            </div>
          </Link>
          <Link
            href={route('admin.orders.index')}
            className="bg-white p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition">
                <FiShoppingCart className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">অর্ডার</p>
                <p className="text-sm text-gray-500">সব অর্ডার ব্যবস্থাপনা</p>
              </div>
            </div>
          </Link>
          <Link
            href={route('admin.rfqs.index')}
            className="bg-white p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition">
                <FiFileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">RFQ</p>
                <p className="text-sm text-gray-500">সব RFQ ব্যবস্থাপনা</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}