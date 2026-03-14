// Pages/Supplier/Analytics/Quotes.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiCheckCircle,
  FiCalendar,
  FiDownload,
} from 'react-icons/fi';

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
  Cell,
  Legend
} from 'recharts';

export default function QuotesAnalytics({
  dateRange,
  totalQuotes,
  pendingQuotes,
  expiredQuotes,
  acceptedValue,
  quotesByMonth,
  quotesByBuyer,
  rejectedQuotes,
  acceptedQuotes,
  conversionRate,
  avgResponseDays,
  totalQuoteValue,
  avgResponseHours,
  valueDistribution,
  revenueFromQuotes,
  successByResponseTime,
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

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
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

  // Handle export functionality
  const handleExport = () => {
    const params = new URLSearchParams({
      type: 'quotes',
      format: 'csv',
      date_from: formatDateParam(dateRange.start),
      date_to: formatDateParam(dateRange.end)
    });
    window.location.href = route('supplier.analytics.export') + '?' + params.toString();
  };

  // Prepare data for status pie chart (filter out zero values)
  const statusData = [
    { name: 'গৃহীত', value: acceptedQuotes, color: '#10B981' },
    { name: 'অপেক্ষমান', value: pendingQuotes, color: '#F59E0B' },
    { name: 'প্রত্যাখ্যাত', value: rejectedQuotes, color: '#EF4444' },
    { name: 'মেয়াদোত্তীর্ণ', value: expiredQuotes, color: '#6B7280' }
  ].filter(item => item.value > 0);

  return (
    <DashboardLayout>
      <Head title="কোটা বিশ্লেষণ" />

      <div className="space-y-6">
        {/* Header - Page title and export button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">কোটা বিশ্লেষণ</h1>
            <p className="text-sm text-gray-600 mt-1">
              আপনার কোটা কর্মক্ষমতা এবং রূপান্তর মেট্রিক্স ট্র্যাক করুন
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
          >
            <FiDownload className="w-4 h-4" />
            <span>রিপোর্ট এক্সপোর্ট</span>
          </button>
        </div>

        {/* Period Info - Date range display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiCalendar className="w-4 h-4" />
            <span>সময়কাল: {formatDateLabel(dateRange.start)} - {formatDateLabel(dateRange.end)}</span>
          </div>
        </div>

        {/* Summary Cards - Key quote metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90">মোট কোটা</p>
            <p className="text-2xl font-bold mt-1">{formatNumber(totalQuotes)}</p>
            <p className="text-sm opacity-75 mt-2">মূল্য: {formatCurrency(totalQuoteValue)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">রূপান্তর হার</p>
            <p className="text-2xl font-bold text-gray-900">{formatPercentage(conversionRate)}</p>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <FiCheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">{acceptedQuotes} গৃহীত</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">গড় প্রতিক্রিয়া সময়</p>
            <p className="text-2xl font-bold text-gray-900">{avgResponseHours.toFixed(1)} ঘন্টা</p>
            <p className="text-sm text-gray-500 mt-2">({avgResponseDays.toFixed(1)} দিন)</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">কোটা থেকে আয়</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(revenueFromQuotes)}</p>
            <p className="text-sm text-gray-500 mt-2">গৃহীত মূল্য: {formatCurrency(acceptedValue)}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution - Pie chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">কোটা স্ট্যাটাস বণ্টন</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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

          {/* Monthly Trend - Bar chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">মাসিক কোটা প্রবণতা</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(quotesByMonth).map(([month, data]) => ({
                  month,
                  total: data.total,
                  accepted: data.accepted
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    formatter={(value) => formatNumber(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" name="মোট কোটা" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="accepted" name="গৃহীত" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Success Rate by Response Time */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">প্রতিক্রিয়া সময় অনুযায়ী সাফল্যের হার</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(successByResponseTime).map(([time, rate]) => ({
                  time,
                  rate
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="time" stroke="#6B7280" fontSize={12} />
                  <YAxis
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value) => `${value.toFixed(1)}%`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="rate" name="সাফল্যের হার" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              ২৪ ঘন্টার মধ্যে প্রতিক্রিয়া জানানো কোটা সর্বোচ্চ সাফল্যের হার পায়
            </p>
          </div>

          {/* Value Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">কোটা মূল্য বণ্টন</h2>
            <div className="space-y-4">
              {Object.entries(valueDistribution).map(([range, data]) => (
                <div key={range}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{range}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{data.count} কোটা</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({data.rate.toFixed(1)}% গৃহীত)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${(data.count / totalQuotes) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Buyers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">কোটা কার্যকলাপ অনুযায়ী শীর্ষ ক্রেতা</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ক্রেতা</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">মোট কোটা</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">গৃহীত</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">প্রত্যাখ্যাত</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">অপেক্ষমান</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">মোট মূল্য</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">গৃহীত মূল্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.values(quotesByBuyer).map((buyer) => (
                  <tr key={buyer.buyer?.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{buyer.buyer?.name}</p>
                        <p className="text-xs text-gray-500">{buyer.buyer?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{buyer.total_quotes}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">{buyer.accepted}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">{buyer.rejected}</td>
                    <td className="px-4 py-3 text-right text-yellow-600 font-medium">{buyer.pending}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(buyer.total_value)}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(buyer.accepted_value)}</td>
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