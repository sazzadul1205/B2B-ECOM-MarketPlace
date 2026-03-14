// Pages/Supplier/Profile/Show.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

// Icons - Importing icon sets for UI elements
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiGlobe,
  FiPackage,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiCalendar,
  FiMessageSquare,
  FiDollarSign,
  FiTrendingUp
} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';

// Layout - Dashboard layout wrapper (uses default dashboard layout)
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function SupplierProfileShow({
  stats,
  supplier,
  categories,
  totalReviews,
  averageRating,
  recentProducts,
}) {
  // State management for category filter
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all'
    ? recentProducts
    : recentProducts.filter(p => p.category === selectedCategory);

  return (
    <DashboardLayout>
      <Head title={`${supplier.company_name} - সাপ্লায়ার প্রোফাইল`} />

      <div className="min-h-screen bg-gray-50">
        {/* Cover Image - Gradient banner */}
        <div className="h-64 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-black opacity-20"></div>
        </div>

        {/* Profile Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 pb-12">
          {/* Profile Header Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {supplier.logo ? (
                    <img
                      src={`/storage/${supplier.logo}`}
                      alt={supplier.company_name}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl border-4 border-white shadow-lg flex items-center justify-center">
                      <FiUsers className="w-12 h-12 text-indigo-600" />
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {supplier.company_name}
                    </h1>
                    {supplier.verification_status === 'verified' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium w-fit">
                        <MdVerified className="w-4 h-4" />
                        ভেরিফাইড সাপ্লায়ার
                      </span>
                    )}
                  </div>

                  {/* Business Type & Location */}
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    {supplier.business_type && (
                      <span className="flex items-center gap-1">
                        <FiTrendingUp className="w-4 h-4" />
                        {supplier.business_type}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FiMapPin className="w-4 h-4" />
                      {supplier.city}, {supplier.country || 'অবস্থান উল্লেখ নেই'}
                    </span>
                    {stats.member_since && (
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {stats.member_since} থেকে সদস্য
                      </span>
                    )}
                  </div>

                  {/* Ratings */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`w-5 h-5 ${star <= averageRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {averageRating.toFixed(1)} ({totalReviews} টি রিভিউ)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Button */}
                <div className="flex-shrink-0">
                  <Link
                    href={route('supplier.messages.create', supplier.user_id)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg"
                  >
                    <FiMessageSquare className="w-5 h-5" />
                    <span>সাপ্লায়ারের সাথে যোগাযোগ</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">সক্রিয় পণ্য</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total_products}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">সম্পন্ন অর্ডার</p>
                  <p className="text-xl font-bold text-gray-900">{stats.completed_orders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">প্রতিক্রিয়া সময়</p>
                  <p className="text-xl font-bold text-gray-900">{stats.response_time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ভেরিফাইড</p>
                  <p className="text-xl font-bold text-gray-900">{stats.verified_since}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Company Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">যোগাযোগের তথ্য</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FiPhone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">ফোন</p>
                      <p className="font-medium text-gray-900">{supplier.company_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiMail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">ইমেইল</p>
                      <p className="font-medium text-gray-900">{supplier.company_email}</p>
                    </div>
                  </div>
                  {supplier.website && (
                    <div className="flex items-start gap-3">
                      <FiGlobe className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">ওয়েবসাইট</p>
                        <a
                          href={supplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          {supplier.website}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">ঠিকানা</p>
                      <p className="font-medium text-gray-900">
                        {supplier.company_address}, {supplier.city}
                        {supplier.state && `, ${supplier.state}`}
                        {supplier.postal_code && ` - ${supplier.postal_code}`}
                        {supplier.country && <>, {supplier.country}</>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">ব্যবসায়িক বিবরণ</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">ব্যবসার ধরন</p>
                    <p className="font-medium text-gray-900">{supplier.business_type || 'উল্লেখ নেই'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">প্রতিষ্ঠার বছর</p>
                    <p className="font-medium text-gray-900">{supplier.year_established || 'উল্লেখ নেই'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">কর্মচারীর সংখ্যা</p>
                    <p className="font-medium text-gray-900">{supplier.number_of_employees || 'উল্লেখ নেই'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ট্রেড লাইসেন্স</p>
                    <p className="font-medium text-gray-900">{supplier.trade_license_number}</p>
                  </div>
                </div>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">পণ্যের ক্যাটাগরি</h2>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <span
                        key={category}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Products & Description */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Description */}
              {supplier.description && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">কোম্পানি সম্পর্কে</h2>
                  <p className="text-gray-700 leading-relaxed">{supplier.description}</p>
                </div>
              )}

              {/* Products Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">পণ্য সমূহ</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        মোট {stats.total_products} টি পণ্যের মধ্যে {filteredProducts.length} টি দেখানো হচ্ছে
                      </p>
                    </div>

                    {/* Category Filter */}
                    {categories.length > 0 && (
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      >
                        <option value="all">সকল ক্যাটাগরি</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="p-6">
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                        >
                          {/* Product Image */}
                          <div className="h-48 bg-gray-100 relative">
                            {product.main_image ? (
                              <img
                                src={`/storage/${product.main_image}`}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiPackage className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {product.name}
                            </h3>

                            <div className="space-y-2 mb-3">
                              <p className="text-sm text-gray-600">
                                সর্বনিম্ন অর্ডার: {product.minimum_order_quantity} {product.unit}
                              </p>
                              {product.stock_quantity !== null && (
                                <p className="text-sm text-gray-600">
                                  মজুত: {product.stock_quantity} ইউনিট
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">শুরুর মূল্য</p>
                                <p className="text-xl font-bold text-indigo-600">
                                  {formatCurrency(product.base_price)}
                                </p>
                              </div>
                              <Link
                                href={route('buyer.products.show', product.slug)}
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                              >
                                বিস্তারিত দেখুন
                              </Link>
                            </div>

                            {/* Bulk Price Indicator */}
                            {product.bulk_prices?.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <FiDollarSign className="w-3 h-3" />
                                  বড় পরিমাণের জন্য বাল্ক মূল্য উপলব্ধ
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি</p>
                    </div>
                  )}
                </div>

                {/* View All Products Button */}
                {stats.total_products > 8 && (
                  <div className="px-6 pb-6">
                    <Link
                      href={route('supplier.products.public', supplier.id)}
                      className="block w-full text-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                    >
                      সকল পণ্য দেখুন ({stats.total_products})
                    </Link>
                  </div>
                )}
              </div>

              {/* Business Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiCheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">অর্ডার সম্পাদন</p>
                      <p className="text-lg font-bold text-gray-900">৯৮%</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiClock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">সময়মত ডেলিভারি</p>
                      <p className="text-lg font-bold text-gray-900">৯৫%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}