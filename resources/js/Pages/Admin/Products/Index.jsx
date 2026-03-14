// Pages/Admin/Products/Index.jsx

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
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiStar,
  FiStar as FiStarFilled,
  FiMoreVertical,
  FiAlertCircle
} from 'react-icons/fi';
import {
  MdVerified,
  MdPending,
  MdWarning,
  MdOutlineAttachMoney
} from 'react-icons/md';
import { BsBoxSeam, BsBuilding, BsGraphUp } from 'react-icons/bs';

// Default image for product fallback
const NoImg = "/noImg.jpg";

export default function Index({ products, stats, categories, suppliers, filters }) {
  // State management for filters and UI controls
  const [dateTo, setDateTo] = useState(filters.date_to || '');
  const [bulkActionMenu, setBulkActionMenu] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [minPrice, setMinPrice] = useState(filters.min_price || '');
  const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
  const [sortField, setSortField] = useState(filters.sort_field || 'created_at');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [selectedSupplier, setSelectedSupplier] = useState(filters.supplier_id || '');
  const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');
  const [selectedStockStatus, setSelectedStockStatus] = useState(filters.stock_status || '');

  // Status options for dropdown
  const statusOptions = [
    { value: '', label: 'সব স্ট্যাটাস' },
    { value: 'approved', label: 'অনুমোদিত', color: 'green' },
    { value: 'pending', label: 'বিচারাধীন', color: 'yellow' },
    { value: 'rejected', label: 'প্রত্যাখ্যাত', color: 'red' },
  ];

  // Stock status options for dropdown
  const stockStatusOptions = [
    { value: '', label: 'সব স্টক' },
    { value: 'in_stock', label: 'স্টকে আছে' },
    { value: 'low_stock', label: 'স্টক কম (<১০)' },
    { value: 'out_of_stock', label: 'স্টক নেই' },
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

  // Apply all filters to the product list
  const applyFilters = () => {
    router.get(route('admin.products.index'), {
      search: searchTerm,
      status: selectedStatus,
      category: selectedCategory,
      supplier_id: selectedSupplier,
      stock_status: selectedStockStatus,
      date_from: dateFrom,
      date_to: dateTo,
      min_price: minPrice,
      max_price: maxPrice,
      sort_field: sortField,
      sort_direction: sortDirection
    }, { preserveState: true });
  };

  // Reset all filters to default
  const handleReset = () => {
    setDateTo('');
    setDateFrom('');
    setMinPrice('');
    setMaxPrice('');
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedCategory('');
    setSelectedSupplier('');
    setSortDirection('desc');
    setShowFilterModal(false);
    setSelectedStockStatus('');
    setSortField('created_at');
    router.get(route('admin.products.index'), {}, { preserveState: true });
  };

  // Handle column sorting
  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
    applyFilters();
  };

  // Handle bulk selection of products
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.data.map(p => p.id));
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

  // Handle bulk actions (approve, reject, feature, delete)
  const handleBulkAction = (action) => {
    if (selectedProducts.length === 0) return;

    const actionConfig = {
      approve: {
        title: 'একাধিক পণ্য অনুমোদন',
        text: `আপনি কি ${selectedProducts.length} টি পণ্য অনুমোদন করতে চান?`,
        icon: 'question',
        confirmColor: '#10B981',
        action: 'approve'
      },
      reject: {
        title: 'একাধিক পণ্য প্রত্যাখ্যান',
        text: `আপনি কি ${selectedProducts.length} টি পণ্য প্রত্যাখ্যান করতে চান?`,
        icon: 'warning',
        confirmColor: '#EF4444',
        action: 'reject'
      },
      feature: {
        title: 'একাধিক পণ্য প্রমোশন',
        text: `আপনি কি ${selectedProducts.length} টি পণ্য প্রচারিত হিসেবে চিহ্নিত করতে চান?`,
        icon: 'question',
        confirmColor: '#8B5CF6',
        action: 'feature'
      },
      unfeature: {
        title: 'একাধিক পণ্য প্রমোশন বাতিল',
        text: `আপনি কি ${selectedProducts.length} টি পণ্য থেকে প্রচারিত চিহ্ন সরাতে চান?`,
        icon: 'question',
        confirmColor: '#6B7280',
        action: 'unfeature'
      },
      delete: {
        title: 'একাধিক পণ্য মুছুন',
        text: `আপনি কি ${selectedProducts.length} টি পণ্য মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।`,
        icon: 'warning',
        confirmColor: '#EF4444',
        action: 'delete'
      }
    };

    const config = actionConfig[action];

    Swal.fire({
      title: config.title,
      text: config.text,
      icon: config.icon,
      showCancelButton: true,
      confirmButtonColor: config.confirmColor,
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, চালিয়ে যান',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.products.bulk-update'), {
          product_ids: selectedProducts,
          action: config.action
        }, {
          onSuccess: () => {
            setSelectedProducts([]);
            setBulkActionMenu(false);
            Swal.fire({
              title: 'সফল!',
              text: `একাধিক কার্যক্রম সফলভাবে সম্পন্ন হয়েছে।`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  // Handle delete single product
  const handleDelete = (product) => {
    Swal.fire({
      title: 'পণ্য মুছুন',
      text: `আপনি কি ${product.name} মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.products.destroy', product.id), {
          onSuccess: () => {
            Swal.fire({
              title: 'মুছে ফেলা হয়েছে!',
              text: 'পণ্যটি মুছে ফেলা হয়েছে।',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  // Handle toggle featured status
  const handleToggleFeatured = (product) => {
    router.patch(route('admin.products.toggle-featured', product.id), {}, {
      onSuccess: () => {
        Swal.fire({
          title: 'সফল!',
          text: `পণ্যটি ${product.is_featured ? 'অপ্রচারিত' : 'প্রচারিত'} হিসেবে চিহ্নিত হয়েছে।`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  // Handle export functionality
  const handleExport = () => {
    window.location.href = route('admin.products.export', {
      ...filters,
      status: selectedStatus,
      category: selectedCategory
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

  // Get status badge with appropriate styling
  const getStatusBadge = (status) => {
    const badges = {
      approved: { color: 'bg-green-100 text-green-800', icon: MdVerified, label: 'অনুমোদিত' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: MdPending, label: 'বিচারাধীন' },
      rejected: { color: 'bg-red-100 text-red-800', icon: MdWarning, label: 'প্রত্যাখ্যাত' },
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
    selectedStatus,
    selectedCategory,
    selectedSupplier,
    selectedStockStatus,
    dateFrom,
    dateTo,
    minPrice,
    maxPrice
  ].filter(Boolean).length;

  return (
    <DashboardLayout>
      <Head title="পণ্য ব্যবস্থাপনা" />

      <div className="space-y-6">
        {/* Header - Page title and action buttons */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">পণ্য ব্যবস্থাপনা</h1>
            <p className="text-sm text-gray-600 mt-1">
              মার্কেটপ্লেসের সকল পণ্য পরিচালনা ও পর্যবেক্ষণ করুন
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
              href={route('admin.products.statistics')}
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
                <p className="text-sm text-gray-500">মোট পণ্য</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট মজুত মূল্য</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(stats.total_value)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MdOutlineAttachMoney className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">অনুমোদিত</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MdVerified className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">স্টক নেই</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.out_of_stock}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
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

          {/* Bulk Actions - Show when products are selected */}
          {selectedProducts.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
              <span className="text-sm font-medium text-indigo-700">
                {selectedProducts.length} টি পণ্য নির্বাচিত
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
                      onClick={() => handleBulkAction('approve')}
                      className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                    >
                      নির্বাচিত অনুমোদন
                    </button>
                    <button
                      onClick={() => handleBulkAction('reject')}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      নির্বাচিত প্রত্যাখ্যান
                    </button>
                    <div className="border-t my-1"></div>
                    <button
                      onClick={() => handleBulkAction('feature')}
                      className="block w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-gray-100"
                    >
                      প্রচারিত হিসেবে চিহ্নিত
                    </button>
                    <button
                      onClick={() => handleBulkAction('unfeature')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    >
                      প্রচারিত চিহ্ন সরান
                    </button>
                    <div className="border-t my-1"></div>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      নির্বাচিত মুছুন
                    </button>
                  </div>
                )}
              </div>
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
                      checked={selectedProducts.length === products.data.length && products.data.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('name')}
                  >
                    পণ্য <SortIndicator field="name" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    সাপ্লায়ার
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('category')}
                  >
                    ক্যাটাগরি <SortIndicator field="category" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('base_price')}
                  >
                    মূল্য <SortIndicator field="base_price" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('stock_quantity')}
                  >
                    মজুত <SortIndicator field="stock_quantity" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    প্রচারিত
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('created_at')}
                  >
                    তৈরির তারিখ <SortIndicator field="created_at" />
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.data.map((product) => (
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
                      <Link href={route('admin.products.show', product.id)} className="hover:text-indigo-600">
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
                            <div className="text-xs text-gray-500">সর্বনিম্ন অর্ডার: {product.minimum_order_quantity} {product.unit}</div>
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
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${product.stock_quantity > 0
                          ? product.stock_quantity < 10
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-red-500'
                          }`} />
                        <span className="text-sm text-gray-900">{product.stock_quantity || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        className={`p-1 rounded-full hover:bg-gray-100 transition ${product.is_featured ? 'text-yellow-500' : 'text-gray-400'
                          }`}
                      >
                        {product.is_featured ? <FiStarFilled className="w-5 h-5" /> : <FiStar className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{formatDate(product.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={route('admin.products.edit', product.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="সম্পাদনা"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <Link
                          href={route('admin.products.show', product.id)}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="দেখুন"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="মুছুন"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - Navigation controls */}
          {products.links && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  মোট {products.total} টির মধ্যে {products.from} থেকে {products.to} দেখানো হচ্ছে
                </p>
                <div className="flex gap-2">
                  {products.links.map((link, index) => (
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
                    স্টক স্ট্যাটাস
                  </label>
                  <select
                    value={selectedStockStatus}
                    onChange={(e) => setSelectedStockStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {stockStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
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