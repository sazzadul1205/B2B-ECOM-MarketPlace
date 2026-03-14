// Pages/Buyer/Rfqs/Index.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Buyer dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiFileText,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiDollarSign,
  FiPackage
} from 'react-icons/fi';

export default function RfqIndex({ rfqs, counts }) {

  // State management for filters
  const [filters, setFilters] = useState({
    status: '',
    sort: 'latest'
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    router.get(route('buyer.rfqs.index'), newFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Format date - Converts ISO date to readable format
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color based on RFQ status
  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-green-100 text-green-700',
      'closed': 'bg-blue-100 text-blue-700',
      'cancelled': 'bg-red-100 text-red-700',
      'pending': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Get status icon based on RFQ status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <FiClock className="text-green-600" />;
      case 'closed':
        return <FiCheckCircle className="text-blue-600" />;
      case 'cancelled':
        return <FiXCircle className="text-red-600" />;
      default:
        return <FiAlertCircle className="text-yellow-600" />;
    }
  };

  return (
    <DashboardLayout>
      <Head title="আমার RFQ সমূহ" />

      <div className="space-y-6">
        {/* Header - Page title and create button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">আমার RFQ</h2>
            <p className="text-gray-600 mt-1">আপনার কোটা অনুরোধগুলি পরিচালনা করুন</p>
          </div>
          <Link
            href={route('buyer.rfqs.create')}
            className="mt-3 md:mt-0 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center"
          >
            <FiPlus className="mr-2" /> নতুন RFQ তৈরি
          </Link>
        </div>

        {/* Stats Cards - Key metrics overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">মোট RFQ</p>
            <p className="text-2xl font-bold">{rfqs.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">খোলা RFQ</p>
            <p className="text-2xl font-bold text-green-600">{counts.open}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">কোটা প্রাপ্ত</p>
            <p className="text-2xl font-bold text-blue-600">{counts.quoted}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">বন্ধ RFQ</p>
            <p className="text-2xl font-bold text-gray-600">{counts.closed}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <FiFilter className="text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">ফিল্টার:</span>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">সব স্ট্যাটাস</option>
              <option value="open">খোলা</option>
              <option value="closed">বন্ধ</option>
              <option value="cancelled">বাতিল</option>
            </select>

            {/* Sort Filter */}
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="latest">সর্বশেষ প্রথম</option>
              <option value="oldest">পুরানো প্রথম</option>
              <option value="required_date">প্রয়োজনীয় তারিখ</option>
            </select>
          </div>
        </div>

        {/* RFQs List */}
        {rfqs.data.length === 0 ? (
          // Empty State - No RFQs found
          <div className="bg-white rounded-xl p-12 text-center border">
            <FiFileText className="mx-auto text-5xl text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">কোনো RFQ নেই</h3>
            <p className="text-gray-500 mb-6">সাপ্লায়ারদের কাছ থেকে কোটা পেতে আপনার প্রথম RFQ তৈরি করুন</p>
            <Link
              href={route('buyer.rfqs.create')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center"
            >
              <FiPlus className="mr-2" /> আপনার প্রথম RFQ তৈরি করুন
            </Link>
          </div>
        ) : (
          // RFQ Items List
          <div className="space-y-4">
            {rfqs.data.map((rfq) => (
              <div key={rfq.id} className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex items-start mb-3">
                      {getStatusIcon(rfq.status)}
                      <div className="ml-2 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="font-semibold text-lg text-gray-800">{rfq.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rfq.status)}`}>
                            {rfq.status === 'open' ? 'খোলা' :
                              rfq.status === 'closed' ? 'বন্ধ' :
                                rfq.status === 'cancelled' ? 'বাতিল' :
                                  rfq.status === 'pending' ? 'অপেক্ষমান' : rfq.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">RFQ #{rfq.rfq_number}</p>
                      </div>
                    </div>

                    {/* Products Requested List */}
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">পণ্যের তালিকা:</p>
                      <div className="space-y-2">
                        {rfq.products_requested?.map((product, index) => (
                          <div key={index} className="flex items-center text-sm bg-gray-50 p-2 rounded">
                            <FiPackage className="text-gray-400 mr-2" />
                            <span className="flex-1">{product.name}</span>
                            <span className="text-gray-600">{product.quantity} {product.unit}</span>
                            {product.category && (
                              <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded">
                                {product.category}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiClock className="mr-1" />
                        প্রয়োজনীয় তারিখ: {formatDate(rfq.required_by_date)}
                      </div>
                      <div className="flex items-center">
                        <FiFileText className="mr-1" />
                        {rfq.quotes?.length || 0} টি কোটা প্রাপ্ত
                      </div>
                      <div className="flex items-center">
                        তৈরির তারিখ: {formatDate(rfq.created_at)}
                      </div>
                    </div>

                    {/* Quote Preview - Show latest quote if available */}
                    {rfq.quotes?.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-2 flex items-center">
                          <FiDollarSign className="mr-1" /> সর্বশেষ কোটা:
                        </p>
                        {rfq.quotes.slice(0, 1).map((quote) => (
                          <div key={quote.id} className="flex items-center justify-between text-sm">
                            <span>সাপ্লায়ার: {quote.supplier?.name}</span>
                            <span className="font-medium">৳ {quote.total_amount?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 mt-4 md:mt-0 md:ml-6">
                    <Link
                      href={route('buyer.rfqs.show', rfq.id)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center justify-center"
                    >
                      <FiEye className="md:mr-2" />
                      <span className="hidden md:inline">বিস্তারিত দেখুন</span>
                    </Link>

                    {rfq.status === 'open' && (
                      <>
                        <Link
                          href={route('buyer.rfqs.edit', rfq.id)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
                        >
                          <FiEdit2 className="md:mr-2" />
                          <span className="hidden md:inline">সম্পাদনা</span>
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm('আপনি কি এই RFQ বাতিল করতে চান?')) {
                              router.delete(route('buyer.rfqs.cancel', rfq.id));
                            }
                          }}
                          className="px-4 py-2 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 transition-colors inline-flex items-center justify-center"
                        >
                          <FiTrash2 className="md:mr-2" />
                          <span className="hidden md:inline">বাতিল</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {rfqs.links && rfqs.links.length > 3 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  {rfqs.links.map((link, index) => (
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