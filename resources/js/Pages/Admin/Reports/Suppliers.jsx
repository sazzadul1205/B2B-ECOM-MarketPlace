// Pages/Admin/Reports/Suppliers.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiUsers,
  FiTrendingUp,
  FiCalendar,
  FiDownload,
  FiCheckCircle,
} from 'react-icons/fi';
import {
  MdVerified,
  MdPending,
  MdOutlineInventory
} from 'react-icons/md';
import { BsBuilding, BsGraphUp } from 'react-icons/bs';

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

export default function Suppliers({ supplierData, period, dateRange }) {
  // State management for selected period
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // Destructure data from props
  const { overview, top_performers, verification_stats, product_stats, performance_trend } = supplierData;

  // Colors for charts - Status based color mapping
  const COLORS = {
    verified: '#10B981',  // Green for verified
    pending: '#F59E0B',   // Yellow for pending
    rejected: '#EF4444'    // Red for rejected
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

  // Format number - Adds thousand separators
  const formatNumber = (num) => {
    return new Intl.NumberFormat('bn-BD').format(num);
  };

  // Handle period change - Update report period
  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    router.get(route('admin.reports.suppliers'), { period: newPeriod }, { preserveState: true });
  };

  // Handle export - Download report in specified format
  const handleExport = (format = 'csv') => {
    window.location.href = route('admin.reports.export', {
      type: 'suppliers',
      format
    });
  };

  // Period options for dropdown
  const periodOptions = [
    { value: 'monthly', label: 'মাসিক' },
    { value: 'quarterly', label: 'ত্রৈমাসিক' },
    { value: 'yearly', label: 'বার্ষিক' },
  ];

  return (
    <DashboardLayout>
      <Head title="সাপ্লায়ার রিপোর্ট" />

      <div className="space-y-6">
        {/* Header - Page title, period selector and export button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">সাপ্লায়ার রিপোর্ট</h1>
            <p className="text-sm text-gray-600 mt-1">
              সাপ্লায়ারদের কর্মক্ষমতা ও ভেরিফিকেশন স্ট্যাটাস বিশ্লেষণ করুন
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <FiDownload className="w-4 h-4" />
              <span>এক্সপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Date Range Display */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center gap-2 text-indigo-700">
          <FiCalendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            রিপোর্ট সময়কাল: {new Date(dateRange.start).toLocaleDateString('bn-BD')} - {new Date(dateRange.end).toLocaleDateString('bn-BD')}
          </span>
        </div>

        {/* Overview Cards - Key supplier metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট সাপ্লায়ার</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{formatNumber(overview.total)}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <BsBuilding className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ভেরিফাইড</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatNumber(overview.verified)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MdVerified className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">বিচারাধীন</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{formatNumber(overview.pending)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <MdPending className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">সক্রিয় অ্যাকাউন্ট</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{formatNumber(overview.active)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid - Data visualization section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verification Status - Pie chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5 text-indigo-600" />
              ভেরিফিকেশন স্ট্যাটাস
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verification_stats}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ verification_status, percent }) =>
                      `${verification_status === 'verified' ? 'ভেরিফাইড' :
                        verification_status === 'pending' ? 'বিচারাধীন' :
                          verification_status === 'rejected' ? 'প্রত্যাখ্যাত' : verification_status}: ${(percent * 100).toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="verification_status"
                  >
                    {verification_stats.map((entry) => (
                      <Cell
                        key={`cell-${entry.verification_status}`}
                        fill={COLORS[entry.verification_status] || '#9CA3AF'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Trend - Line chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-indigo-600" />
              কর্মক্ষমতার প্রবণতা
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performance_trend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="active_suppliers"
                    stroke="#4F46E5"
                    name="সক্রিয় সাপ্লায়ার"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="total_revenue"
                    stroke="#10B981"
                    name="আয়"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BsGraphUp className="w-5 h-5 text-indigo-600" />
              শীর্ষ কর্মক্ষম সাপ্লায়ার
            </h3>
            <div className="space-y-4">
              {top_performers.map((supplier, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{supplier.company_name}</p>
                      <p className="text-xs text-gray-500">{supplier.products_count} টি পণ্য</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(supplier.total_revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Stats */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdOutlineInventory className="w-5 h-5 text-indigo-600" />
              সাপ্লায়ার পণ্য পরিসংখ্যান
            </h3>
            <div className="space-y-4">
              {product_stats.slice(0, 10).map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stat.company_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-green-600">{stat.approved_products} অনুমোদিত</span>
                      <span className="text-xs text-yellow-600">{stat.pending_products} বিচারাধীন</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-indigo-600">
                    {stat.total_products} মোট
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supplier Details Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">সাপ্লায়ারের বিবরণ</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">কোম্পানি</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">যোগাযোগ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">পণ্য</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">আয়</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {top_performers.map((supplier, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{supplier.company_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{supplier.contact_name}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">{formatNumber(supplier.products_count)}</td>
                    <td className="px-6 py-4 text-right text-green-600 font-medium">
                      {formatCurrency(supplier.total_revenue)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        সক্রিয়
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}