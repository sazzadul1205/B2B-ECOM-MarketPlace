// Pages/Buyer/Quotes/Index.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Buyer dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiSearch,
  FiCalendar,
  FiUser,
  FiAlertCircle,
  FiDownload,
  FiBarChart2
} from 'react-icons/fi';

export default function QuotesIndex({ quotes, counts, rfqs }) {

  // State management for filters and selected quotes
  const [filters, setFilters] = useState({
    status: '',
    rfq_id: '',
    supplier_id: '',
    search: '',
    from_date: '',
    to_date: '',
    validity: '',
    sort: 'latest'
  });
  const [selectedQuotes, setSelectedQuotes] = useState([]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    router.get(route('buyer.quotes.index'), newFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('buyer.quotes.index'), filters, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Reset all filters to default
  const resetFilters = () => {
    const resetValues = {
      status: '',
      rfq_id: '',
      search: '',
      to_date: '',
      validity: '',
      from_date: '',
      sort: 'latest',
      supplier_id: '',
    };
    setFilters(resetValues);
    router.get(route('buyer.quotes.index'), resetValues, {
      preserveState: true
    });
  };

  // Handle quote selection for comparison (max 5 quotes)
  const toggleQuoteSelection = (quoteId) => {
    setSelectedQuotes(prev => {
      if (prev.includes(quoteId)) {
        return prev.filter(id => id !== quoteId);
      } else {
        if (prev.length < 5) {
          return [...prev, quoteId];
        }
        return prev;
      }
    });
  };

  // Compare selected quotes
  const compareQuotes = () => {
    if (selectedQuotes.length >= 2) {
      router.get(route('buyer.quotes.compare'), { quote_ids: selectedQuotes });
    }
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

  // Get status badge color based on quote status
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'accepted': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700',
      'expired': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Get status icon based on quote status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="text-yellow-600" />;
      case 'accepted':
        return <FiCheckCircle className="text-green-600" />;
      case 'rejected':
        return <FiXCircle className="text-red-600" />;
      case 'expired':
        return <FiAlertCircle className="text-gray-600" />;
      default:
        return <FiFileText className="text-gray-600" />;
    }
  };

  // Check if quote is still valid based on valid_until date
  const isQuoteValid = (quote) => {
    if (!quote?.valid_until) return false;
    const validUntil = new Date(quote.valid_until);
    if (Number.isNaN(validUntil.getTime())) return false;
    return validUntil >= new Date();
  };

  return (
    <DashboardLayout>
      <Head title="প্রাপ্ত কোটা" />

      <div className="space-y-6">
        {/* Header - Page title and compare button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">প্রাপ্ত কোটা</h2>
            <p className="text-gray-600 mt-1">সাপ্লায়ারদের কাছ থেকে প্রাপ্ত কোটা পর্যালোচনা ও তুলনা করুন</p>
          </div>

          {/* Compare Button - Shows when quotes are selected */}
          {selectedQuotes.length >= 2 && (
            <button
              onClick={compareQuotes}
              className="mt-3 md:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <FiBarChart2 className="mr-2" />
              নির্বাচিত তুলনা ({selectedQuotes.length})
            </button>
          )}
        </div>

        {/* Stats Cards - Quote status counts */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">মোট কোটা</p>
            <p className="text-2xl font-bold">{quotes.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">অপেক্ষমান</p>
            <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">গৃহীত</p>
            <p className="text-2xl font-bold text-green-600">{counts.accepted}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">প্রত্যাখ্যাত</p>
            <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">মেয়াদোত্তীর্ণ</p>
            <p className="text-2xl font-bold text-gray-600">{counts.expired}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl p-4 border">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">অনুসন্ধান</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="কোটা #, RFQ #, শিরোনাম..."
                    className="w-full pl-10 border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">সব স্ট্যাটাস</option>
                  <option value="pending">অপেক্ষমান</option>
                  <option value="accepted">গৃহীত</option>
                  <option value="rejected">প্রত্যাখ্যাত</option>
                </select>
              </div>

              {/* RFQ Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RFQ</label>
                <select
                  value={filters.rfq_id}
                  onChange={(e) => handleFilterChange('rfq_id', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">সব RFQ</option>
                  {rfqs.map((rfq) => (
                    <option key={rfq.id} value={rfq.id}>
                      {rfq.title} ({rfq.rfq_number})
                    </option>
                  ))}
                </select>
              </div>

              {/* Validity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">মেয়াদ</label>
                <select
                  value={filters.validity}
                  onChange={(e) => handleFilterChange('validity', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">সব</option>
                  <option value="valid">বৈধ</option>
                  <option value="expired">মেয়াদোত্তীর্ণ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date Range Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">থেকে তারিখ</label>
                <input
                  type="date"
                  value={filters.from_date}
                  onChange={(e) => handleFilterChange('from_date', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">পর্যন্ত তারিখ</label>
                <input
                  type="date"
                  value={filters.to_date}
                  onChange={(e) => handleFilterChange('to_date', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">সাজান</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="latest">সর্বশেষ প্রথম</option>
                  <option value="oldest">পুরানো প্রথম</option>
                  <option value="amount_high">পরিমাণ: বেশি থেকে কম</option>
                  <option value="amount_low">পরিমাণ: কম থেকে বেশি</option>
                  <option value="valid_until">মেয়াদ শেষ</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  ফিল্টার প্রয়োগ
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  রিসেট
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Quotes List */}
        {quotes.data.length === 0 ? (
          // Empty State - No quotes
          <div className="bg-white rounded-xl p-12 text-center border">
            <FiFileText className="mx-auto text-5xl text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">কোনো কোটা নেই</h3>
            <p className="text-gray-500 mb-6">যখন সাপ্লায়াররা আপনার RFQ-তে সাড়া দেবে, কোটা এখানে দেখাবে</p>
            <Link
              href={route('buyer.rfqs.create')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center"
            >
              নতুন RFQ তৈরি করুন
            </Link>
          </div>
        ) : (
          // Quote Items List
          <div className="space-y-4">
            {quotes.data.map((quote) => (
              <div key={quote.id} className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                  {/* Selection Checkbox */}
                  <div className="flex items-start lg:items-center mr-4">
                    <input
                      type="checkbox"
                      checked={selectedQuotes.includes(quote.id)}
                      onChange={() => toggleQuoteSelection(quote.id)}
                      disabled={quote.status !== 'pending' || !isQuoteValid(quote)}
                      className="mt-1 lg:mt-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex items-start mb-3">
                      {getStatusIcon(quote.status)}
                      <div className="ml-2 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="font-semibold text-lg text-gray-800">
                            কোটা #{quote.quote_number}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(quote.status)}`}>
                            {quote.status === 'pending' ? 'অপেক্ষমান' :
                              quote.status === 'accepted' ? 'গৃহীত' :
                                quote.status === 'rejected' ? 'প্রত্যাখ্যাত' :
                                  quote.status === 'expired' ? 'মেয়াদোত্তীর্ণ' : quote.status}
                          </span>
                          {!isQuoteValid(quote) && quote.status === 'pending' && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                              মেয়াদোত্তীর্ণ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RFQ Info */}
                    <div className="mb-3">
                      <Link
                        href={route('buyer.rfqs.show', quote.rfq.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        RFQ: {quote.rfq.title} (#{quote.rfq.rfq_number})
                      </Link>
                    </div>

                    {/* Supplier Info */}
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <FiUser className="mr-1" />
                      <span>সাপ্লায়ার: {quote.supplier?.name}</span>
                      {quote.supplier?.supplier?.verification_status === 'verified' && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded">
                          ভেরিফাইড
                        </span>
                      )}
                    </div>

                    {/* Quote Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">মোট পরিমাণ</p>
                        <p className="font-bold text-indigo-600">{formatCurrency(quote.total_amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">মেয়াদ শেষ</p>
                        <p className="text-sm flex items-center">
                          <FiCalendar className="mr-1 text-gray-400" />
                          {formatDate(quote.valid_until)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">প্রাপ্তির তারিখ</p>
                        <p className="text-sm">{formatDate(quote.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">আইটেম</p>
                        <p className="text-sm">{quote.rfq?.products_requested?.length || 0} টি পণ্য</p>
                      </div>
                    </div>

                    {/* Product Breakdown Preview */}
                    {quote.product_breakdown && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">মূল্য বিশ্লেষণ:</p>
                        <div className="space-y-1">
                          {quote.product_breakdown.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span>{item.name} x {item.quantity}</span>
                              <span>{formatCurrency(item.price)}</span>
                            </div>
                          ))}
                          {quote.product_breakdown.length > 2 && (
                            <p className="text-xs text-gray-500">+{quote.product_breakdown.length - 2} আরো আইটেম</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 mt-4 lg:mt-0 lg:ml-6">
                    <Link
                      href={route('buyer.quotes.show', quote.id)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center justify-center"
                    >
                      <FiEye className="mr-2" />
                      বিস্তারিত দেখুন
                    </Link>

                    {quote.status === 'pending' && isQuoteValid(quote) && (
                      <>
                        <Link
                          href={route('buyer.quotes.accept-confirm', quote.id)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center"
                        >
                          <FiCheckCircle className="mr-2" />
                          গ্রহণ
                        </Link>
                        <Link
                          href={route('buyer.quotes.reject-confirm', quote.id)}
                          className="px-4 py-2 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 transition-colors inline-flex items-center justify-center"
                        >
                          <FiXCircle className="mr-2" />
                          প্রত্যাখ্যান
                        </Link>
                      </>
                    )}

                    <button
                      onClick={() => router.get(route('buyer.quotes.download', quote.id))}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
                    >
                      <FiDownload className="mr-2" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {quotes.links && quotes.links.length > 3 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  {quotes.links.map((link, index) => (
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
        )}
      </div>
    </DashboardLayout>
  );
}