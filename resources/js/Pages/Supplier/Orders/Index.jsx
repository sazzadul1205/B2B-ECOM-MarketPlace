// Pages/Supplier/Orders/Index.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiEye,
  FiFilter,
  FiSearch,
  FiShoppingCart,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiPackage,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
  FiCalendar
} from 'react-icons/fi';
import { MdPending, MdVerified } from 'react-icons/md';

export default function OrdersIndex({ orders, stats, orderStatuses, paymentStatuses }) {
  // State management for filters and sorting
  const [dateTo, setDateTo] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date - Converts ISO date to readable format
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Apply all filters to the order list
  const applyFilters = () => {
    router.get(route('supplier.orders.index'), {
      search: searchTerm,
      order_status: orderStatus,
      payment_status: paymentStatus,
      date_from: dateFrom,
      date_to: dateTo,
      sort: sortField,
      direction: sortDirection
    }, {
      preserveState: true,
      replace: true
    });
  };

  // Reset all filters to default
  const resetFilters = () => {
    setSearchTerm('');
    setOrderStatus('');
    setPaymentStatus('');
    setDateFrom('');
    setDateTo('');
    setSortField('created_at');
    setSortDirection('desc');

    router.get(route('supplier.orders.index'), {}, {
      preserveState: true,
      replace: true
    });
  };

  // Handle column sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    applyFilters();
  };

  // Handle export functionality
  const handleExport = () => {
    const params = new URLSearchParams({
      ...(orderStatus && { order_status: orderStatus }),
      ...(paymentStatus && { payment_status: paymentStatus }),
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo })
    });

    window.location.href = route('supplier.orders.export') + '?' + params.toString();
  };

  // Get order status badge with appropriate styling
  const getStatusBadge = (status) => {
    const badges = {
      pending_confirmation: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: MdPending, label: 'অপেক্ষমান' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: MdVerified, label: 'নিশ্চিত' },
      processing: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: FiPackage, label: 'প্রক্রিয়াধীন' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', icon: FiTruck, label: 'পাঠানো হয়েছে' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle, label: 'ডেলিভারি হয়েছে' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle, label: 'বাতিল' }
    };
    const badge = badges[status] || badges.pending_confirmation;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  // Get payment status badge
  const getPaymentBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'অপেক্ষমান' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'পরিশোধিত' }
    };
    const badge = badges[status] || badges.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Sort icon component for table headers
  const SortIcon = ({ field }) => {
    if (sortField !== field) return <FiChevronDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc'
      ? <FiChevronUp className="w-4 h-4 text-indigo-600" />
      : <FiChevronDown className="w-4 h-4 text-indigo-600" />;
  };

  return (
    <DashboardLayout>
      <Head title="অর্ডার সমূহ" />

      <div className="space-y-6">
        {/* Header - Page title and export button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">অর্ডার সমূহ</h1>
            <p className="text-sm text-gray-600 mt-1">
              সমস্ত আগত অর্ডার পরিচালনা এবং ট্র্যাক করুন
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

        {/* Stats Cards - Key metrics overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">মোট</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-4">
            <p className="text-sm text-yellow-600">অপেক্ষমান</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending_confirmation}</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-4">
            <p className="text-sm text-blue-600">প্রক্রিয়াধীন</p>
            <p className="text-2xl font-bold text-blue-700">{stats.processing}</p>
          </div>
          <div className="bg-purple-50 rounded-xl shadow-sm border border-purple-100 p-4">
            <p className="text-sm text-purple-600">পাঠানো হয়েছে</p>
            <p className="text-2xl font-bold text-purple-700">{stats.shipped}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-4">
            <p className="text-sm text-green-600">ডেলিভারি হয়েছে</p>
            <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-4">
            <p className="text-sm text-red-600">বাতিল</p>
            <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
          </div>
          <div className="bg-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-4">
            <p className="text-sm text-indigo-600">আয়</p>
            <p className="text-lg font-bold text-indigo-700">{formatCurrency(stats.total_revenue)}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FiFilter className="w-4 h-4" />
              <span className="font-medium">ফিল্টার</span>
              {showFilters ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showFilters && (
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="col-span-2">
                  <form onSubmit={handleSearch} className="flex">
                    <input
                      type="text"
                      placeholder="অর্ডার নম্বর বা ক্রেতার নাম দ্বারা অনুসন্ধান..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
                    >
                      <FiSearch className="w-5 h-5" />
                    </button>
                  </form>
                </div>

                {/* Order Status Filter */}
                <div>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    <option value="">সব অর্ডার স্ট্যাটাস</option>
                    {Object.entries(orderStatuses).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Status Filter */}
                <div>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    <option value="">সব পেমেন্ট স্ট্যাটাস</option>
                    {Object.entries(paymentStatuses).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filters */}
                <div>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="থেকে তারিখ"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="পর্যন্ত তারিখ"
                  />
                </div>
              </div>

              {/* Filter Action Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  রিসেট
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  ফিল্টার প্রয়োগ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('order_number')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      অর্ডার #
                      <SortIcon field="order_number" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ক্রেতা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total_amount')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      পরিমাণ
                      <SortIcon field="total_amount" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    অর্ডার স্ট্যাটাস
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    পেমেন্ট
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      তারিখ
                      <SortIcon field="created_at" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.data.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <Link
                        href={route('supplier.orders.show', order.id)}
                        className="font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.buyer?.name}</p>
                        <p className="text-xs text-gray-500">{order.buyer?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
                        <p className="text-xs text-gray-500">{order.items?.length} টি আইটেম</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.order_status)}
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentBadge(order.payment_status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={route('supplier.orders.show', order.id)}
                          className="p-2 text-gray-400 hover:text-indigo-600"
                          title="বিস্তারিত দেখুন"
                        >
                          <FiEye className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {orders.data.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <FiShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">কোনো অর্ডার পাওয়া যায়নি</p>
                      <p className="text-gray-400">ক্রেতারা যখন অর্ডার দেবেন তখন সেগুলি এখানে দেখা যাবে</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {orders.links && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  মোট {orders.total} টির মধ্যে {orders.from} থেকে {orders.to} দেখানো হচ্ছে
                </p>
                <div className="flex gap-2">
                  {orders.links.map((link, index) => (
                    <button
                      key={index}
                      onClick={() => router.get(link.url)}
                      disabled={!link.url || link.active}
                      className={`px-3 py-1 rounded-lg ${link.active
                        ? 'bg-indigo-600 text-white'
                        : link.url
                          ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      dangerouslySetInnerHTML={{
                        __html: link.label
                          .replace('Previous', 'পূর্ববর্তী')
                          .replace('Next', 'পরবর্তী')
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}