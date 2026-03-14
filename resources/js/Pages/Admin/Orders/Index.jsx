// Pages/Admin/Orders/Index.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiShoppingCart,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMoreVertical
} from 'react-icons/fi';
import {
  MdPending,
  MdVerified,
  MdOutlineAttachMoney,
  MdOutlineLocalShipping
} from 'react-icons/md';
import { BsBuilding, BsGraphUp } from 'react-icons/bs';

export default function Index({
  orders,
  stats,
  suppliers,
  buyers,
  orderStatuses,
  paymentStatuses,
  filters
}) {
  // State management for filters and UI controls
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkActionMenu, setBulkActionMenu] = useState(false);
  const [dateTo, setDateTo] = useState(filters.date_to || '');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [minAmount, setMinAmount] = useState(filters.min_amount || '');
  const [maxAmount, setMaxAmount] = useState(filters.max_amount || '');
  const [selectedBuyer, setSelectedBuyer] = useState(filters.buyer_id || '');
  const [sortField, setSortField] = useState(filters.sort_field || 'created_at');
  const [selectedSupplier, setSelectedSupplier] = useState(filters.supplier_id || '');
  const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState(filters.order_status || '');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(filters.payment_status || '');

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Handle filter application
  const handleFilter = () => {
    applyFilters();
    setShowFilterModal(false);
  };

  // Apply all filters to the order list
  const applyFilters = () => {
    router.get(route('admin.orders.index'), {
      search: searchTerm,
      order_status: selectedOrderStatus,
      payment_status: selectedPaymentStatus,
      supplier_id: selectedSupplier,
      buyer_id: selectedBuyer,
      date_from: dateFrom,
      date_to: dateTo,
      min_amount: minAmount,
      max_amount: maxAmount,
      sort_field: sortField,
      sort_direction: sortDirection
    }, { preserveState: true });
  };

  // Reset all filters to default
  const handleReset = () => {
    setSearchTerm('');
    setSelectedOrderStatus('');
    setSelectedPaymentStatus('');
    setSelectedSupplier('');
    setSelectedBuyer('');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setMaxAmount('');
    setSortField('created_at');
    setSortDirection('desc');
    router.get(route('admin.orders.index'), {}, { preserveState: true });
    setShowFilterModal(false);
  };

  // Handle column sorting
  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
    applyFilters();
  };

  // Handle bulk selection of orders
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(orders.data.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(oId => oId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  // Handle export functionality
  const handleExport = () => {
    window.location.href = route('admin.orders.export', {
      ...filters,
      order_status: selectedOrderStatus,
      date_from: dateFrom,
      date_to: dateTo
    });
  };

  // Sort indicator component for table headers
  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date - Converts ISO date to readable format
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge - Returns appropriate badge for order status
  const getOrderStatusBadge = (status) => {
    const badges = {
      pending_confirmation: { color: 'bg-yellow-100 text-yellow-800', icon: MdPending, label: 'অপেক্ষমান' },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: MdVerified, label: 'নিশ্চিত' },
      processing: { color: 'bg-indigo-100 text-indigo-800', icon: FiClock, label: 'প্রক্রিয়াধীন' },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: MdOutlineLocalShipping, label: 'পাঠানো হয়েছে' },
      delivered: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: 'ডেলিভারি হয়েছে' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: FiXCircle, label: 'বাতিল' },
    };
    const badge = badges[status] || badges.pending_confirmation;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, label: 'অপেক্ষমান' },
      paid: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: 'পরিশোধিত' },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  // Count active filters for display
  const activeFilterCount = [
    selectedOrderStatus,
    selectedPaymentStatus,
    selectedSupplier,
    selectedBuyer,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount
  ].filter(Boolean).length;

  return (
    <DashboardLayout>
      <Head title="অর্ডার ব্যবস্থাপনা" />

      <div className="space-y-6">
        {/* Header - Page title and action buttons */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">অর্ডার ব্যবস্থাপনা</h1>
            <p className="text-sm text-gray-600 mt-1">
              মার্কেটপ্লেসের সকল অর্ডার পরিচালনা ও পর্যবেক্ষণ করুন
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <FiDownload className="w-4 h-4" />
              <span>এক্সপোর্ট</span>
            </button>
            <Link
              href={route('admin.orders.statistics')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
            >
              <BsGraphUp className="w-4 h-4" />
              <span>পরিসংখ্যান</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Key metrics overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট অর্ডার</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.total_orders}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট আয়</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(stats.total_revenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MdOutlineAttachMoney className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">অপেক্ষমান অর্ডার</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending_orders}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <MdPending className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">প্রক্রিয়াধীন</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.processing_orders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar - Main search and filter controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="অর্ডার নম্বর, ক্রেতার নাম বা ঠিকানা দ্বারা অনুসন্ধান করুন..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
            <div className="flex gap-2">
              <select
                value={selectedOrderStatus}
                onChange={(e) => setSelectedOrderStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">সব স্ট্যাটাস</option>
                {Object.entries(orderStatuses).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <FiFilter className="w-4 h-4" />
                <span>ফিল্টার</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  মুছুন
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions - Show when orders are selected */}
          {selectedOrders.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
              <span className="text-sm font-medium text-indigo-700">
                {selectedOrders.length} টি অর্ডার নির্বাচিত
              </span>
              <div className="relative">
                <button
                  onClick={() => setBulkActionMenu(!bulkActionMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <FiMoreVertical className="w-4 h-4" />
                  একাধিক কার্যক্রম
                </button>
                {bulkActionMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border z-10">
                    <button
                      onClick={() => {
                        setBulkActionMenu(false);
                        // Handle bulk status update
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      স্ট্যাটাস আপডেট
                    </button>
                    <button
                      onClick={() => {
                        setBulkActionMenu(false);
                        handleExport();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      নির্বাচিত এক্সপোর্ট
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Orders Table - Main data table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.data.length && orders.data.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('order_number')}
                  >
                    অর্ডার # <SortIndicator field="order_number" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ক্রেতা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    সাপ্লায়ার
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('total_amount')}
                  >
                    পরিমাণ <SortIndicator field="total_amount" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    অর্ডার স্ট্যাটাস
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    পেমেন্ট
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('created_at')}
                  >
                    তারিখ <SortIndicator field="created_at" />
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
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Link href={route('admin.orders.show', order.id)} className="hover:text-indigo-600">
                        <div className="font-mono text-sm font-medium text-gray-900">{order.order_number}</div>
                        <div className="text-xs text-gray-500">{order.items?.length || 0} টি আইটেম</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {order.buyer?.name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.buyer?.name}</div>
                          <div className="text-xs text-gray-500">{order.buyer?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BsBuilding className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{order.supplier?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(order.total_amount)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getOrderStatusBadge(order.order_status)}
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentStatusBadge(order.payment_status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{formatDate(order.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={route('admin.orders.show', order.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-lg hover:bg-indigo-100 transition"
                      >
                        <FiEye className="w-4 h-4" />
                        দেখুন
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - Navigation controls */}
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
                      className={`px-3 py-1 rounded-lg text-sm ${link.active
                        ? 'bg-indigo-600 text-white'
                        : link.url
                          ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
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

        {/* Filter Modal - Advanced filtering options */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">উন্নত ফিল্টার</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      পেমেন্ট স্ট্যাটাস
                    </label>
                    <select
                      value={selectedPaymentStatus}
                      onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">সব পেমেন্ট স্ট্যাটাস</option>
                      {Object.entries(paymentStatuses).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      সাপ্লায়ার
                    </label>
                    <select
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">সব সাপ্লায়ার</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ক্রেতা
                  </label>
                  <select
                    value={selectedBuyer}
                    onChange={(e) => setSelectedBuyer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">সব ক্রেতা</option>
                    {buyers.map((buyer) => (
                      <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    তারিখ সীমা
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="থেকে"
                    />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="পর্যন্ত"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    পরিমাণ সীমা (টাকা)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="সর্বনিম্ন পরিমাণ"
                      min="0"
                    />
                    <input
                      type="number"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="সর্বোচ্চ পরিমাণ"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg"
                >
                  রিসেট
                </button>
                <button
                  onClick={handleFilter}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  ফিল্টার প্রয়োগ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}