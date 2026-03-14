// Pages/Admin/Rfqs/Index.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// sweetalert - For beautiful alert messages
import Swal from 'sweetalert2';

// Icons - Importing icon sets for UI elements
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiMoreVertical,
} from 'react-icons/fi';
import {
  MdPending,
  MdVerified,
  MdWarning
} from 'react-icons/md';
import { BsGraphUp } from 'react-icons/bs';

export default function Index({ rfqs, stats, buyers, filters }) {
  // State management for filters and UI controls
  const [selectedRfqs, setSelectedRfqs] = useState([]);
  const [dateTo, setDateTo] = useState(filters.date_to || '');
  const [bulkActionMenu, setBulkActionMenu] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [requiredTo, setRequiredTo] = useState(filters.required_to || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
  const [selectedBuyer, setSelectedBuyer] = useState(filters.buyer_id || '');
  const [requiredFrom, setRequiredFrom] = useState(filters.required_from || '');

  // Status options for dropdown
  const statusOptions = [
    { value: '', label: 'সব স্ট্যাটাস' },
    { value: 'open', label: 'খোলা', color: 'green' },
    { value: 'quoted', label: 'কোটা প্রাপ্ত', color: 'blue' },
    { value: 'closed', label: 'বন্ধ', color: 'red' },
  ];

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

  // Apply all filters to the RFQ list
  const applyFilters = () => {
    router.get(route('admin.rfqs.index'), {
      search: searchTerm,
      status: selectedStatus,
      buyer_id: selectedBuyer,
      date_from: dateFrom,
      date_to: dateTo,
      required_from: requiredFrom,
      required_to: requiredTo
    }, { preserveState: true });
  };

  // Reset all filters to default
  const handleReset = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedBuyer('');
    setDateFrom('');
    setDateTo('');
    setRequiredFrom('');
    setRequiredTo('');
    router.get(route('admin.rfqs.index'), {}, { preserveState: true });
    setShowFilterModal(false);
  };

  // Handle export functionality
  const handleExport = () => {
    window.location.href = route('admin.rfqs.export', {
      ...filters,
      status: selectedStatus,
      date_from: dateFrom,
      date_to: dateTo
    });
  };

  // Handle bulk selection of RFQs
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRfqs(rfqs.data.map(r => r.id));
    } else {
      setSelectedRfqs([]);
    }
  };

  const handleSelectRfq = (id) => {
    if (selectedRfqs.includes(id)) {
      setSelectedRfqs(selectedRfqs.filter(rId => rId !== id));
    } else {
      setSelectedRfqs([...selectedRfqs, id]);
    }
  };

  // Handle delete single RFQ
  const handleDelete = (rfq) => {
    Swal.fire({
      title: 'RFQ মুছুন',
      text: `আপনি কি RFQ ${rfq.rfq_number} মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.rfqs.destroy', rfq.id), {
          onSuccess: () => {
            Swal.fire({
              title: 'মুছে ফেলা হয়েছে!',
              text: 'RFQ মুছে ফেলা হয়েছে।',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  // Format date - Converts ISO date to readable format
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge with appropriate styling
  const getStatusBadge = (status) => {
    const badges = {
      open: { color: 'bg-green-100 text-green-800', icon: MdPending, label: 'খোলা' },
      quoted: { color: 'bg-blue-100 text-blue-800', icon: MdVerified, label: 'কোটা প্রাপ্ত' },
      closed: { color: 'bg-red-100 text-red-800', icon: MdWarning, label: 'বন্ধ' },
    };
    const badge = badges[status] || badges.open;
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
    selectedStatus,
    selectedBuyer,
    dateFrom,
    dateTo,
    requiredFrom,
    requiredTo
  ].filter(Boolean).length;

  return (
    <DashboardLayout>
      <Head title="RFQ ব্যবস্থাপনা" />

      <div className="space-y-6">
        {/* Header - Page title and action buttons */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RFQ ব্যবস্থাপনা</h1>
            <p className="text-sm text-gray-600 mt-1">
              সকল কোটা অনুরোধ পরিচালনা ও পর্যবেক্ষণ করুন
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
              href={route('admin.rfqs.statistics')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
            >
              <BsGraphUp className="w-4 h-4" />
              <span>পরিসংখ্যান</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Key RFQ metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট RFQ</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.total}</p>
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
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.open}</p>
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
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.quoted}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <MdVerified className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">অর্ডারে রূপান্তরিত</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.converted_to_order}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-purple-600" />
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
                  placeholder="RFQ নম্বর, শিরোনাম বা ক্রেতার নাম দ্বারা অনুসন্ধান..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
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

          {/* Bulk Actions - Show when RFQs are selected */}
          {selectedRfqs.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
              <span className="text-sm font-medium text-indigo-700">
                {selectedRfqs.length} টি RFQ নির্বাচিত
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

        {/* RFQs Table - Main data table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRfqs.length === rfqs.data.length && rfqs.data.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RFQ #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    শিরোনাম
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ক্রেতা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    পরিমাণ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    প্রয়োজনীয় তারিখ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    কোটা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    তৈরির তারিখ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rfqs.data.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRfqs.includes(rfq.id)}
                        onChange={() => handleSelectRfq(rfq.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Link href={route('admin.rfqs.show', rfq.id)} className="hover:text-indigo-600">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {rfq.rfq_number}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{rfq.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{rfq.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {rfq.buyer?.name?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">{rfq.buyer?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{rfq.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FiCalendar className="w-3 h-3" />
                        {formatDate(rfq.required_by_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(rfq.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {rfq.quotes_count || 0} টি কোটা
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{formatDate(rfq.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={route('admin.rfqs.show', rfq.id)}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="দেখুন"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        {rfq.status !== 'closed' && (
                          <button
                            onClick={() => {
                              // Handle close RFQ
                            }}
                            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                            title="RFQ বন্ধ করুন"
                          >
                            <FiXCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(rfq)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="মুছুন"
                        >
                          <FiAlertCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - Navigation controls */}
          {rfqs.links && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  মোট {rfqs.total} টির মধ্যে {rfqs.from} থেকে {rfqs.to} দেখানো হচ্ছে
                </p>
                <div className="flex gap-2">
                  {rfqs.links.map((link, index) => (
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
                    তৈরির তারিখ সীমা
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
                    প্রয়োজনীয় তারিখ সীমা
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={requiredFrom}
                      onChange={(e) => setRequiredFrom(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="থেকে"
                    />
                    <input
                      type="date"
                      value={requiredTo}
                      onChange={(e) => setRequiredTo(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="পর্যন্ত"
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