// Pages/Admin/Reports/Financial.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiDownload,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import {
  MdOutlinePayment
} from 'react-icons/md';
import { BsBuilding, BsCreditCard } from 'react-icons/bs';

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
  LineChart,
  Line
} from 'recharts';

export default function Financial({ financialData, period, dateRange }) {
  // State management for selected period
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // Destructure data from props
  const { revenue, payment_stats, monthly_revenue, revenue_by_supplier } = financialData;

  // Colors for charts - Color palette for visualizations
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

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
    router.get(route('admin.reports.financial'), { period: newPeriod }, { preserveState: true });
  };

  // Handle export - Download report in specified format
  const handleExport = (format = 'csv') => {
    window.location.href = route('admin.reports.export', {
      type: 'financial',
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
      <Head title="আর্থিক রিপোর্ট" />

      <div className="space-y-6">
        {/* Header - Page title, period selector and export button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">আর্থিক রিপোর্ট</h1>
            <p className="text-sm text-gray-600 mt-1">
              আয় ও পেমেন্ট কর্মক্ষমতা বিশ্লেষণ করুন
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

        {/* Overview Cards - Key financial metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট আয়</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(revenue.total)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">পরিশোধিত অর্ডার</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{formatNumber(payment_stats.paid)}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">অপরিশোধিত অর্ডার</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{formatNumber(payment_stats.pending)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">পেমেন্ট পদ্ধতি</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{revenue.by_payment_method?.length || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BsCreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid - Data visualization section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Trend - Line chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-indigo-600" />
              মাসিক আয়ের প্রবণতা
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly_revenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#4F46E5" name="আয়" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Method Distribution - Pie chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdOutlinePayment className="w-5 h-5 text-indigo-600" />
              পেমেন্ট পদ্ধতি
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenue.by_payment_method}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ payment_method, percent }) =>
                      `${payment_method || 'অন্যান্য'}: ${(percent * 100).toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="payment_method"
                  >
                    {revenue.by_payment_method?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Supplier */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BsBuilding className="w-5 h-5 text-indigo-600" />
              শীর্ষ সাপ্লায়ার অনুযায়ী আয়
            </h3>
            <div className="space-y-4">
              {revenue_by_supplier.map((supplier, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{supplier.supplier_name}</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(supplier.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Revenue Table - Detailed breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Table header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">মাসিক আয়ের বিবরণ</h3>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">

              {/* Table header */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">মাস</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">আয়</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">মোটের শতাংশ</th>
                </tr>
              </thead>

              {/* Table body */}
              <tbody className="divide-y divide-gray-100">
                {monthly_revenue.map((item, index) => {
                  const percentage = (item.revenue / revenue.total * 100).toFixed(1);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{item.month}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-green-600 font-medium">
                        {formatCurrency(item.revenue)}
                      </td>
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