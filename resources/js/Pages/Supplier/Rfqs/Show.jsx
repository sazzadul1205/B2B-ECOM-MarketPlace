// Pages/Supplier/Rfqs/Show.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head, Link } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiArrowLeft,
  FiCalendar,
  FiUser,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiMessageSquare
} from 'react-icons/fi';
import { MdPending } from 'react-icons/md';

export default function RfqShow({
  rfq,
  isOpen,
  canQuote,
  otherQuotes,
  existingQuote,
  supplierProducts,
}) {
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
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate days remaining until deadline
  const getDaysRemaining = () => {
    const now = new Date();
    const deadline = new Date(rfq.required_by_date);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'মেয়াদোত্তীর্ণ', color: 'text-red-600' };
    if (diffDays === 0) return { text: 'আজ', color: 'text-orange-600' };
    if (diffDays === 1) return { text: 'আগামীকাল', color: 'text-yellow-600' };
    return { text: `${diffDays} দিন বাকি`, color: 'text-green-600' };
  };

  // Calculate days remaining until deadline
  const daysRemaining = getDaysRemaining();

  // Get quote status badge with appropriate styling
  const getQuoteStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: MdPending, label: 'অপেক্ষমান' },
      accepted: { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle, label: 'গৃহীত' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle, label: 'প্রত্যাখ্যাত' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <Head title={`RFQ #${rfq.rfq_number}`} />

      <div className="space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center gap-4">
          <Link
            href={route('supplier.rfqs.index')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RFQ #{rfq.rfq_number}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(rfq.created_at)} তারিখে পোস্ট করা হয়েছে
            </p>
          </div>
        </div>

        {/* Status Alert - When RFQ is closed */}
        {!isOpen && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-start">
              <FiXCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 font-medium">
                  এই RFQ আর কোটা গ্রহণের জন্য উন্মুক্ত নেই
                </p>
                <p className="text-sm text-red-600 mt-1">
                  সময়সীমা শেষ হয়েছে বা RFQ বন্ধ করা হয়েছে।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Existing Quote Alert */}
        {existingQuote && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
            <div className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-green-700 font-medium">
                  আপনি ইতিমধ্যে এই RFQ-র জন্য একটি কোটা জমা দিয়েছেন
                </p>
                <p className="text-sm text-green-600 mt-1">
                  কোটা নম্বর: {existingQuote.quote_number} | স্ট্যাটাস: {existingQuote.status === 'pending' ? 'অপেক্ষমান' :
                    existingQuote.status === 'accepted' ? 'গৃহীত' : 'প্রত্যাখ্যাত'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - RFQ Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* RFQ Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">RFQ বিবরণ</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">শিরোনাম</p>
                  <p className="font-medium text-gray-900">{rfq.title}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">বিবরণ</p>
                  <p className="text-gray-700 whitespace-pre-line">{rfq.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">মোট পরিমাণ</p>
                    <p className="font-bold text-gray-900">{rfq.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">প্রয়োজনীয় তারিখ</p>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{formatDate(rfq.required_by_date)}</span>
                    </div>
                    <p className={`text-sm ${daysRemaining.color}`}>{daysRemaining.text}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Requested Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ক্রেতার অনুরোধ</h2>

              {rfq.products_requested && rfq.products_requested.length > 0 ? (
                <div className="space-y-4">
                  {rfq.products_requested.map((product, index) => {
                    // Find matching supplier product
                    const matchingProduct = supplierProducts?.find(
                      p => p.category?.toLowerCase() === product.category?.toLowerCase()
                    );

                    return (
                      <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <FiPackage className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{product.name || product.category}</p>
                            {product.description && (
                              <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                            )}
                            <div className="flex gap-4 mt-2">
                              <p className="text-sm">
                                <span className="text-gray-500">পরিমাণ:</span>{' '}
                                <span className="font-medium">{product.quantity || 'N/A'}</span>
                              </p>
                              {product.unit && (
                                <p className="text-sm">
                                  <span className="text-gray-500">ইউনিট:</span>{' '}
                                  <span className="font-medium">{product.unit}</span>
                                </p>
                              )}
                            </div>

                            {/* Show matching product info */}
                            {matchingProduct && (
                              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                                <p className="text-xs text-green-700">
                                  ✓ আপনার মিলে যাওয়া পণ্য আছে: <span className="font-medium">{matchingProduct.name}</span>
                                  ({formatCurrency(matchingProduct.base_price)}/{matchingProduct.unit})
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">কোনো নির্দিষ্ট পণ্য অনুরোধ করা হয়নি</p>
              )}
            </div>

            {/* Other Quotes (if any) */}
            {otherQuotes.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">অন্যান্য কোটা</h2>
                <p className="text-sm text-gray-500 mb-4">
                  এই RFQ-র জন্য {otherQuotes.length} জন অন্যান্য সাপ্লায়ার কোটা দিয়েছেন
                </p>
                <div className="space-y-3">
                  {otherQuotes.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{quote.supplier?.supplier?.company_name || 'সাপ্লায়ার'}</p>
                        <p className="text-sm text-gray-500">কোটা #{quote.quote_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{formatCurrency(quote.total_amount)}</p>
                        <p className="text-xs text-gray-400">{formatDate(quote.valid_until)} পর্যন্ত বৈধ</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Buyer Info & Actions */}
          <div className="space-y-6">
            {/* Buyer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ক্রেতার তথ্য</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiUser className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">নাম</p>
                    <p className="font-medium text-gray-900">{rfq.buyer?.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiMessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">সদস্য হন</p>
                    <p className="font-medium text-gray-900">
                      {rfq.buyer?.created_at ? formatDate(rfq.buyer.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Quote (if exists) */}
            {existingQuote && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">আপনার কোটা</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">কোটা নম্বর</p>
                    <p className="font-medium text-gray-900">{existingQuote.quote_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">মোট পরিমাণ</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(existingQuote.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">স্ট্যাটাস</p>
                    {getQuoteStatusBadge(existingQuote.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">মেয়াদ শেষ</p>
                    <p className="font-medium text-gray-900">{formatDate(existingQuote.valid_until)}</p>
                  </div>

                  {existingQuote.status === 'pending' && (
                    <Link
                      href={route('supplier.rfqs.edit-quote', existingQuote.id)}
                      className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      কোটা সম্পাদনা
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons - Submit Quote */}
            {!existingQuote && isOpen && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">কোটা জমা দিন</h2>

                {canQuote ? (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      আপনি আপনার পণ্যের ভিত্তিতে এই RFQ-র জন্য একটি কোটা জমা দিতে পারেন।
                    </p>
                    <Link
                      href={route('supplier.rfqs.create-quote', rfq.id)}
                      className="block w-full text-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                    >
                      কোটা তৈরি করুন
                    </Link>
                  </>
                ) : (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-700 font-medium">
                          এই RFQ-র জন্য কোটা দিতে পারবেন না
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          কোটা দেওয়ার জন্য আপনার সক্রিয় পণ্য প্রয়োজন।
                          <Link href={route('supplier.products.create')} className="ml-1 underline">
                            পণ্য যোগ করুন →
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Matching Products */}
            {supplierProducts && supplierProducts.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">আপনার পণ্য</h2>
                <div className="space-y-3">
                  {supplierProducts.map((product) => {
                    // Check if this product matches any requested product category
                    const isMatching = rfq.products_requested?.some(
                      requested => requested.category?.toLowerCase() === product.category?.toLowerCase()
                    );

                    return (
                      <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <FiPackage className={`w-4 h-4 ${isMatching ? 'text-green-500' : 'text-gray-400'}`} />
                          <div>
                            <span className="text-sm text-gray-700">{product.name}</span>
                            {product.category && (
                              <span className="text-xs text-gray-500 ml-2">({product.category})</span>
                            )}
                            {isMatching && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                অনুরোধের সাথে মেলে
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-indigo-600">
                            {formatCurrency(product.base_price)}
                          </span>
                          {product.unit && (
                            <span className="text-xs text-gray-400 ml-1">/{product.unit}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">আপনার পণ্য</h2>
                <div className="text-center py-4">
                  <FiPackage className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">কোনো পণ্য পাওয়া যায়নি</p>
                  <Link
                    href={route('supplier.products.create')}
                    className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
                  >
                    আপনার প্রথম পণ্য যোগ করুন →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}