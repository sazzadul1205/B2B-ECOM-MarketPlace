// Pages/Supplier/Analytics/Sales.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiDownload,
} from 'react-icons/fi';

// Recharts - Charting library components for data visualization
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function SalesAnalytics({
  summary,
  dateRange,
  topProducts,
  salesByBuyer,
  salesByPeriod,
  paymentMethods,
  salesByCategory,
  geoDistribution,
}) {
  // State management for period selection and custom date range
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(dateRange.period);

  // State management for custom date range
  const [customDateFrom, setCustomDateFrom] = useState(
    dateRange.start ? new Date(dateRange.start).toISOString().split('T')[0] : ''
  );
  const [customDateTo, setCustomDateTo] = useState(
    dateRange.end ? new Date(dateRange.end).toISOString().split('T')[0] : ''
  );

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

  // Format percentage with sign
  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Format date for display
  const formatDateLabel = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date for API parameters
  const formatDateParam = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  // Chart colors - Color palette for visualizations
  const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Process sales by period data safely
  const safeSalesByPeriod = Array.isArray(salesByPeriod)
    ? salesByPeriod
    : Object.values(salesByPeriod || {});

  // Process category data for pie chart
  const categoryData = Array.isArray(salesByCategory)
    ? salesByCategory.map((item) => ({
      name: item.category || item.name || 'অশ্রেণিকৃত',
      value: Number(item.revenue || item.value || 0)
    }))
    : Object.entries(salesByCategory || {}).map(([category, data]) => ({
      name: category,
      value: Number(data?.revenue || 0)
    }));

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (period !== 'custom') {
      router.get(route('supplier.analytics.sales'), { period }, {
        preserveState: true,
        replace: true
      });
    } else {
      setShowDatePicker(true);
    }
  };

  // Apply custom date range
  const applyCustomRange = () => {
    if (customDateFrom && customDateTo) {
      router.get(route('supplier.analytics.sales'), {
        period: 'custom',
        date_from: customDateFrom,
        date_to: customDateTo
      }, {
        preserveState: true,
        replace: true
      });
      setShowDatePicker(false);
    }
  };

  // Handle export functionality
  const handleExport = (type) => {
    const params = new URLSearchParams({
      type,
      format: 'csv',
      date_from: formatDateParam(dateRange.start),
      date_to: formatDateParam(dateRange.end)
    });
    window.location.href = route('supplier.analytics.export') + '?' + params.toString();
  };

  return (
    <DashboardLayout>
      <Head title="বিক্রয় বিশ্লেষণ" />

      <div className="space-y-6">
        {/* Header - Page title and export button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">বিক্রয় বিশ্লেষণ</h1>
            <p className="text-sm text-gray-600 mt-1">
              আপনার বিক্রয় কর্মক্ষমতা এবং আয়ের মেট্রিক্স ট্র্যাক করুন
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('sales')}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
            >
              <FiDownload className="w-4 h-4" />
              <span>রিপোর্ট এক্সপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">সময়কাল:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['week', 'month', 'quarter', 'year', 'custom'].map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedPeriod === period
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {period === 'week' ? 'সপ্তাহ' :
                    period === 'month' ? 'মাস' :
                      period === 'quarter' ? 'ত্রৈমাসিক' :
                        period === 'year' ? 'বছর' : 'কাস্টম'}
                </button>
              ))}
            </div>
            <div className="ml-auto text-sm text-gray-500">
              {formatDateLabel(dateRange.start)} - {formatDateLabel(dateRange.end)}
            </div>
          </div>

          {/* Custom Date Picker */}
          {showDatePicker && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    থেকে তারিখ
                  </label>
                  <input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    পর্যন্ত তারিখ
                  </label>
                  <input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={applyCustomRange}
                  disabled={!customDateFrom || !customDateTo}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  প্রয়োগ
                </button>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  বাতিল
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards - Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90">মোট আয়</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(summary.total_revenue)}</p>
            <div className="mt-2 flex items-center text-sm">
              {summary.revenue_growth >= 0 ? (
                <>
                  <FiTrendingUp className="w-4 h-4 mr-1" />
                  <span>{formatPercentage(summary.revenue_growth)}</span>
                </>
              ) : (
                <>
                  <FiTrendingDown className="w-4 h-4 mr-1" />
                  <span>{formatPercentage(summary.revenue_growth)}</span>
                </>
              )}
              <span className="ml-2 opacity-75">গত সময়ের তুলনায়</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">মোট অর্ডার</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.total_orders)}</p>
            <div className="mt-2 flex items-center text-sm">
              {summary.orders_growth >= 0 ? (
                <span className="text-green-600">↑ {formatPercentage(summary.orders_growth)}</span>
              ) : (
                <span className="text-red-600">↓ {formatPercentage(summary.orders_growth)}</span>
              )}
              <span className="ml-2 text-gray-400">গত সময়ের তুলনায়</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">গড় অর্ডার মূল্য</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.average_order_value)}</p>
            <div className="mt-2 flex items-center text-sm">
              {summary.aov_growth >= 0 ? (
                <span className="text-green-600">↑ {formatPercentage(summary.aov_growth)}</span>
              ) : (
                <span className="text-red-600">↓ {formatPercentage(summary.aov_growth)}</span>
              )}
              <span className="ml-2 text-gray-400">গত সময়ের তুলনায়</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">বিক্রিত পণ্য</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.total_items_sold)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">স্বতন্ত্র ক্রেতা</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.unique_customers)}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend - Area chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">আয়ের প্রবণতা</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={safeSalesByPeriod}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(value) => `৳${value / 1000}K`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
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

          {/* Orders Trend - Bar chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">অর্ডারের প্রবণতা</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={safeSalesByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    formatter={(value) => formatNumber(value)}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
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

          {/* Sales by Category - Pie chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ক্যাটাগরি অনুযায়ী বিক্রয়</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
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

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">শীর্ষ পণ্য</h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-medium text-indigo-600">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatNumber(product.total_quantity_sold)} ইউনিট · {product.order_count} অর্ডার
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">{formatCurrency(product.total_revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Buyers Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">শীর্ষ ক্রেতা</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ক্রেতা</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">অর্ডার</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">মোট ব্যয়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesByBuyer.map((buyer) => (
                    <tr key={buyer.buyer_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{buyer.buyer?.name}</p>
                          <p className="text-xs text-gray-500">{buyer.buyer?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{buyer.order_count}</td>
                      <td className="px-4 py-3 text-right font-bold text-indigo-600">
                        {formatCurrency(buyer.total_spent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">পেমেন্ট পদ্ধতি</h2>
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={method.payment_status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {method.payment_status === 'paid' ? 'পরিশোধিত' : 'অপেক্ষমান'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(method.total)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${method.payment_status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ width: `${(method.total / paymentMethods.reduce((sum, m) => sum + m.total, 0)) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{method.count} টি লেনদেন</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographical Distribution */}
        {geoDistribution.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ভৌগোলিক বণ্টন</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {geoDistribution.map((location) => (
                <div key={location.city} className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{location.city || 'অজানা'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">{location.order_count} অর্ডার</span>
                    <span className="font-bold text-indigo-600">{formatCurrency(location.total_spent)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}