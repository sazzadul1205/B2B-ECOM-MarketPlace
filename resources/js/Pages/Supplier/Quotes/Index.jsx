// Pages/Supplier/Quotes/Index.jsx

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
  FiEye,
  FiEdit2,
  FiCopy,
  FiXCircle,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { MdPending } from 'react-icons/md';

// sweetalert - For beautiful alert messages
import Swal from 'sweetalert2';

export default function QuotesIndex({ quotes, stats, statusCounts }) {
  // State management for filters and sorting
  const [dateTo, setDateTo] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [validityFilter, setValidityFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date - Converts ISO date to readable format
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get quote status badge with appropriate styling
  const getStatusBadge = (quote) => {
    // Check if expired
    if (quote.status === 'pending' && new Date(quote.valid_until) < new Date()) {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: FiClock,
        label: 'মেয়াদোত্তীর্ণ'
      };
    }

    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: MdPending, label: 'অপেক্ষমান' },
      accepted: { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle, label: 'গৃহীত' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle, label: 'প্রত্যাখ্যাত' },
      withdrawn: { bg: 'bg-gray-100', text: 'text-gray-800', icon: FiXCircle, label: 'প্রত্যাহার' }
    };
    return badges[quote.status] || badges.pending;
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Apply all filters to the quote list
  const applyFilters = () => {
    router.get(route('supplier.quotes.index'), {
      search: searchTerm,
      status: statusFilter,
      validity: validityFilter,
      date_from: dateFrom,
      date_to: dateTo,
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
    setValidityFilter('');
    setDateFrom('');
    setDateTo('');
    setSortField('created_at');
    setSortDirection('desc');

    router.get(route('supplier.quotes.index'), {}, {
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

  // Handle quote duplication
  const handleDuplicate = (id) => {
    Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "এই কোটা থেকে একটি নতুন কপি তৈরি করা হবে",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, কপি তৈরি করুন",
      cancelButtonText: "না",
      confirmButtonColor: "#16a34a",
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route("supplier.quotes.duplicate", id), {}, {
          onSuccess: () => {
            Swal.fire({
              icon: "success",
              title: "সফল",
              text: "কোটার কপি সফলভাবে তৈরি হয়েছে"
            });
          },
          onError: () => {
            Swal.fire({
              icon: "error",
              title: "ত্রুটি",
              text: "কোটার কপি তৈরি করা যায়নি"
            });
          }
        });
      }
    });
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
      <Head title="আমার কোটা সমূহ" />

      <div className="space-y-6">
        {/* Header - Page title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">আমার কোটা</h1>
            <p className="text-sm text-gray-600 mt-1">
              আপনার জমা দেওয়া সকল কোটা ট্র্যাক এবং পরিচালনা করুন
            </p>
          </div>
        </div>

        {/* Stats Cards - Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">মোট কোটা</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-4">
            <p className="text-sm text-yellow-600">অপেক্ষমান</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">মেয়াদোত্তীর্ণ</p>
            <p className="text-2xl font-bold text-gray-700">{stats.expired}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-4">
            <p className="text-sm text-green-600">গৃহীত</p>
            <p className="text-2xl font-bold text-green-700">{stats.accepted}</p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-4">
            <p className="text-sm text-red-600">প্রত্যাখ্যাত</p>
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          </div>
          <div className="bg-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-4">
            <p className="text-sm text-indigo-600">রূপান্তর হার</p>
            <p className="text-2xl font-bold text-indigo-700">{stats.conversion_rate}%</p>
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
                      placeholder="কোটা, RFQ নম্বর বা ক্রেতার নাম দ্বারা অনুসন্ধান..."
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
                    <option value="pending">অপেক্ষমান ({statusCounts.pending})</option>
                    <option value="accepted">গৃহীত ({statusCounts.accepted})</option>
                    <option value="rejected">প্রত্যাখ্যাত ({statusCounts.rejected})</option>
                  </select>
                </div>

                {/* Validity Filter */}
                <div>
                  <select
                    value={validityFilter}
                    onChange={(e) => setValidityFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    <option value="">সব কোটা</option>
                    <option value="valid">বৈধ</option>
                    <option value="expired">মেয়াদোত্তীর্ণ</option>
                  </select>
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

        {/* Quotes Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('quote_number')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      কোটা #
                      <SortIcon field="quote_number" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RFQ / ক্রেতা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total_amount')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      পরিমাণ
                      <SortIcon field="total_amount" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('valid_until')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      মেয়াদ শেষ
                      <SortIcon field="valid_until" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      জমার তারিখ
                      <SortIcon field="created_at" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.data.map((quote) => {
                  const badge = getStatusBadge(quote);
                  const Icon = badge.icon;
                  const isExpired = quote.status === 'pending' && new Date(quote.valid_until) < new Date();
                  const isPending = quote.status === 'pending' && !isExpired;

                  return (
                    <tr key={quote.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <Link
                          href={route('supplier.quotes.show', quote.id)}
                          className="font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          {quote.quote_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{quote.rfq?.title}</p>
                          <p className="text-xs text-gray-500">
                            RFQ: {quote.rfq?.rfq_number} • ক্রেতা: {quote.rfq?.buyer?.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-indigo-600">{formatCurrency(quote.total_amount)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3 text-gray-400" />
                          <span className={`text-sm ${isExpired ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {formatDate(quote.valid_until)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(quote.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={route('supplier.quotes.show', quote.id)}
                            className="p-2 text-gray-400 hover:text-indigo-600"
                            title="বিস্তারিত দেখুন"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>

                          {isPending && (
                            <>
                              <Link
                                href={route('supplier.quotes.edit', quote.id)}
                                className="p-2 text-gray-400 hover:text-indigo-600"
                                title="কোটা সম্পাদনা"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDuplicate(quote.id)}
                                className="p-2 text-gray-400 hover:text-indigo-600"
                                title="কোটা ডুপ্লিকেট"
                              >
                                <FiCopy className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {quote.order && (
                            <Link
                              href={route('supplier.orders.show', quote.order.id)}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              title="অর্ডার দেখুন"
                            >
                              অর্ডার হয়েছে
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Empty State */}
                {quotes.data.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">কোনো কোটা পাওয়া যায়নি</p>
                      <p className="text-gray-400">
                        {searchTerm || statusFilter || dateFrom || dateTo
                          ? 'আপনার ফিল্টার সামঞ্জস্য করুন'
                          : 'আপনি এখনও কোনো কোটা জমা দেননি'}
                      </p>
                      {!searchTerm && !statusFilter && !dateFrom && !dateTo && (
                        <Link
                          href={route('supplier.rfqs.index')}
                          className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          RFQ ব্রাউজ করুন
                        </Link>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {quotes.links && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  মোট {quotes.total} টির মধ্যে {quotes.from} থেকে {quotes.to} দেখানো হচ্ছে
                </p>
                <div className="flex gap-2">
                  {quotes.links.map((link, index) => (
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