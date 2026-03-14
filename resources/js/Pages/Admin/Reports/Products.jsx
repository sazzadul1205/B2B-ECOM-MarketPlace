// Pages/Admin/Reports/Products.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiPackage,
  FiTrendingUp,
  FiDownload,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  MdPending,
  MdOutlineCategory,
  MdOutlineAttachMoney
} from 'react-icons/md';

// Recharts - Charting library components for data visualization
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Products({ productData }) {
  // Destructure data from props
  const { inventory, top_selling, by_category, price_distribution } = productData;

  // Colors for charts - Color palette for visualizations
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number - Adds thousand separators
  const formatNumber = (num) => {
    return new Intl.NumberFormat('bn-BD').format(num);
  };

  // Handle export - Download report in specified format
  const handleExport = (format = 'csv') => {
    window.location.href = route('admin.reports.export', {
      type: 'products',
      format
    });
  };

  return (
    <DashboardLayout>
      <Head title="পণ্য রিপোর্ট" />

      <div className="space-y-6">
        {/* Header - Page title and export button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">পণ্য রিপোর্ট</h1>
            <p className="text-sm text-gray-600 mt-1">
              পণ্যের মজুত ও বিক্রয় কর্মক্ষমতা বিশ্লেষণ করুন
            </p>
          </div>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <FiDownload className="w-4 h-4" />
            <span>এক্সপোর্ট</span>
          </button>
        </div>

        {/* Inventory Overview Cards - Key inventory metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট পণ্য</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{formatNumber(inventory.total_products)}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট মজুত মূল্য</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(inventory.total_value)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MdOutlineAttachMoney className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">স্টকে নেই</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{formatNumber(inventory.out_of_stock)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">স্টক কম</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{formatNumber(inventory.low_stock)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <MdPending className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid - Data visualization section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution - Pie chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdOutlineCategory className="w-5 h-5 text-indigo-600" />
              ক্যাটাগরি অনুযায়ী পণ্য
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={by_category}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="category"
                  >
                    {by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Price Distribution - Bar chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdOutlineAttachMoney className="w-5 h-5 text-indigo-600" />
              মূল্য বণ্টন
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { range: '< ১ লক্ষ', count: price_distribution.under_100k },
                    { range: '১-৫ লক্ষ', count: price_distribution['100k_500k'] },
                    { range: '৫-১০ লক্ষ', count: price_distribution['500k_1m'] },
                    { range: '১০-৫০ লক্ষ', count: price_distribution['1m_5m'] },
                    { range: '> ৫০ লক্ষ', count: price_distribution.above_5m },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" name="পণ্য" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">

            {/* Header */}
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-indigo-600" />
              সর্বাধিক বিক্রিত পণ্য
            </h3>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table header */}
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ক্রম</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">পণ্য</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">বিক্রিত পরিমাণ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">আয়</th>
                  </tr>
                </thead>

                {/* Table body */}
                <tbody className="divide-y divide-gray-100">
                  {top_selling.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                            index === 2 ? 'bg-orange-100 text-orange-600' :
                              'bg-indigo-50 text-indigo-600'
                          }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{product.product_name}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">{formatNumber(product.total_quantity)}</td>
                      <td className="px-6 py-4 text-right text-green-600 font-medium">
                        {formatCurrency(product.total_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Category Details - Detailed breakdown table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">ক্যাটাগরির বিবরণ</h3>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">

              {/* Table Header */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ক্যাটাগরি</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">পণ্যের সংখ্যা</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">মোটের শতাংশ</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100">
                {by_category.map((item, index) => {
                  const percentage = (item.count / inventory.total_products * 100).toFixed(1);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">{formatNumber(item.count)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm text-gray-600">{percentage}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
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