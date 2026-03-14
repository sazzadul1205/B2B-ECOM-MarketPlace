// Pages/Admin/Rfqs/Show.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// sweetalert - For beautiful alert messages
import Swal from 'sweetalert2';

// Icons - Importing icon sets for UI elements
import {
  FiArrowLeft,
  FiCalendar,
  FiUser,
  FiMail,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiMessageSquare,
  FiEye,
} from 'react-icons/fi';
import {
  MdVerified,
  MdPending,
  MdWarning
} from 'react-icons/md';
import { BsBuilding } from 'react-icons/bs';

export default function Show({ rfq }) {
  // State management for tabs and forms
  const [activeTab, setActiveTab] = useState('details');
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [closeData, setCloseData] = useState({ reason: '', notify_buyer: true });

  // Handle close RFQ
  const handleCloseRfq = () => {
    if (!closeData.reason) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'RFQ বন্ধ করার কারণ প্রদান করুন।',
        icon: 'error',
        confirmButtonColor: '#4F46E5'
      });
      return;
    }

    router.post(route('admin.rfqs.close', rfq.id), closeData, {
      onSuccess: () => {
        setShowCloseForm(false);
        Swal.fire({
          title: 'বন্ধ!',
          text: 'RFQ সফলভাবে বন্ধ করা হয়েছে।',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  // Handle reopen RFQ
  const handleReopenRfq = () => {
    Swal.fire({
      title: 'RFQ পুনরায় খুলুন',
      text: 'আপনি কি এই RFQ পুনরায় খুলতে চান?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, পুনরায় খুলুন',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.rfqs.reopen', rfq.id), {}, {
          onSuccess: () => {
            Swal.fire({
              title: 'পুনরায় খোলা!',
              text: 'RFQ সফলভাবে পুনরায় খোলা হয়েছে।',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  // Handle delete RFQ
  const handleDelete = () => {
    Swal.fire({
      title: 'RFQ মুছুন',
      text: `আপনি কি RFQ ${rfq.rfq_number} মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.rfqs.destroy', rfq.id), {
          onSuccess: () => {
            router.get(route('admin.rfqs.index'));
          }
        });
      }
    });
  };

  // Format date - Converts ISO date to readable format
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get status badge with appropriate styling
  const getStatusBadge = (status) => {
    const badges = {
      open: { color: 'bg-green-100 text-green-800', icon: MdPending, label: 'খোলা' },
      quoted: { color: 'bg-blue-100 text-blue-800', icon: MdVerified, label: 'কোটা প্রাপ্ত' },
      closed: { color: 'bg-red-100 text-red-800', icon: MdWarning, label: 'বন্ধ' },
    };
    const badge = badges[status] || badges.open;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.label}
      </span>
    );
  };

  // Parse products from JSON
  const products = typeof rfq.products_requested === 'string'
    ? JSON.parse(rfq.products_requested)
    : rfq.products_requested || [];

  return (
    <DashboardLayout>
      <Head title={`RFQ #${rfq.rfq_number} - বিস্তারিত`} />

      <div className="space-y-6">
        {/* Header - Back button, title and action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={route('admin.rfqs.index')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RFQ #{rfq.rfq_number}</h1>
              <p className="text-sm text-gray-600 mt-1">
                কোটা অনুরোধের বিস্তারিত তথ্য
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {rfq.status === 'closed' ? (
              <button
                onClick={handleReopenRfq}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FiCheckCircle className="w-4 h-4" />
                RFQ পুনরায় খুলুন
              </button>
            ) : (
              <button
                onClick={() => setShowCloseForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <FiXCircle className="w-4 h-4" />
                RFQ বন্ধ করুন
              </button>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <FiXCircle className="w-4 h-4" />
              মুছুন
            </button>
          </div>
        </div>

        {/* Close RFQ Form */}
        {showCloseForm && (
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
            <h3 className="font-semibold text-yellow-600 mb-4">RFQ বন্ধ করুন</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বন্ধ করার কারণ *
                </label>
                <textarea
                  value={closeData.reason}
                  onChange={(e) => setCloseData({ ...closeData, reason: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="কেন এই RFQ বন্ধ করা হচ্ছে তা ব্যাখ্যা করুন..."
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={closeData.notify_buyer}
                    onChange={(e) => setCloseData({ ...closeData, notify_buyer: e.target.checked })}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">ক্রেতাকে এই বন্ধের বিষয়ে জানান</span>
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCloseForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleCloseRfq}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  RFQ বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Bar - Current status and creation date */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            {getStatusBadge(rfq.status)}
            <span className="text-sm text-gray-500">
              তৈরি {formatDate(rfq.created_at)}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs for different sections */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-6 py-3 text-sm font-medium ${activeTab === 'details'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    RFQ বিবরণ
                  </button>
                  <button
                    onClick={() => setActiveTab('quotes')}
                    className={`px-6 py-3 text-sm font-medium ${activeTab === 'quotes'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    কোটা ({rfq.quotes?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`px-6 py-3 text-sm font-medium ${activeTab === 'messages'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    বার্তা ({rfq.messages?.length || 0})
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* RFQ Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Title and Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{rfq.title}</h3>
                      <p className="text-gray-600 whitespace-pre-line">{rfq.description}</p>
                    </div>

                    {/* Products Requested */}
                    {products.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">পণ্যের তালিকা</h4>
                        <div className="space-y-2">
                          {products.map((product, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-900">{product.product_name || 'পণ্য'}</span>
                              <span className="text-sm text-gray-600">
                                পরিমাণ: {product.quantity || rfq.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Details */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-500">মোট পরিমাণ</p>
                        <p className="font-medium text-gray-900">{rfq.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">প্রয়োজনীয় তারিখ</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <FiCalendar className="w-4 h-4 text-indigo-600" />
                          {formatDate(rfq.required_by_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quotes Tab */}
                {activeTab === 'quotes' && (
                  <div className="space-y-4">
                    {rfq.quotes?.length > 0 ? (
                      rfq.quotes.map((quote) => (
                        <div key={quote.id} className="border rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <BsBuilding className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{quote.supplier?.name}</p>
                                <p className="text-sm text-gray-500">{quote.supplier?.email}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quote.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : quote.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {quote.status === 'accepted' ? 'গৃহীত' :
                                quote.status === 'rejected' ? 'প্রত্যাখ্যাত' : 'অপেক্ষমান'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <p className="text-xs text-gray-500">মোট পরিমাণ</p>
                              <p className="text-sm font-medium text-indigo-600">
                                {formatCurrency(quote.total_amount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">মেয়াদ শেষ</p>
                              <p className="text-sm text-gray-900">{formatDate(quote.valid_until)}</p>
                            </div>
                          </div>
                          {quote.product_breakdown && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs font-medium text-gray-700 mb-2">পণ্যের বিবরণ:</p>
                              <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                {JSON.stringify(quote.product_breakdown, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">এখনও কোনো কোটা পাওয়া যায়নি।</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                  <div className="space-y-4">
                    {rfq.messages?.length > 0 ? (
                      rfq.messages.map((message) => (
                        <div key={message.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{message.sender?.name}</span>
                              <span className="text-xs text-gray-500">থেকে {message.receiver?.name}</span>
                            </div>
                            <span className="text-xs text-gray-400">{formatDate(message.created_at)}</span>
                          </div>
                          <p className="text-gray-700">{message.message}</p>
                          {!message.is_read && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                              অপঠিত
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">এই RFQ-এর জন্য কোনো বার্তা নেই।</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Buyer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-indigo-600" />
                ক্রেতার তথ্য
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-blue-600">
                      {rfq.buyer?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{rfq.buyer?.name}</p>
                    <p className="text-sm text-gray-500">ক্রেতা</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${rfq.buyer?.email}`} className="text-indigo-600 hover:text-indigo-700">
                    {rfq.buyer?.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Order Information - If RFQ converted to order */}
            {rfq.order && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-indigo-600" />
                  অর্ডারের তথ্য
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-500">অর্ডার #:</span>{' '}
                    <span className="font-medium text-gray-900">{rfq.order.order_number}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">স্ট্যাটাস:</span>{' '}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${rfq.order.order_status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : rfq.order.order_status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {rfq.order.order_status === 'delivered' ? 'ডেলিভারি হয়েছে' :
                        rfq.order.order_status === 'cancelled' ? 'বাতিল' :
                          rfq.order.order_status === 'processing' ? 'প্রক্রিয়াধীন' :
                            rfq.order.order_status === 'shipped' ? 'পাঠানো হয়েছে' :
                              rfq.order.order_status === 'confirmed' ? 'নিশ্চিত' :
                                rfq.order.order_status === 'pending_confirmation' ? 'অপেক্ষমান' : rfq.order.order_status}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">পরিমাণ:</span>{' '}
                    <span className="font-medium text-indigo-600">
                      {formatCurrency(rfq.order.total_amount)}
                    </span>
                  </p>
                  <Link
                    href={route('admin.orders.show', rfq.order.id)}
                    className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mt-2"
                  >
                    অর্ডারের বিস্তারিত দেখুন
                    <FiArrowLeft className="w-3 h-3 rotate-180" />
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">দ্রুত কার্যক্রম</h3>
              <div className="space-y-2">
                <Link
                  href={route('admin.rfqs.quotes', rfq.id)}
                  className="flex items-center gap-2 p-3 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <FiEye className="w-5 h-5" />
                  <span>সকল কোটা দেখুন</span>
                </Link>
                {rfq.status !== 'closed' && (
                  <button
                    onClick={() => setShowCloseForm(true)}
                    className="flex items-center gap-2 p-3 text-yellow-600 hover:bg-yellow-50 rounded-lg transition w-full text-left"
                  >
                    <FiXCircle className="w-5 h-5" />
                    <span>RFQ বন্ধ করুন</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}