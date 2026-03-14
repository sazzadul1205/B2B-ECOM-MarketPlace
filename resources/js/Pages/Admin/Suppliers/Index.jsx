// Pages/Admin/Suppliers/Index.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiMapPin,
  FiPackage,
  FiEdit,
  FiTrash2,
  FiEye
} from 'react-icons/fi';
import {
  MdVerified,
  MdPending,
  MdWarning
} from 'react-icons/md';

// sweetalert - For beautiful alert messages
import Swal from 'sweetalert2';

export default function Index({ suppliers, stats, cities, filters }) {
  // State management for filters and UI controls
  const [bulkAction, setBulkAction] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCity, setSelectedCity] = useState(filters.city || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.verification_status || '');

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('admin.suppliers.index'), {
      ...filters,
      search: searchTerm,
      city: selectedCity,
      verification_status: selectedStatus
    }, { preserveState: true });
  };

  // Handle filter application
  const handleFilter = () => {
    router.get(route('admin.suppliers.index'), {
      ...filters,
      search: searchTerm,
      city: selectedCity,
      verification_status: selectedStatus
    }, { preserveState: true });
    setShowFilterModal(false);
  };

  // Reset all filters to default
  const handleReset = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedStatus('');
    router.get(route('admin.suppliers.index'), {}, { preserveState: true });
    setShowFilterModal(false);
  };

  // Handle column sorting
  const handleSort = (field) => {
    const direction = filters.sort_field === field && filters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('admin.suppliers.index'), {
      ...filters,
      sort_field: field,
      sort_direction: direction
    }, { preserveState: true });
  };

  // Handle bulk selection of suppliers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSuppliers(suppliers.data.map(s => s.id));
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

  // Handle bulk action (verify, reject, activate, deactivate)
  const handleBulkAction = () => {
    if (!bulkAction || selectedSuppliers.length === 0) return;

    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `আপনি ${selectedSuppliers.length} টি সাপ্লায়ার ${bulkAction === 'verify' ? 'ভেরিফাই' :
        bulkAction === 'reject' ? 'প্রত্যাখ্যান' :
          bulkAction === 'activate' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'হ্যাঁ, চালিয়ে যান!',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.suppliers.bulk-update'), {
          supplier_ids: selectedSuppliers,
          action: bulkAction
        }, {
          onSuccess: () => {
            setSelectedSuppliers([]);
            setBulkAction('');

            Swal.fire({
              icon: 'success',
              title: 'সফল',
              text: 'একাধিক কার্যক্রম সম্পন্ন হয়েছে'
            });
          }
        });
      }
    });
  };

  // Handle delete single supplier
  const handleDelete = (id, companyName) => {
    Swal.fire({
      title: 'সাপ্লায়ার মুছুন?',
      text: `${companyName} মুছে ফেলবেন? এটি পূর্বাবস্থায় ফেরানো যাবে না।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'হ্যাঁ, মুছুন!',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.suppliers.destroy', id), {
          onSuccess: () => {
            Swal.fire('মুছে ফেলা হয়েছে!', 'সাপ্লায়ার মুছে ফেলা হয়েছে।', 'success');
          }
        });
      }
    });
  };

  // Handle toggle supplier status (activate/deactivate)
  const handleToggleStatus = (id, currentStatus) => {
    const banglaAction = currentStatus ? 'নিষ্ক্রিয়' : 'সক্রিয়';

    Swal.fire({
      title: 'নিশ্চিত করুন',
      text: `আপনি কি এই সাপ্লায়ারকে ${banglaAction} করতে চান?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.patch(route('admin.suppliers.toggle-status', id), {
          onSuccess: () => {
            Swal.fire('আপডেট!', 'সাপ্লায়ার স্ট্যাটাস আপডেট হয়েছে।', 'success');
          }
        });
      }
    });
  };

  // Get verification status badge
  const getStatusBadge = (status) => {
    const badges = {
      verified: { bg: 'bg-green-100', text: 'text-green-800', icon: MdVerified, label: 'ভেরিফাইড' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: MdPending, label: 'বিচারাধীন' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: MdWarning, label: 'প্রত্যাখ্যাত' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  // Get active status badge
  const getActiveBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FiCheckCircle className="w-3 h-3 mr-1" />
        সক্রিয়
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <FiXCircle className="w-3 h-3 mr-1" />
        নিষ্ক্রিয়
      </span>
    );
  };

  // Sort indicator component for table headers
  const SortIndicator = ({ field }) => {
    if (filters.sort_field !== field) return null;
    return <span className="ml-1">{filters.sort_direction === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <DashboardLayout>
      <Head title="সাপ্লায়ার ব্যবস্থাপনা" />

      <div className="space-y-6">
        {/* Header - Page title and export button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">সাপ্লায়ার ব্যবস্থাপনা</h1>
            <p className="text-sm text-gray-600 mt-1">
              মার্কেটপ্লেসের সকল সাপ্লায়ার পরিচালনা ও ভেরিফাই করুন
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.get(route('admin.suppliers.export', filters))}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
            >
              <FiDownload className="w-4 h-4" />
              <span>এক্সপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Key metrics overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট সাপ্লায়ার</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-indigo-600" />
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
                <p className="text-sm text-gray-500">প্রত্যাখ্যাত</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <MdWarning className="w-6 h-6 text-red-600" />
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
                {(selectedCity || selectedStatus) && (
                  <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs">
                    {Object.values({ selectedCity, selectedStatus }).filter(Boolean).length}
                  </span>
                )}
              </button>
              {(filters.search || filters.city || filters.verification_status) && (
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
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm"
              >
                <option value="">একাধিক কার্যক্রম</option>
                <option value="verify">নির্বাচিত ভেরিফাই</option>
                <option value="reject">নির্বাচিত প্রত্যাখ্যান</option>
                <option value="activate">নির্বাচিত সক্রিয়</option>
                <option value="deactivate">নির্বাচিত নিষ্ক্রিয়</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                প্রয়োগ
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
                      checked={selectedSuppliers.length === suppliers.data.length && suppliers.data.length > 0}
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
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('verification_status')}
                  >
                    স্ট্যাটাস <SortIndicator field="verification_status" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    সক্রিয়
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    পণ্য
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('created_at')}
                  >
                    যোগদানের তারিখ <SortIndicator field="created_at" />
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suppliers.data.map((supplier) => (
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
                      <Link href={route('admin.suppliers.show', supplier.id)} className="hover:text-indigo-600">
                        <div className="font-medium text-gray-900">{supplier.company_name}</div>
                        <div className="text-sm text-gray-500">{supplier.company_email}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{supplier.user?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{supplier.company_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <FiMapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {supplier.city}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(supplier.verification_status)}
                    </td>
                    <td className="px-6 py-4">
                      {getActiveBadge(supplier.user?.is_active)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <FiPackage className="w-4 h-4 mr-1 text-gray-400" />
                        {supplier.products_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(supplier.created_at).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={route('admin.suppliers.show', supplier.id)}
                          className="p-1 text-gray-400 hover:text-indigo-600 transition"
                          title="বিস্তারিত দেখুন"
                        >
                          <FiEye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={route('admin.suppliers.edit', supplier.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition"
                          title="সম্পাদনা"
                        >
                          <FiEdit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(supplier.id, supplier.user?.is_active)}
                          className={`p-1 transition ${supplier.user?.is_active
                            ? 'text-gray-400 hover:text-red-600'
                            : 'text-gray-400 hover:text-green-600'
                            }`}
                          title={supplier.user?.is_active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                        >
                          {supplier.user?.is_active ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id, supplier.company_name)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                          title="মুছুন"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - Navigation controls */}
          {suppliers.links && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  মোট {suppliers.total} টির মধ্যে {suppliers.from} থেকে {suppliers.to} দেখানো হচ্ছে
                </p>
                <div className="flex gap-2">
                  {suppliers.links.map((link, index) => (
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
                    ভেরিফিকেশন স্ট্যাটাস
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">সব স্ট্যাটাস</option>
                    <option value="pending">বিচারাধীন</option>
                    <option value="verified">ভেরিফাইড</option>
                    <option value="rejected">প্রত্যাখ্যাত</option>
                  </select>
                </div>
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