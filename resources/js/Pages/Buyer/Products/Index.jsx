// Pages/Buyer/Products/Index.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Buyer dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiChevronDown,
  FiPackage,
  FiTruck,
  FiEye
} from 'react-icons/fi';
import { BsGraphUp } from 'react-icons/bs';

const NoImg = "/noImg.jpg";

export default function ProductsIndex({ products, categories, filters }) {
  // State management for view mode, filters and UI controls
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    moq: filters?.moq || '',
    search: filters?.search || '',
    sort: filters?.sort || 'newest',
    category: filters?.category || '',
    min_price: filters?.min_price || '',
    max_price: filters?.max_price || '',
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...selectedFilters, [key]: value };
    setSelectedFilters(newFilters);
  };

  // Apply filters to product listing
  const applyFilters = () => {
    router.get(route('buyer.products.index'), selectedFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Reset all filters to default
  const resetFilters = () => {
    const resetValues = {
      search: '',
      category: '',
      min_price: '',
      max_price: '',
      moq: '',
      sort: 'newest'
    };
    setSelectedFilters(resetValues);
    router.get(route('buyer.products.index'), resetValues, {
      preserveState: true
    });
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <Head title="পণ্য ব্রাউজ করুন" />

      <div className="space-y-6">
        {/* Header - Page title and create RFQ button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">পণ্য ব্রাউজ করুন</h2>
            <p className="text-gray-600 mt-1">ভেরিফাইড সাপ্লায়ার থেকে মানসম্পন্ন পণ্য খুঁজুন</p>
          </div>
          <Link
            href={route('buyer.rfqs.create')}
            className="mt-3 md:mt-0 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center"
          >
            <FiPackage className="mr-2" /> RFQ তৈরি করুন
          </Link>
        </div>

        {/* Search Bar - Hero search section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-2">পণ্য খুঁজুন</h3>
          <p className="text-indigo-100 mb-4">ভেরিফাইড সাপ্লায়ার থেকে পণ্য অনুসন্ধান করুন</p>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="পণ্যের নাম লিখুন..."
                value={selectedFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-800"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              খুঁজুন
            </button>
          </form>
        </div>

        {/* Mobile Filter Toggle - Visible only on mobile */}
        <div className="lg:hidden flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-white border rounded-lg"
          >
            <FiFilter className="mr-2" />
            ফিল্টার
            <FiChevronDown className={`ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <FiGrid />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <FiList />
            </button>
          </div>
        </div>

        {/* Main Content - Filters and Products */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl p-4 border sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center">
                  <FiFilter className="mr-2" /> ফিল্টার
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  রিসেট
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ক্যাটাগরি
                </label>
                <select
                  value={selectedFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">সব ক্যাটাগরি</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  মূল্য সীমা (টাকা)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="সর্বনিম্ন"
                    value={selectedFilters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="w-1/2 border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="সর্বোচ্চ"
                    value={selectedFilters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="w-1/2 border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {/* MOQ Filter - Maximum Minimum Order Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  সর্বোচ্চ MOQ
                </label>
                <input
                  type="number"
                  placeholder="যেমন: ১০০"
                  value={selectedFilters.moq}
                  onChange={(e) => handleFilterChange('moq', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* Sort Options */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  সাজান
                </label>
                <select
                  value={selectedFilters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="newest">সর্বশেষ প্রথম</option>
                  <option value="price_low">মূল্য: কম থেকে বেশি</option>
                  <option value="price_high">মূল্য: বেশি থেকে কম</option>
                  <option value="name_asc">নাম: ক-হ</option>
                  <option value="name_desc">নাম: হ-ক</option>
                </select>
              </div>

              {/* Apply Filters Button */}
              <button
                onClick={applyFilters}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ফিল্টার প্রয়োগ
              </button>
            </div>
          </div>

          {/* Products Display Area */}
          <div className="flex-1">
            {/* Results count and view toggle - Desktop */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              <p className="text-gray-600">
                মোট <span className="font-medium">{products.total}</span> টি পণ্য দেখানো হচ্ছে
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <FiList />
                </button>
              </div>
            </div>

            {/* Products Display - Conditional based on view mode */}
            {products.data.length === 0 ? (
              // Empty State - No products found
              <div className="bg-white rounded-xl p-12 text-center border">
                <FiPackage className="mx-auto text-5xl text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">কোনো পণ্য পাওয়া যায়নি</h3>
                <p className="text-gray-500 mb-6">আপনার ফিল্টার বা অনুসন্ধানের মান পরিবর্তন করে আবার চেষ্টা করুন</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  ফিল্টার মুছুন
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.data.map((product) => (
                  <ProductCard key={product.id} product={product} formatCurrency={formatCurrency} />
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {products.data.map((product) => (
                  <ProductListItem key={product.id} product={product} formatCurrency={formatCurrency} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {products.links && products.links.length > 3 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  {products.links.map((link, index) => (
                    <button
                      key={index}
                      onClick={() => router.get(link.url)}
                      dangerouslySetInnerHTML={{
                        __html: link.label
                          .replace('Previous', 'পূর্ববর্তী')
                          .replace('Next', 'পরবর্তী')
                      }}
                      className={`px-4 py-2 rounded-lg ${link.active
                        ? 'bg-indigo-600 text-white'
                        : link.url
                          ? 'bg-white border hover:bg-gray-50'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      disabled={!link.url}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Product Card Component - Grid View
function ProductCard({ product, formatCurrency }) {
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <div className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all group">
      <div className="relative">
        {/* Product Image */}
        <div className="h-48 bg-gray-100 relative overflow-hidden">
          {product.main_image ? (
            <img
              src={product.main_image ? `/storage/${product.main_image}` : NoImg}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = NoImg; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiPackage className="text-4xl text-gray-400" />
            </div>
          )}

          {/* Quick View Button */}
          <button
            onClick={() => setShowQuickView(true)}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FiEye className="text-gray-600" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-800 line-clamp-2">{product.name}</h3>
            {product.bulk_prices?.length > 0 && (
              <span className="ml-2 bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                বাল্ক
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-2">{product.category}</p>

          {/* Supplier Info */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <FiTruck className="mr-1 text-gray-400" />
            <span className="truncate">{product.supplier?.user?.name}</span>
          </div>

          {/* Price and MOQ */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">শুরুর মূল্য</p>
              <p className="text-lg font-bold text-indigo-600">{formatCurrency(product.base_price)}</p>
            </div>
            <p className="text-sm text-gray-600">
              সর্বনিম্ন অর্ডার: {product.minimum_order_quantity} {product.unit}
            </p>
          </div>

          {/* Bulk Price Preview */}
          {product.bulk_prices?.length > 0 && (
            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                <BsGraphUp className="mr-1" /> বাল্ক মূল্য:
              </p>
              {product.bulk_prices.slice(0, 2).map((price, idx) => (
                <p key={idx} className="text-xs text-gray-600">
                  {price.min_quantity}+ {product.unit}: {formatCurrency(price.price)}/{product.unit}
                </p>
              ))}
              {product.bulk_prices.length > 2 && (
                <p className="text-xs text-gray-500 mt-1">+{product.bulk_prices.length - 2} আরো স্তর</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Link
              href={route('buyer.products.show', product.slug)}
              className="flex-1 text-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              বিস্তারিত দেখুন
            </Link>
            <Link
              href={route('buyer.rfqs.create', { product: product.id })}
              className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
              RFQ
            </Link>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} formatCurrency={formatCurrency} />
      )}
    </div>
  );
}

// Product List Item Component - List View
function ProductListItem({ product, formatCurrency }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all">
      <div className="flex flex-col md:flex-row">
        {/* Product Image */}
        <div className="md:w-48 h-48 bg-gray-100">
          {product.main_image ? (
            <img
              src={product.main_image ? `/storage/${product.main_image}` : NoImg}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = NoImg; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiPackage className="text-4xl text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-lg text-gray-800 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>

              {/* Supplier Info */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <FiTruck className="mr-1 text-gray-400" />
                <span>{product.supplier?.user?.name}</span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              )}

              {/* Bulk Prices */}
              {product.bulk_prices?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">বাল্ক মূল্য:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.bulk_prices.map((price, idx) => (
                      <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                        {price.min_quantity}+: {formatCurrency(price.price)}/{product.unit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price and Actions */}
            <div className="mt-4 md:mt-0 md:text-right">
              <p className="text-sm text-gray-500">মূল্য</p>
              <p className="text-2xl font-bold text-indigo-600">{formatCurrency(product.base_price)}</p>
              <p className="text-sm text-gray-500 mt-1">
                সর্বনিম্ন অর্ডার: {product.minimum_order_quantity} {product.unit}
              </p>

              <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 mt-4">
                <Link
                  href={route('buyer.products.show', product.slug)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors inline-block text-center"
                >
                  বিস্তারিত দেখুন
                </Link>
                <Link
                  href={route('buyer.rfqs.create', { product: product.id })}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors inline-block text-center"
                >
                  RFQ তৈরি করুন
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick View Modal Component
function QuickViewModal({ product, onClose, formatCurrency }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {product.name}
                </h3>

                {/* Product Details */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{product.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">মূল্য</p>
                      <p className="font-medium">{formatCurrency(product.base_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">সর্বনিম্ন অর্ডার</p>
                      <p className="font-medium">{product.minimum_order_quantity} {product.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ক্যাটাগরি</p>
                      <p className="font-medium">{product.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">সাপ্লায়ার</p>
                      <p className="font-medium">{product.supplier?.user?.name}</p>
                    </div>
                  </div>

                  {/* Bulk Prices */}
                  {product.bulk_prices?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">বাল্ক মূল্য</p>
                      <div className="space-y-2">
                        {product.bulk_prices.map((price, idx) => (
                          <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                            <span>{price.min_quantity}+ {product.unit}</span>
                            <span className="font-medium">{formatCurrency(price.price)}/{product.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Link
              href={route('buyer.products.show', product.slug)}
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
              সম্পূর্ণ বিবরণ দেখুন
            </Link>
            <Link
              href={route('buyer.rfqs.create', { product: product.id })}
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              RFQ তৈরি করুন
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
            >
              বন্ধ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}