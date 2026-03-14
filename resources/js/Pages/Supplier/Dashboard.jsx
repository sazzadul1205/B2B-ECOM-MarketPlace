// Pages/Supplier/Dashboard.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head, Link } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiPackage,
  FiShoppingCart,
  FiFileText,
  FiMessageSquare,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiDownload,
  FiRefreshCw,
  FiTruck,
  FiBarChart2
} from 'react-icons/fi';
import { MdWarning } from 'react-icons/md';

// Recharts - Charting library components for data visualization
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function SupplierDashboard({
  counts,
  chart_data,
  recent_rfqs,
  top_products,
  recent_orders,
  sales_analytics,
  recent_messages,
  low_stock_alerts,
  quote_performance,
  upcoming_deliveries,
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

  // Format number - Adds thousand separators
  const formatNumber = (value) => {
    return new Intl.NumberFormat('bn-BD').format(value);
  };

  // Get status color based on status type
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      pending_confirmation: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-yellow-100 text-yellow-800',
      open: 'bg-blue-100 text-blue-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Chart colors - Color palette for pie chart segments
  const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <DashboardLayout>
      <Head title="সাপ্লায়ার ড্যাশবোর্ড" />

      <div className="space-y-6">
        {/* Header - Page title and action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">সাপ্লায়ার ড্যাশবোর্ড</h1>
            <p className="text-sm text-gray-600 mt-1">
              স্বাগতম! আপনার ব্যবসার কর্মক্ষমতার সারসংক্ষেপ এখানে দেওয়া হল।
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.href = route('supplier.dashboard.export')}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
            >
              <FiDownload className="w-4 h-4" />
              <span>রিপোর্ট এক্সপোর্ট</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>রিফ্রেশ</span>
            </button>
          </div>
        </div>

        {/* Welcome Banner with Unread Messages Alert */}
        {counts?.unreadMessages > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiMessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-blue-700">
                  আপনার <span className="font-bold">{counts.unreadMessages}</span> টি অপঠিত বার্তা রয়েছে।
                  <Link href={route('supplier.messages.index')} className="ml-2 font-medium underline text-blue-700 hover:text-blue-600">
                    বার্তা দেখুন →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">মাসিক আয়</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(counts?.monthlyRevenue || 0)}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FiDollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="opacity-90">মোট আয়</span>
              <span className="ml-2 font-bold">
                {formatCurrency(counts?.totalRevenue || 0)}
              </span>
            </div>
            {sales_analytics?.growth?.revenue !== undefined && (
              <div className="mt-2 flex items-center text-xs">
                {sales_analytics.growth.revenue >= 0 ? (
                  <>
                    <FiTrendingUp className="w-3 h-3 mr-1" />
                    <span>{Math.round(sales_analytics.growth.revenue)}% গত সময়ের তুলনায়</span>
                  </>
                ) : (
                  <>
                    <FiTrendingDown className="w-3 h-3 mr-1" />
                    <span>{Math.abs(Math.round(sales_analytics.growth.revenue))}% গত সময়ের তুলনায়</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Orders Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">মোট অর্ডার</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(counts?.totalOrders || 0)}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FiShoppingCart className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="opacity-90">অপেক্ষমান</span>
                <p className="font-bold">{counts?.pendingOrders || 0}</p>
              </div>
              <div>
                <span className="opacity-90">প্রক্রিয়াধীন</span>
                <p className="font-bold">{counts?.processingOrders || 0}</p>
              </div>
              <div>
                <span className="opacity-90">ডেলিভারি হয়েছে</span>
                <p className="font-bold">{counts?.deliveredOrders || 0}</p>
              </div>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">সক্রিয় পণ্য</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(counts?.activeProducts || 0)}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FiPackage className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-xs">
              <div>
                <span className="opacity-90">মোট</span>
                <p className="font-bold">{counts?.totalProducts || 0}</p>
              </div>
              <div>
                <span className="opacity-90">বিচারাধীন</span>
                <p className="font-bold">{counts?.pendingProducts || 0}</p>
              </div>
              <div>
                <span className="opacity-90">স্টক কম</span>
                <p className="font-bold">{low_stock_alerts?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Quotes Card */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-90">কোটা কর্মক্ষমতা</p>
                <p className="text-2xl font-bold mt-1">{Math.round(quote_performance?.acceptanceRate || 0)}%</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FiFileText className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-xs">
              <div>
                <span className="opacity-90">গৃহীত</span>
                <p className="font-bold">{quote_performance?.acceptedQuotes || 0}</p>
              </div>
              <div>
                <span className="opacity-90">অপেক্ষমান</span>
                <p className="font-bold">{quote_performance?.pendingQuotes || 0}</p>
              </div>
              <div>
                <span className="opacity-90">মোট</span>
                <p className="font-bold">{quote_performance?.totalQuotes || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {low_stock_alerts?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-yellow-50 border-b border-yellow-100">
              <div className="flex items-center gap-2">
                <MdWarning className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">স্টক কম সতর্কতা ({low_stock_alerts.length})</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {low_stock_alerts.map((product) => (
                <div key={product.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <FiPackage className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <Link href={route('supplier.products.edit', product.id)} className="font-medium text-gray-900 hover:text-indigo-600">
                          {product.name}
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span>SKU: {product.sku}</span>
                          <span>•</span>
                          <span>স্টক: {product.stock_quantity} ইউনিট</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={route('supplier.products.edit', product.id)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition"
                    >
                      স্টক আপডেট
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend - Line chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">বিক্রয় প্রবণতা</h3>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded">দৈনিক</span>
              </div>
            </div>
            <div className="h-80 w-full min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart_data?.daily_sales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(date) => {
                      return new Date(date).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'revenue') return formatCurrency(value);
                      return value;
                    }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="আয়"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    name="অর্ডার"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders by Status - Pie chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">স্ট্যাটাস অনুযায়ী অর্ডার</h3>
            <div className="h-80 w-full min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(chart_data?.orders_by_status || {}).map(([name, value]) => ({
                      name: name === 'pending_confirmation' ? 'অপেক্ষমান' :
                        name === 'confirmed' ? 'নিশ্চিত' :
                          name === 'processing' ? 'প্রক্রিয়াধীন' :
                            name === 'shipped' ? 'পাঠানো হয়েছে' :
                              name === 'delivered' ? 'ডেলিভারি হয়েছে' :
                                name === 'cancelled' ? 'বাতিল' : name.replace('_', ' ').toUpperCase(),
                      value
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.entries(chart_data?.orders_by_status || {}).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatNumber(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders & RFQs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">সাম্প্রতিক অর্ডার</h3>
                    <p className="text-sm text-gray-500">সর্বশেষ ১০ টি অর্ডার</p>
                  </div>
                </div>
                <Link
                  href={route('supplier.orders.index')}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recent_orders?.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <Link href={route('supplier.orders.show', order.id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.buyer?.name}</p>
                          <p className="text-xs text-gray-500">{order.items?.length} টি আইটেম</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.order_status)}`}>
                          {order.order_status === 'pending_confirmation' ? 'অপেক্ষমান' :
                            order.order_status === 'confirmed' ? 'নিশ্চিত' :
                              order.order_status === 'processing' ? 'প্রক্রিয়াধীন' :
                                order.order_status === 'shipped' ? 'পাঠানো হয়েছে' :
                                  order.order_status === 'delivered' ? 'ডেলিভারি হয়েছে' :
                                    order.order_status === 'cancelled' ? 'বাতিল' : order.order_status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('bn-BD')}
                      </td>
                    </tr>
                  ))}
                  {(!recent_orders || recent_orders.length === 0) && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        কোনো সাম্প্রতিক অর্ডার পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matching RFQs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiFileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">মিলে যাওয়া RFQ</h3>
                    <p className="text-sm text-gray-500">আপনার পণ্যের সাথে মিলে যাওয়া খোলা RFQ</p>
                  </div>
                </div>
                <Link
                  href={route('supplier.rfqs.index')}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">শেষ তারিখ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recent_rfqs?.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <Link href={route('supplier.rfqs.show', rfq.id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
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
                        {rfq.buyer?.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${new Date(rfq.required_by_date) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                          {new Date(rfq.required_by_date).toLocaleDateString('bn-BD')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={route('supplier.rfqs.create-quote', rfq.id)}
                          className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 transition"
                        >
                          কোটা জমা দিন
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!recent_rfqs || recent_rfqs.length === 0) && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        কোনো মিলে যাওয়া RFQ পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Products & Upcoming Deliveries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiBarChart2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">শীর্ষ বিক্রিত পণ্য</h3>
                  <p className="text-sm text-gray-500">এই মাসের সেরা পারফর্মার</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {top_products?.map((product, index) => (
                <div key={product.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-medium text-indigo-600">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <Link href={route('supplier.products.edit', product.id)} className="font-medium text-gray-900 hover:text-indigo-600">
                          {product.name}
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>বিক্রি: {formatNumber(product.total_quantity_sold || 0)} ইউনিট</span>
                          <span>আয়: {formatCurrency(product.total_revenue || 0)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${Math.min((product.total_quantity_sold || 0) / (top_products[0]?.total_quantity_sold || 1) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!top_products || top_products.length === 0) && (
                <div className="p-8 text-center text-gray-500">
                  কোনো বিক্রয় তথ্য পাওয়া যায়নি
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Deliveries */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiTruck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">আসন্ন ডেলিভারি</h3>
                  <p className="text-sm text-gray-500">পরবর্তী ৭ দিনের জন্য নির্ধারিত</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {upcoming_deliveries?.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiTruck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <Link href={route('supplier.orders.show', order.id)} className="font-medium text-gray-900 hover:text-indigo-600">
                          অর্ডার #{order.order_number}
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span>{order.buyer?.name}</span>
                          <span>•</span>
                          <span>আনু: {new Date(order.estimated_delivery).toLocaleDateString('bn-BD')}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.order_status)}`}>
                      {order.order_status === 'pending_confirmation' ? 'অপেক্ষমান' :
                        order.order_status === 'confirmed' ? 'নিশ্চিত' :
                          order.order_status === 'processing' ? 'প্রক্রিয়াধীন' :
                            order.order_status === 'shipped' ? 'পাঠানো হয়েছে' :
                              order.order_status === 'delivered' ? 'ডেলিভারি হয়েছে' :
                                order.order_status === 'cancelled' ? 'বাতিল' : order.order_status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
              {(!upcoming_deliveries || upcoming_deliveries.length === 0) && (
                <div className="p-8 text-center text-gray-500">
                  কোনো আসন্ন ডেলিভারি নেই
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Messages & Quote Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Messages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FiMessageSquare className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">সাম্প্রতিক বার্তা</h3>
                    <p className="text-sm text-gray-500">সর্বশেষ কথোপকথন</p>
                  </div>
                </div>
                <Link
                  href={route('supplier.messages.index')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  সব দেখুন →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recent_messages?.map((message) => (
                <div key={message.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-indigo-600">
                        {message.sender?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {message.sender?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(message.created_at).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">{message.content}</p>
                      {!message.is_read && message.receiver_id === counts?.userId && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                          নতুন
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!recent_messages || recent_messages.length === 0) && (
                <div className="p-8 text-center text-gray-500">
                  কোনো বার্তা নেই
                </div>
              )}
            </div>
          </div>

          {/* Quote Performance Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">কোটা কর্মক্ষমতা</h3>
            <div className="space-y-4">
              {/* Acceptance Rate */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">গ্রহণের হার</span>
                  <span className="font-medium text-gray-900">{Math.round(quote_performance?.acceptanceRate || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${quote_performance?.acceptanceRate || 0}%` }}
                  />
                </div>
              </div>

              {/* Quote Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">মোট কোটা</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(quote_performance?.totalQuotes || 0)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">গৃহীত</p>
                  <p className="text-xl font-bold text-green-600">{formatNumber(quote_performance?.acceptedQuotes || 0)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">অপেক্ষমান</p>
                  <p className="text-xl font-bold text-yellow-600">{formatNumber(quote_performance?.pendingQuotes || 0)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">প্রত্যাখ্যাত</p>
                  <p className="text-xl font-bold text-red-600">{formatNumber(quote_performance?.rejectedQuotes || 0)}</p>
                </div>
              </div>

              {/* Average Response Time */}
              {quote_performance?.averageResponseTime && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-600">গড় প্রতিক্রিয়া সময়</p>
                      <p className="text-2xl font-bold text-indigo-700">
                        {Math.round(quote_performance.averageResponseTime)} ঘন্টা
                      </p>
                    </div>
                    <FiClock className="w-8 h-8 text-indigo-400" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href={route('supplier.products.index')}
            className="bg-white p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition">
                <FiPackage className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">পণ্য</p>
                <p className="text-sm text-gray-500">ইনভেন্টরি পরিচালনা</p>
              </div>
            </div>
          </Link>
          <Link
            href={route('supplier.orders.index')}
            className="bg-white p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition">
                <FiShoppingCart className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">অর্ডার</p>
                <p className="text-sm text-gray-500">অর্ডার প্রক্রিয়াকরণ</p>
              </div>
            </div>
          </Link>
          <Link
            href={route('supplier.rfqs.index')}
            className="bg-white p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition">
                <FiFileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">RFQ</p>
                <p className="text-sm text-gray-500">কোটা জমা দিন</p>
              </div>
            </div>
          </Link>
          <Link
            href={route('supplier.messages.index')}
            className="bg-white p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition">
                <FiMessageSquare className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">বার্তা</p>
                <p className="text-sm text-gray-500">
                  {counts?.unreadMessages > 0 && (
                    <span className="text-red-500">{counts.unreadMessages} অপঠিত</span>
                  )}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}