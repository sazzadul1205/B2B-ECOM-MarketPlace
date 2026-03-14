// Pages/Admin/SupplierVerification/Index.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// sweetalert - For beautiful alert messages
import Swal from 'sweetalert2';

// Icons - Importing icon sets for UI elements
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiMapPin,
  FiPhone,
  FiEye,
  FiCalendar
} from 'react-icons/fi';
import {
  MdVerified,
  MdPending,
  MdWarning,
} from 'react-icons/md';

export default function Index({ pendingSuppliers, stats, cities, filters }) {
  // State management for filters and UI controls
  const [dateTo, setDateTo] = useState(filters.date_to || '');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCity, setSelectedCity] = useState(filters.city || '');
  const [sortField, setSortField] = useState(filters.sort_field || 'created_at');
  const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('admin.supplier-verification.index'), {
      ...filters,
      search: searchTerm,
      city: selectedCity,
      date_from: dateFrom,
      date_to: dateTo,
      sort_field: sortField,
      sort_direction: sortDirection
    }, { preserveState: true });
  };

  // Handle filter application
  const handleFilter = () => {
    router.get(route('admin.supplier-verification.index'), {
      ...filters,
      search: searchTerm,
      city: selectedCity,
      date_from: dateFrom,
      date_to: dateTo,
      sort_field: sortField,
      sort_direction: sortDirection
    }, { preserveState: true });
    setShowFilterModal(false);
  };

  // Reset all filters to default
  const handleReset = () => {
    setSearchTerm('');
    setSelectedCity('');
    setDateFrom('');
    setDateTo('');
    setSortField('created_at');
    setSortDirection('desc');
    router.get(route('admin.supplier-verification.index'), {}, { preserveState: true });
    setShowFilterModal(false);
  };

  // Handle column sorting
  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);

    router.get(route('admin.supplier-verification.index'), {
      ...filters,
      search: searchTerm,
      city: selectedCity,
      date_from: dateFrom,
      date_to: dateTo,
      sort_field: field,
      sort_direction: direction
    }, { preserveState: true });
  };

  // Handle bulk selection of suppliers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSuppliers(pendingSuppliers.data.map(s => s.id));
    } else {
      setSelectedSuppliers([]);
    }
  };

  const handleSelectSupplier = (id) => {
    if (selectedSuppliers.includes(id)) {
      setSelectedSuppliers(selectedSuppliers.filter(sId => sId !== id));
    } else {
      setSelectedSuppliers([...selectedSuppliers, id]);
    }
  };

  // Handle bulk verify selected suppliers
  const handleBulkVerify = () => {
    if (selectedSuppliers.length === 0) return;

    Swal.fire({
      title: 'একাধিক সাপ্লায়ার ভেরিফাই',
      text: `আপনি কি ${selectedSuppliers.length} টি সাপ্লায়ার ভেরিফাই করতে চান?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, ভেরিফাই',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.supplier-verification.bulk-verify'), {
          supplier_ids: selectedSuppliers
        }, {
          onSuccess: () => {
            setSelectedSuppliers([]);
            Swal.fire({
              title: 'সফল!',
              text: `${selectedSuppliers.length} টি সাপ্লায়ার সফলভাবে ভেরিফাই করা হয়েছে।`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  // Sort indicator component for table headers
  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  // Format date - Converts ISO date to readable format
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <Head title="সাপ্লায়ার ভেরিফিকেশন" />

      <div className="space-y-6">
        {/* Header - Page title and navigation links */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">সাপ্লায়ার ভেরিফিকেশন</h1>
            <p className="text-sm text-gray-600 mt-1">
              বিচারাধীন সাপ্লায়ার নিবন্ধন পর্যালোচনা ও ভেরিফাই করুন
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={route('admin.supplier-verification.verified')}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
            >
              <MdVerified className="w-4 h-4" />
              <span>ভেরিফাইড</span>
            </Link>
            <Link
              href={route('admin.supplier-verification.rejected')}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <MdWarning className="w-4 h-4" />
              <span>প্রত্যাখ্যাত</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Key metrics overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">বিচারাধীন</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <MdPending className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ভেরিফাইড</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.verified}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MdVerified className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">প্রত্যাখ্যাত</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <MdWarning className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট সাপ্লায়ার</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-indigo-600" />
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
                  placeholder="কোম্পানির নাম, ইমেইল বা লাইসেন্স নম্বর দ্বারা অনুসন্ধান..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <FiFilter className="w-4 h-4" />
                <span>ফিল্টার</span>
                {(selectedCity || dateFrom || dateTo) && (
                  <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs">
                    {Object.values({ selectedCity, dateFrom, dateTo }).filter(Boolean).length}
                  </span>
                )}
              </button>
              {(filters.search || filters.city || filters.date_from || filters.date_to) && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  মুছুন
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions - Show when suppliers are selected */}
          {selectedSuppliers.length > 0 && (
            <div className="mt-4 flex items-center gap-4 p-3 bg-indigo-50 rounded-lg">
              <span className="text-sm font-medium text-indigo-700">
                {selectedSuppliers.length} টি সাপ্লায়ার নির্বাচিত
              </span>
              <button
                onClick={handleBulkVerify}
                className="px-4 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
              >
                নির্বাচিত ভেরিফাই
              </button>
              <button
                onClick={() => setSelectedSuppliers([])}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                নির্বাচন মুছুন
              </button>
            </div>
          )}
        </div>

        {/* Suppliers Table - Main data table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSuppliers.length === pendingSuppliers.data.length && pendingSuppliers.data.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('company_name')}
                  >
                    কোম্পানির নাম <SortIndicator field="company_name" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    যোগাযোগের ব্যক্তি
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    অবস্থান
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    লাইসেন্স
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('created_at')}
                  >
                    জমার তারিখ <SortIndicator field="created_at" />
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingSuppliers.data.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSuppliers.includes(supplier.id)}
                        onChange={() => handleSelectSupplier(supplier.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Link href={route('admin.supplier-verification.verify', supplier.id)} className="hover:text-indigo-600">
                        <div className="font-medium text-gray-900">{supplier.company_name}</div>
                        <div className="text-sm text-gray-500">{supplier.company_email}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{supplier.user?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <FiPhone className="w-3 h-3" />
                        {supplier.company_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <FiMapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {supplier.city}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{supplier.trade_license_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        {formatDate(supplier.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={route('admin.supplier-verification.verify', supplier.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-lg hover:bg-indigo-100 transition"
                      >
                        <FiEye className="w-4 h-4" />
                        পর্যালোচনা
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - Navigation controls */}
          {pendingSuppliers.links && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  মোট {pendingSuppliers.total} টির মধ্যে {pendingSuppliers.from} থেকে {pendingSuppliers.to} দেখানো হচ্ছে
                </p>
                <div className="flex gap-2">
                  {pendingSuppliers.links.map((link, index) => (
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
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">সাপ্লায়ার ফিল্টার</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    শহর
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">সব শহর</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
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