// Pages/Supplier/Rfqs/Index.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiFileText,
  FiFilter,
  FiSearch,
  FiClock,
  FiCalendar,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi'

export default function RfqsIndex({ rfqs, stats, supplierCategories }) {
  // State management for filters and sorting
  const [dateTo, setDateTo] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterByCategory, setFilterByCategory] = useState(true);

  // Format date - Converts ISO date to readable format
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days remaining until deadline
  const getDaysRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'মেয়াদোত্তীর্ণ';
    if (diffDays === 0) return 'আজ';
    if (diffDays === 1) return 'আগামীকাল';
    return `${diffDays} দিন বাকি`;
  };

  // Get urgency color based on days remaining
  const getUrgencyColor = (deadline) => {
    const days = getDaysRemaining(deadline);
    if (days === 'মেয়াদোত্তীর্ণ') return 'text-red-600';
    if (days === 'আজ') return 'text-orange-600';
    if (days === 'আগামীকাল') return 'text-yellow-600';
    return 'text-green-600';
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Apply all filters to the RFQ list
  const applyFilters = () => {
    router.get(route('supplier.rfqs.index'), {
      search: searchTerm,
      date_from: dateFrom,
      date_to: dateTo,
      filter_by_category: filterByCategory,
      sort: sortField,
      direction: sortDirection
    }, {
      preserveState: true,
      replace: true
    });
  };

  // Reset all filters to default
  const resetFilters = () => {
    setDateTo('');
    setDateFrom('');
    setSearchTerm('');
    setSortDirection('desc');
    setFilterByCategory(true);
    setSortField('created_at');

    router.get(route('supplier.rfqs.index'), {}, {
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

  // Check if supplier has already quoted for this RFQ
  const hasQuoted = (rfq) => {
    return rfq.quotes && rfq.quotes.length > 0;
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
      <Head title="RFQ সমূহ" />

      <div className="space-y-6">
        {/* Header - Page title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">কোটা অনুরোধ (RFQ)</h1>
            <p className="text-sm text-gray-600 mt-1">
              আপনার পণ্যের সাথে মিলে এমন খোলা RFQ ব্রাউজ করুন এবং কোটা দিন
            </p>
          </div>
        </div>

        {/* Stats Cards - Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">মোট উপলব্ধ</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_available}</p>
          </div>
          <div className="bg-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-4">
            <p className="text-sm text-indigo-600">মিলে যাওয়া ক্যাটাগরি</p>
            <p className="text-2xl font-bold text-indigo-700">{stats.matching_categories}</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-4">
            <p className="text-sm text-blue-600">আমার কোটা</p>
            <p className="text-2xl font-bold text-blue-700">{stats.my_quotes}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-4">
            <p className="text-sm text-yellow-600">অপেক্ষমান</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending_quotes}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-4">
            <p className="text-sm text-green-600">গৃহীত</p>
            <p className="text-2xl font-bold text-green-700">{stats.accepted_quotes}</p>
          </div>
        </div>

        {/* Categories Alert - When no product categories found */}
        {supplierCategories.length === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start">
              <FiAlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-700 font-medium">
                  কোনো পণ্য ক্যাটাগরি পাওয়া যায়নি
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  মিলে যাওয়া RFQ দেখতে ক্যাটাগরি সহ পণ্য যোগ করুন।
                  <Link href={route('supplier.products.create')} className="ml-1 font-medium underline">
                    আপনার প্রথম পণ্য যোগ করুন →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

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
                      placeholder="শিরোনাম, বিবরণ বা RFQ নম্বর দ্বারা অনুসন্ধান..."
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

                {/* Category Filter Toggle */}
                <div className="col-span-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterByCategory}
                      onChange={(e) => setFilterByCategory(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="text-sm text-gray-700">
                      শুধুমাত্র আমার পণ্য ক্যাটাগরির সাথে মিলে যাওয়া RFQ দেখান
                    </span>
                  </label>
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

        {/* RFQs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('rfq_number')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      RFQ #
                      <SortIcon field="rfq_number" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      শিরোনাম
                      <SortIcon field="title" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ক্রেতা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('quantity')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      পরিমাণ
                      <SortIcon field="quantity" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('required_by_date')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      শেষ তারিখ
                      <SortIcon field="required_by_date" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    স্ট্যাটাস
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
                      <Link
                        href={route('supplier.rfqs.show', rfq.id)}
                        className="font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        {rfq.rfq_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{rfq.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{rfq.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{rfq.buyer?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{rfq.quantity}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">{formatDate(rfq.required_by_date)}</p>
                          <p className={`text-xs ${getUrgencyColor(rfq.required_by_date)}`}>
                            {getDaysRemaining(rfq.required_by_date)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {hasQuoted(rfq) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          <FiCheckCircle className="w-3 h-3" />
                          কোটা দেওয়া হয়েছে
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          <FiClock className="w-3 h-3" />
                          খোলা
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={route('supplier.rfqs.show', rfq.id)}
                          className="p-2 text-gray-400 hover:text-indigo-600"
                          title="বিস্তারিত দেখুন"
                        >
                          <FiEye className="w-5 h-5" />
                        </Link>
                        {!hasQuoted(rfq) && new Date(rfq.required_by_date) > new Date() && (
                          <Link
                            href={route('supplier.rfqs.create-quote', rfq.id)}
                            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                          >
                            কোটা দিন
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {rfqs.data.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">কোনো RFQ পাওয়া যায়নি</p>
                      <p className="text-gray-400">
                        {supplierCategories.length === 0
                          ? 'মিলে যাওয়া RFQ দেখতে ক্যাটাগরি সহ পণ্য যোগ করুন'
                          : 'আপনার ফিল্টার সামঞ্জস্য করুন'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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