// Pages/Admin/Rfqs/Statistics.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head, Link } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiArrowLeft,
  FiFileText,
  FiTrendingUp,
  FiCalendar,
  FiPieChart,
  FiUsers
} from 'react-icons/fi';
import { BsGraphUp, BsPeople } from 'react-icons/bs';
import { MdOutlineAttachMoney } from 'react-icons/md';

// Recharts - Charting library components for data visualization
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export default function Statistics({ stats }) {
  const { by_status, by_buyer, monthly_trend, response_rate, popular_products } = stats;

  // Colors for charts - Status based color mapping
  const COLORS = {
    open: '#10B981',    // Green for open
    quoted: '#3B82F6',  // Blue for quoted
    closed: '#EF4444'    // Red for closed
  };

  // Format date for chart - Converts month string to readable format
  const formatChartDate = (month) => {
    const [year, monthNum] = month.split('-');
    return new Date(year, monthNum - 1).toLocaleDateString('bn-BD', {
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate totals
  const totalRfqs = by_status.reduce((acc, curr) => acc + curr.total, 0);
  const responseRate = totalRfqs > 0
    ? ((response_rate.with_quotes / totalRfqs) * 100).toFixed(1)
    : 0;

  return (
    <DashboardLayout>
      <Head title="RFQ পরিসংখ্যান" />

      <div className="space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center gap-4">
          <Link
            href={route('admin.rfqs.index')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RFQ পরিসংখ্যান</h1>
            <p className="text-sm text-gray-600 mt-1">
              সকল কোটা অনুরোধের বিস্তারিত পরিসংখ্যান
            </p>
          </div>
        </div>

        {/* Summary Cards - Key metrics overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">মোট RFQ</p>
                <p className="text-3xl font-bold mt-1">{totalRfqs}</p>
              </div>
              <FiFileText className="w-8 h-8 text-indigo-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">প্রতিক্রিয়া হার</p>
                <p className="text-3xl font-bold mt-1">{responseRate}%</p>
              </div>
              <BsGraphUp className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">গড় কোটা/RFQ</p>
                <p className="text-3xl font-bold mt-1">{response_rate.avg_quotes_per_rfq?.toFixed(1) || '0'}</p>
              </div>
              <BsPeople className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">জনপ্রিয় পণ্য</p>
                <p className="text-3xl font-bold mt-1">{popular_products.length}</p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
        </div>

        {/* Charts Grid - Data visualization section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution - Pie chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiPieChart className="w-5 h-5 text-indigo-600" />
              স্ট্যাটাস অনুযায়ী RFQ
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={by_status}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) =>
                      `${status === 'open' ? 'খোলা' :
                        status === 'quoted' ? 'কোটা প্রাপ্ত' :
                          status === 'closed' ? 'বন্ধ' : status}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="status"
                  >
                    {by_status.map((entry) => (
                      <Cell key={`cell-${entry.status}`} fill={COLORS[entry.status] || '#9CA3AF'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {by_status.map((item) => (
                <div key={item.status} className="text-center">
                  <span className="text-2xl font-bold" style={{ color: COLORS[item.status] }}>{item.total}</span>
                  <p className="text-xs text-gray-500 capitalize">
                    {item.status === 'open' ? 'খোলা' :
                      item.status === 'quoted' ? 'কোটা প্রাপ্ত' :
                        item.status === 'closed' ? 'বন্ধ' : item.status}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend - Line chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-indigo-600" />
              মাসিক প্রবণতা (১২ মাস)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly_trend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={formatChartDate} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) => formatChartDate(label)}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#4F46E5" name="RFQ" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Buyers */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-indigo-600" />
              RFQ সংখ্যা অনুযায়ী শীর্ষ ক্রেতা
            </h3>
            <div className="space-y-3">
              {by_buyer.map((buyer, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">
                        {buyer.buyer?.name}
                      </span>
                      <span className="text-xs text-gray-500">গড় পরিমাণ: {Math.round(buyer.avg_quantity)}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-indigo-600">
                    {buyer.total_rfqs} টি RFQ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Products */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdOutlineAttachMoney className="w-5 h-5 text-indigo-600" />
              সর্বাধিক অনুরোধকৃত পণ্য
            </h3>
            <div className="space-y-3">
              {popular_products.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {product.product}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-indigo-600">
                    {product.count} টি অনুরোধ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Response Rate Breakdown - Detailed analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">প্রতিক্রিয়া হার বিশ্লেষণ</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">কোটা সহ RFQ</p>
                <p className="text-2xl font-bold text-green-600">{response_rate.with_quotes}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalRfqs > 0 ? ((response_rate.with_quotes / totalRfqs) * 100).toFixed(1) : 0}% মোটের
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">কোটা ছাড়া RFQ</p>
                <p className="text-2xl font-bold text-yellow-600">{response_rate.without_quotes}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalRfqs > 0 ? ((response_rate.without_quotes / totalRfqs) * 100).toFixed(1) : 0}% মোটের
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">প্রতি RFQ-তে গড় কোটা</p>
                <p className="text-2xl font-bold text-indigo-600">{response_rate.avg_quotes_per_rfq?.toFixed(2) || '0'}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>প্রতিক্রিয়া হার</span>
                <span>{responseRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${responseRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown Table - Detailed status analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">স্ট্যাটাস বিশ্লেষণ</h3>
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
                  const percentage = (item.total / totalRfqs * 100).toFixed(1);
                  return (
                    <tr key={item.status} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="capitalize text-gray-900">
                          {item.status === 'open' ? 'খোলা' :
                            item.status === 'quoted' ? 'কোটা প্রাপ্ত' :
                              item.status === 'closed' ? 'বন্ধ' : item.status}
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