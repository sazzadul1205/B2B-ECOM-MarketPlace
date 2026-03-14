// Pages/Admin/Orders/Statistics.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head, Link } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiArrowLeft,
  FiShoppingCart,
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiPieChart,
  FiUsers
} from 'react-icons/fi';
import {
  MdOutlinePayment
} from 'react-icons/md';
import { BsBoxSeam } from 'react-icons/bs';

// Recharts - Charting library components for data visualization
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Statistics({ stats }) {
  const { daily, by_status, by_payment, top_products, top_buyers } = stats;

  // Colors for charts - Status based color mapping
  const COLORS = {
    pending_confirmation: '#F59E0B', // Yellow for pending
    confirmed: '#3B82F6',            // Blue for confirmed
    processing: '#8B5CF6',           // Purple for processing
    shipped: '#EC4899',               // Pink for shipped
    delivered: '#10B981',             // Green for delivered
    cancelled: '#EF4444',              // Red for cancelled
    pending: '#F59E0B',               // Yellow for payment pending
    paid: '#10B981'                    // Green for payment paid
  };

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date for chart - Converts ISO date to readable short format
  const formatChartDate = (date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate totals from stats data
  const totalOrders = by_status.reduce((acc, curr) => acc + curr.total, 0);
  const totalRevenue = daily.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <DashboardLayout>
      <Head title="অর্ডার পরিসংখ্যান" />

      <div className="space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center gap-4">
          <Link
            href={route('admin.orders.index')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">অর্ডার পরিসংখ্যান</h1>
            <p className="text-sm text-gray-600 mt-1">
              মার্কেটপ্লেসের সকল অর্ডারের বিস্তারিত পরিসংখ্যান
            </p>
          </div>
        </div>

        {/* Summary Cards - Key metrics overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">মোট অর্ডার</p>
                <p className="text-3xl font-bold mt-1">{totalOrders}</p>
              </div>
              <FiShoppingCart className="w-8 h-8 text-indigo-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">মোট আয়</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
              </div>
              <FiDollarSign className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">গড় অর্ডার মূল্য</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalOrders ? totalRevenue / totalOrders : 0)}
                </p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">বিক্রিত পণ্য</p>
                <p className="text-3xl font-bold mt-1">
                  {top_products.reduce((acc, curr) => acc + curr.total_quantity, 0)}
                </p>
              </div>
              <BsBoxSeam className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
        </div>

        {/* Charts Grid - Data visualization section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Orders & Revenue - Bar chart for 30 days trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-indigo-600" />
              দৈনিক অর্ডার ও আয় (গত ৩০ দিন)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatChartDate} />
                  <YAxis yAxisId="left" orientation="left" stroke="#4F46E5" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'revenue') return formatCurrency(value);
                      return value;
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('bn-BD')}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="total_orders" fill="#4F46E5" name="অর্ডার" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="আয়" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Distribution - Pie chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiPieChart className="w-5 h-5 text-indigo-600" />
              স্ট্যাটাস অনুযায়ী অর্ডার
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={by_status}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="order_status"
                  >
                    {by_status.map((entry) => (
                      <Cell key={`cell-${entry.order_status}`} fill={COLORS[entry.order_status] || '#9CA3AF'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {by_status.map((item) => (
                <div key={item.order_status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {item.order_status === 'pending_confirmation' ? 'অপেক্ষমান' :
                      item.order_status === 'confirmed' ? 'নিশ্চিত' :
                        item.order_status === 'processing' ? 'প্রক্রিয়াধীন' :
                          item.order_status === 'shipped' ? 'পাঠানো হয়েছে' :
                            item.order_status === 'delivered' ? 'ডেলিভারি হয়েছে' :
                              item.order_status === 'cancelled' ? 'বাতিল' : item.order_status.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status Distribution - Pie chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdOutlinePayment className="w-5 h-5 text-indigo-600" />
              পেমেন্ট স্ট্যাটাস অনুযায়ী অর্ডার
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={by_payment}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name === 'pending' ? 'অপেক্ষমান' : 'পরিশোধিত'}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="payment_status"
                  >
                    {by_payment.map((entry) => (
                      <Cell key={`cell-${entry.payment_status}`} fill={COLORS[entry.payment_status] || '#9CA3AF'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {by_payment.map((item) => (
                <div key={item.payment_status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">
                    {item.payment_status === 'pending' ? 'অপেক্ষমান' : 'পরিশোধিত'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products - Most sold products */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BsBoxSeam className="w-5 h-5 text-indigo-600" />
              শীর্ষ ১০ পণ্য
            </h3>
            <div className="space-y-3">
              {top_products.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                      {product.product_name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">{product.total_quantity} বিক্রিত</span>
                    <span className="text-xs text-gray-400 block">{formatCurrency(product.total_revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Buyers - Most valuable customers */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-indigo-600" />
              শীর্ষ ১০ ক্রেতা
            </h3>
            <div className="space-y-3">
              {top_buyers.map((buyer, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">
                        {buyer.buyer?.name}
                      </span>
                      <span className="text-xs text-gray-500">{buyer.order_count} টি অর্ডার</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-indigo-600">
                    {formatCurrency(buyer.total_spent)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Breakdown Table - Detailed status analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">অর্ডার স্ট্যাটাস বিশ্লেষণ</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    সংখ্যা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    শতাংশ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ভিজুয়াল
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {by_status.map((item) => {
                  const percentage = (item.total / totalOrders * 100).toFixed(1);
                  return (
                    <tr key={item.order_status} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="capitalize text-gray-900">
                          {item.order_status === 'pending_confirmation' ? 'অপেক্ষমান' :
                            item.order_status === 'confirmed' ? 'নিশ্চিত' :
                              item.order_status === 'processing' ? 'প্রক্রিয়াধীন' :
                                item.order_status === 'shipped' ? 'পাঠানো হয়েছে' :
                                  item.order_status === 'delivered' ? 'ডেলিভারি হয়েছে' :
                                    item.order_status === 'cancelled' ? 'বাতিল' : item.order_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{item.total}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{percentage}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}