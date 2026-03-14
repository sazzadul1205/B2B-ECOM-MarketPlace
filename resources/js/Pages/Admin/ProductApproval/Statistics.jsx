// Pages/Admin/ProductApproval/Statistics.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head, Link } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiArrowLeft,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiCalendar
} from 'react-icons/fi';
import {
  MdOutlineCategory,
} from 'react-icons/md';
import { BsBuilding, BsGraphUp } from 'react-icons/bs';

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
  Cell
} from 'recharts';

export default function Statistics({ stats }) {
  const { by_category, by_supplier, price_range, weekly_trend } = stats;

  // Colors for charts - Color palette for pie chart segments
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <Head title="পণ্য পরিসংখ্যান" />

      <div className="space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center gap-4">
          <Link
            href={route('admin.product-approval.index')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">পণ্য পরিসংখ্যান</h1>
            <p className="text-sm text-gray-600 mt-1">
              বিচারাধীন পণ্য অনুমোদনের সারসংক্ষেপ
            </p>
          </div>
        </div>

        {/* Price Range Stats - Key price metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">সর্বনিম্ন মূল্য</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">
                  {formatCurrency(price_range.min || 0)}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">সর্বোচ্চ মূল্য</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(price_range.max || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">গড় মূল্য</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {formatCurrency(price_range.avg || 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BsGraphUp className="w-6 h-6 text-purple-600" />
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
                    labelLine={false}
                    label={(entry) => `${entry.category}: ${entry.total}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
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
            <div className="mt-4 space-y-2">
              {by_category.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{item.total}</span>
                    <span className="text-xs text-gray-500">
                      ({Math.round((item.total / by_category.reduce((acc, curr) => acc + curr.total, 0)) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Distribution - Bar chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BsBuilding className="w-5 h-5 text-indigo-600" />
              শীর্ষ সাপ্লায়ার
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={by_supplier}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="supplier.company_name" width={150} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Trend - 30-day submission trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-indigo-600" />
              ৩০ দিনের জমা প্রবণতা
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly_trend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#4F46E5" name="জমা দেওয়া পণ্য" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Cards - Key metrics overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">মোট বিচারাধীন</p>
                <p className="text-3xl font-bold mt-1">{by_category.reduce((acc, curr) => acc + curr.total, 0)}</p>
              </div>
              <FiPackage className="w-8 h-8 text-indigo-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">ক্যাটাগরি</p>
                <p className="text-3xl font-bold mt-1">{by_category.length}</p>
              </div>
              <MdOutlineCategory className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">সক্রিয় সাপ্লায়ার</p>
                <p className="text-3xl font-bold mt-1">{by_supplier.length}</p>
              </div>
              <BsBuilding className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">মূল্য সীমা</p>
                <p className="text-xl font-bold mt-1">
                  {formatCurrency(price_range.min)} - {formatCurrency(price_range.max)}
                </p>
              </div>
              <FiDollarSign className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}