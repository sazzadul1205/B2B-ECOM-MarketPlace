// Pages/Admin/Reports/Rfqs.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiFileText,
  FiTrendingUp,
  FiCalendar,
  FiDownload,
  FiBarChart2,
  FiClock,
} from 'react-icons/fi';
import {
  MdVerified,
  MdPending,
  MdWarning,
} from 'react-icons/md';

// Recharts - Charting library components for data visualization
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Rfqs({ rfqData, period, dateRange }) {
  // State management for selected period
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // Destructure data from props
  const { overview, by_status, conversion_rate, response_time } = rfqData;

  // Colors for charts - Status based color mapping
  const COLORS = {
    open: '#10B981',    // Green for open
    quoted: '#3B82F6',  // Blue for quoted
    closed: '#EF4444'    // Red for closed
  };

  // Format number - Adds thousand separators
  const formatNumber = (num) => {
    return new Intl.NumberFormat('bn-BD').format(num);
  };

  // Handle period change - Update report period
  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    router.get(route('admin.reports.rfqs'), { period: newPeriod }, { preserveState: true });
  };

  // Handle export - Download report in specified format
  const handleExport = (format = 'csv') => {
    window.location.href = route('admin.reports.export', {
      type: 'rfqs',
      format,
      period: selectedPeriod,
      date_from: dateRange.start,
      date_to: dateRange.end
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
      <Head title="RFQ রিপোর্ট" />

      <div className="space-y-6">
        {/* Header - Page title, period selector and export button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RFQ রিপোর্ট</h1>
            <p className="text-sm text-gray-600 mt-1">
              কোটা অনুরোধের কার্যকলাপ বিশ্লেষণ করুন
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

        {/* Overview Cards - Key RFQ metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট RFQ</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{formatNumber(overview.total)}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiFileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">খোলা RFQ</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatNumber(overview.open)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MdPending className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">কোটা প্রাপ্ত</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{formatNumber(overview.quoted)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <MdVerified className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">বন্ধ</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{formatNumber(overview.closed)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <MdWarning className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid - Data visualization section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution - Pie chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiBarChart2 className="w-5 h-5 text-indigo-600" />
              স্ট্যাটাস অনুযায়ী RFQ
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={by_status}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ status, percent }) =>
                      `${status === 'open' ? 'খোলা' :
                        status === 'quoted' ? 'কোটা প্রাপ্ত' :
                          status === 'closed' ? 'বন্ধ' : status}: ${(percent * 100).toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="status"
                  >
                    {by_status.map((entry) => (
                      <Cell
                        key={`cell-${entry.status}`}
                        fill={COLORS[entry.status] || '#9CA3AF'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversion Rate - Circular progress */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-indigo-600" />
              রূপান্তর হার
            </h3>
            <div className="text-center">
              <div className="relative inline-flex">
                <svg className="w-32 h-32">
                  <circle
                    className="text-gray-200"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-indigo-600"
                    strokeWidth="5"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - conversion_rate.rate / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-indigo-600">
                  {conversion_rate.rate}%
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">মোট RFQ</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(conversion_rate.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">রূপান্তরিত</p>
                  <p className="text-xl font-bold text-green-600">{formatNumber(conversion_rate.converted)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiClock className="w-5 h-5 text-indigo-600" />
              গড় প্রতিক্রিয়া সময়
            </h3>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-indigo-600">
                  {response_time ? Math.round(response_time) : 0}
                </div>
                <p className="text-lg text-gray-500 mt-2">ঘন্টা</p>
                <p className="text-sm text-gray-400 mt-1">RFQ তৈরি থেকে প্রথম কোটা পর্যন্ত গড় সময়</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown Table - Detailed analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">স্ট্যাটাস বিশ্লেষণ</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">সংখ্যা</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">শতাংশ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {by_status.map((item) => {
                  const percentage = (item.total / overview.total * 100).toFixed(1);
                  return (
                    <tr key={item.status} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="capitalize font-medium text-gray-900">
                          {item.status === 'open' ? 'খোলা' :
                            item.status === 'quoted' ? 'কোটা প্রাপ্ত' :
                              item.status === 'closed' ? 'বন্ধ' : item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">{formatNumber(item.total)}</td>
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