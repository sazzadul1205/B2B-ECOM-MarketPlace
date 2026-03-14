// Pages/Admin/Rfqs/Quotes.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head, Link } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiUser,
  FiClock,
  FiCalendar,
  FiArrowLeft,
  FiDollarSign,
} from 'react-icons/fi';
import {
  MdWarning,
  MdPending,
  MdVerified,
} from 'react-icons/md';
import { BsBuilding } from 'react-icons/bs';

export default function Quotes({ rfq, quotes }) {
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
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge with appropriate styling
  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: MdPending, label: 'অপেক্ষমান' },
      accepted: { color: 'bg-green-100 text-green-800', icon: MdVerified, label: 'গৃহীত' },
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

  // Check if quote is valid based on valid_until date
  const isValidQuote = (quote) => {
    return new Date(quote.valid_until) > new Date();
  };

  return (
    <DashboardLayout>
      <Head title={`RFQ #${rfq.rfq_number} - কোটা সমূহ`} />

      <div className="space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center gap-4">
          <Link
            href={route('admin.rfqs.show', rfq.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RFQ #{rfq.rfq_number} - কোটা সমূহ</h1>
            <p className="text-sm text-gray-600 mt-1">
              {rfq.title} - জমা দেওয়া সকল কোটা
            </p>
          </div>
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 gap-6">
          {quotes.length === 0 ? (
            // Empty state - No quotes submitted
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <FiDollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">এই RFQ-এর জন্য এখনও কোনো কোটা জমা দেওয়া হয়নি।</p>
            </div>
          ) : (
            // List of quotes
            quotes.map((quote) => (
              <div key={quote.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                <div className="p-6">
                  {/* Header - Supplier info and status */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                        <BsBuilding className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{quote.supplier?.name}</h3>
                        <p className="text-sm text-gray-500">{quote.supplier?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(quote.status)}
                      {!isValidQuote(quote) && quote.status === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          মেয়াদোত্তীর্ণ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quote Details - Summary cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">মোট পরিমাণ</p>
                      <p className="text-2xl font-bold text-indigo-600">{formatCurrency(quote.total_amount)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">মেয়াদ শেষ</p>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        <span className="text-lg font-semibold text-gray-900">{formatDate(quote.valid_until)}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">কোটা নম্বর</p>
                      <p className="text-lg font-mono font-semibold text-gray-900">{quote.quote_number}</p>
                    </div>
                  </div>

                  {/* Product Breakdown - Detailed pricing */}
                  {quote.product_breakdown && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-3">পণ্যের বিবরণ</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {Array.isArray(quote.product_breakdown) ? (
                          <div className="space-y-2">
                            {quote.product_breakdown.map((item, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{item.product_name || 'পণ্য'}</span>
                                <div className="text-right">
                                  <span className="text-sm text-gray-900">{item.quantity} x {formatCurrency(item.price)}</span>
                                  <span className="text-sm font-medium text-indigo-600 ml-4">
                                    {formatCurrency(item.quantity * item.price)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                            {JSON.stringify(quote.product_breakdown, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer - Submission info and order link */}
                  <div className="mt-6 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        জমা: {formatDate(quote.created_at)}
                      </span>
                      {quote.supplierProfile && (
                        <span className="flex items-center gap-1">
                          <FiUser className="w-4 h-4" />
                          {quote.supplierProfile.company_name}
                        </span>
                      )}
                    </div>
                    {quote.order && (
                      <Link
                        href={route('admin.orders.show', quote.order.id)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                      >
                        অর্ডার দেখুন
                        <FiArrowLeft className="w-4 h-4 rotate-180" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}