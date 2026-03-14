// Pages/Supplier/Products/Index.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiFilter,
  FiSearch,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
  FiArchive,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fi';

// Image placeholder
const NoImg = "/noImg.jpg";

export default function ProductsIndex({ products, stats, categories }) {
  // State management for selection, filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Apply all filters to the product list
  const applyFilters = () => {
    router.get(route('supplier.products.index'), {
      search: searchTerm,
      status: statusFilter,
      category: categoryFilter,
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
    setStatusFilter('');
    setCategoryFilter('');
    setSortField('created_at');
    setSortDirection('desc');
    router.get(route('supplier.products.index'), {}, {
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

  // Handle product selection for bulk operations
  const toggleSelectAll = () => {
    if (selectedProducts.length === products.data.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.data.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(productId => productId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  // Bulk delete products
  const handleBulkDelete = () => {
    if (confirm(`আপনি কি ${selectedProducts.length} টি পণ্য মুছে ফেলতে চান?`)) {
      router.post(route('supplier.products.bulk-delete'), {
        product_ids: selectedProducts
      }, {
        onSuccess: () => setSelectedProducts([])
      });
    }
  };

  // Duplicate product
  const handleDuplicate = (id) => {
    router.post(route('supplier.products.duplicate', id));
  };

  // Toggle product active status
  const handleToggleStatus = (id) => {
    router.patch(route('supplier.products.toggle-status', id));
  };

  // Get status badge with appropriate styling
  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle, label: 'সক্রিয়' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FiClock, label: 'বিচারাধীন' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', icon: FiXCircle, label: 'নিষ্ক্রিয়' }
    };
    const badge = badges[status] || badges.inactive;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  // Get stock status text based on quantity
  const getStockStatus = (product) => {
    if (product.stock_quantity <= 0) {
      return <span className="text-red-600 font-medium">স্টক নেই</span>;
    } else if (product.stock_quantity <= 10) {
      return <span className="text-orange-600 font-medium">স্টক কম ({product.stock_quantity})</span>;
    }
    return <span className="text-green-600 font-medium">{product.stock_quantity} ইউনিট</span>;
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
      <Head title="পণ্য তালিকা" />

      <div className="space-y-6">
        {/* Header - Page title and add product button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">পণ্য সমূহ</h1>
            <p className="text-sm text-gray-600 mt-1">
              আপনার পণ্য ক্যাটালগ এবং ইনভেন্টরি পরিচালনা করুন
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={route('supplier.products.create')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <FiPlus className="w-4 h-4" />
              <span>পণ্য যোগ করুন</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">মোট</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">সক্রিয়</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">বিচারাধীন</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">নিষ্ক্রিয়</p>
            <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">স্টক কম</p>
            <p className="text-2xl font-bold text-orange-600">{stats.low_stock}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">স্টক নেই</p>
            <p className="text-2xl font-bold text-red-600">{stats.out_of_stock}</p>
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
                      placeholder="নাম বা বিবরণ দ্বারা অনুসন্ধান..."
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

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    <option value="">সব স্ট্যাটাস</option>
                    <option value="active">সক্রিয়</option>
                    <option value="pending">বিচারাধীন</option>
                    <option value="inactive">নিষ্ক্রিয়</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    <option value="">সব ক্যাটাগরি</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
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

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
            <span className="text-indigo-700">
              {selectedProducts.length} টি পণ্য নির্বাচিত
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                নির্বাচিত মুছুন
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                নির্বাচন মুছুন
              </button>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.data.length && products.data.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      পণ্য
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ক্যাটাগরি
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('base_price')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      মূল্য
                      <SortIcon field="base_price" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('stock_quantity')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      মজুত
                      <SortIcon field="stock_quantity" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      তৈরির তারিখ
                      <SortIcon field="created_at" />
                    </button>
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
                        onChange={() => toggleSelectProduct(product.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <img
                            src={product.main_image ? `/storage/${product.main_image}` : NoImg}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = NoImg;
                            }}
                          />
                        </div>
                        <div>
                          <Link
                            href={route('supplier.products.edit', product.id)}
                            className="font-medium text-gray-900 hover:text-indigo-600"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-gray-500 mt-1">SKU: {product.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(product.base_price)}</p>
                        <p className="text-xs text-gray-500">সর্বনিম্ন অর্ডার: {product.minimum_order_quantity} {product.unit}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{getStockStatus(product)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(product.created_at).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={route('supplier.products.bulk-prices', product.id)}
                          className="p-2 text-gray-400 hover:text-indigo-600"
                          title="বাল্ক মূল্য"
                        >
                          <FiArchive className="w-5 h-5" />
                        </Link>
                        <Link
                          href={route('supplier.products.edit', product.id)}
                          className="p-2 text-gray-400 hover:text-indigo-600"
                          title="সম্পাদনা"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(product.id)}
                          className="p-2 text-gray-400 hover:text-indigo-600"
                          title="ডুপ্লিকেট"
                        >
                          <FiCopy className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('আপনি কি এই পণ্য মুছে ফেলতে চান?')) {
                              router.delete(route('supplier.products.destroy', product.id));
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="মুছুন"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {products.data.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">কোনো পণ্য পাওয়া যায়নি</p>
                      <p className="text-gray-400 mb-4">আপনার প্রথম পণ্য যোগ করে শুরু করুন</p>
                      <Link
                        href={route('supplier.products.create')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <FiPlus className="w-4 h-4" />
                        পণ্য যোগ করুন
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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