// Pages/Admin/ProductApproval/Index.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// sweetalert - For beautiful alert messages
import Swal from 'sweetalert2';

// Icons - Importing icon sets for UI elements
import {
  FiPackage,
  FiSearch,
  FiFilter,
  FiEye,
  FiCalendar,
} from 'react-icons/fi';
import {
  MdPending,
  MdVerified,
  MdWarning,
  MdOutlineCategory
} from 'react-icons/md';
import { BsBoxSeam, BsBuilding } from 'react-icons/bs';

// Default image for product fallback
const NoImg = "/noImg.jpg";

export default function Index({ pendingProducts, stats, categories, suppliers, filters }) {
  // State management for filters and UI controls
  const [dateTo, setDateTo] = useState(filters.date_to || '');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [minPrice, setMinPrice] = useState(filters.min_price || '');
  const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [selectedSupplier, setSelectedSupplier] = useState(filters.supplier_id || '');

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('admin.product-approval.index'), {
      ...filters,
      search: searchTerm,
      category: selectedCategory,
      supplier_id: selectedSupplier,
      date_from: dateFrom,
      date_to: dateTo,
      min_price: minPrice,
      max_price: maxPrice
    }, { preserveState: true });
  };

  // Handle filter application
  const handleFilter = () => {
    router.get(route('admin.product-approval.index'), {
      ...filters,
      search: searchTerm,
      category: selectedCategory,
      supplier_id: selectedSupplier,
      date_from: dateFrom,
      date_to: dateTo,
      min_price: minPrice,
      max_price: maxPrice
    }, { preserveState: true });
    setShowFilterModal(false);
  };

  // Handle reset all filters
  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSupplier('');
    setDateFrom('');
    setDateTo('');
    setMinPrice('');
    setMaxPrice('');
    router.get(route('admin.product-approval.index'), {}, { preserveState: true });
    setShowFilterModal(false);
  };

  // Handle bulk selection of products
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(pendingProducts.data.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pId => pId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  // Handle bulk approve products
  const handleBulkApprove = () => {
    if (selectedProducts.length === 0) return;

    Swal.fire({
      title: 'একাধিক পণ্য অনুমোদন',
      text: `আপনি কি ${selectedProducts.length} টি পণ্য অনুমোদন করতে চান?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, অনুমোদন করুন',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.product-approval.bulk-approve'), {
          product_ids: selectedProducts
        }, {
          onSuccess: () => {
            setSelectedProducts([]);
            Swal.fire({
              title: 'সফল!',
              text: `${selectedProducts.length} টি পণ্য সফলভাবে অনুমোদন করা হয়েছে।`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
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

  // Count active filters for display
  const activeFilterCount = [
    selectedCategory,
    selectedSupplier,
    dateFrom,
    dateTo,
    minPrice,
    maxPrice
  ].filter(Boolean).length;

  return (
    <DashboardLayout>
      <Head title="পণ্য অনুমোদন" />

      <div className="space-y-6">
        {/* Header - Page title and action buttons */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">পণ্য অনুমোদন</h1>
            <p className="text-sm text-gray-600 mt-1">
              বিচারাধীন পণ্য জমা পর্যালোচনা ও অনুমোদন করুন
            </p>
          </div>
          <Link
            href={route('admin.product-approval.statistics')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
          >
            <FiPackage className="w-4 h-4" />
            <span>পরিসংখ্যান দেখুন</span>
          </Link>
        </div>

        {/* Stats Cards - Key metrics overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">অনুমোদন বিচারাধীন</p>
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
                <p className="text-sm text-gray-500">আজকে অনুমোদিত</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved_today}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MdVerified className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">আজকে বাতিল</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected_today}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <MdWarning className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ক্যাটাগরি</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.categories}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <MdOutlineCategory className="w-6 h-6 text-indigo-600" />
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
                  placeholder="পণ্যের নাম, বিবরণ বা সাপ্লায়ার দ্বারা অনুসন্ধান..."
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

          {/* Bulk Actions - Show when products are selected */}
          {selectedProducts.length > 0 && (
            <div className="mt-4 flex items-center gap-4 p-3 bg-indigo-50 rounded-lg">
              <span className="text-sm font-medium text-indigo-700">
                {selectedProducts.length} টি পণ্য নির্বাচিত
              </span>
              <button
                onClick={handleBulkApprove}
                className="px-4 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
              >
                নির্বাচিত অনুমোদন
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                নির্বাচন মুছুন
              </button>
            </div>
          )}
        </div>

        {/* Products Table - Main data table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === pendingProducts.data.length && pendingProducts.data.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    পণ্য
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    সাপ্লায়ার
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ক্যাটাগরি
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    মূল্য
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    স্টক
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    জমার তারিখ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingProducts.data.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Link href={route('admin.product-approval.show', product.id)} className="hover:text-indigo-600">
                        <div className="flex items-center gap-3">
                          {product.main_image ? (
                            <img
                              src={product.main_image ? `/storage/${product.main_image}` : NoImg}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = NoImg;
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <BsBoxSeam className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">সর্বনিম্ন অর্ডার: {product.minimum_order_quantity} {product.unit}</div>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BsBuilding className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.supplier?.company_name}</div>
                          <div className="text-xs text-gray-500">{product.supplier?.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(product.base_price)}</div>
                      {product.bulk_prices && Object.keys(product.bulk_prices).length > 0 && (
                        <div className="text-xs text-gray-500">বাল্ক মূল্য উপলব্ধ</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{product.stock_quantity || 0}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        {formatDate(product.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={route('admin.product-approval.show', product.id)}
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
          {pendingProducts.links && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  মোট {pendingProducts.total} টির মধ্যে {pendingProducts.from} থেকে {pendingProducts.to} দেখানো হচ্ছে
                </p>
                <div className="flex gap-2">
                  {pendingProducts.links.map((link, index) => (
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
                <h3 className="text-lg font-semibold text-gray-900">পণ্য ফিল্টার</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ক্যাটাগরি
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">সব ক্যাটাগরি</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
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
                        <option key={supplier.id} value={supplier.id}>{supplier.company_name}</option>
                      ))}
                    </select>
                  </div>
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
                    মূল্য সীমা (টাকা)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="সর্বনিম্ন মূল্য"
                      min="0"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="সর্বোচ্চ মূল্য"
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