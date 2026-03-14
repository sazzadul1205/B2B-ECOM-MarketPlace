// Pages/Admin/ProductApproval/Show.jsx

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
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiMail,
  FiPhone,
  FiMapPin,
} from 'react-icons/fi';
import {
  MdWarning,
  MdOutlineCategory,
} from 'react-icons/md';
import { BsBuilding } from 'react-icons/bs';

export default function Show({ product, similarProducts, supplierProducts }) {
  // State management for forms and UI controls
  const [notes, setNotes] = useState('');
  const [featured, setFeatured] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionDetails, setRejectionDetails] = useState({});
  const [sendNotification, setSendNotification] = useState(true);

  // Handle product approval
  const handleApprove = () => {
    Swal.fire({
      title: 'পণ্য অনুমোদন',
      text: `আপনি কি ${product.name} অনুমোদন করতে চান?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, অনুমোদন করুন',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.product-approval.approve', product.id), {
          notes,
          featured,
          send_notification: sendNotification
        }, {
          onSuccess: () => {
            Swal.fire({
              title: 'অনুমোদিত!',
              text: 'পণ্যটি সফলভাবে অনুমোদন করা হয়েছে।',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  // Handle product rejection
  const handleReject = () => {
    if (!rejectionReason) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে প্রত্যাখ্যানের কারণ উল্লেখ করুন।',
        icon: 'error',
        confirmButtonColor: '#4F46E5'
      });
      return;
    }

    Swal.fire({
      title: 'পণ্য প্রত্যাখ্যান',
      text: `আপনি কি ${product.name} প্রত্যাখ্যান করতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, প্রত্যাখ্যান করুন',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.product-approval.reject', product.id), {
          rejection_reason: rejectionReason,
          rejection_details: rejectionDetails,
          send_notification: sendNotification
        }, {
          onSuccess: () => {
            Swal.fire({
              title: 'প্রত্যাখ্যাত!',
              text: 'পণ্যটি প্রত্যাখ্যান করা হয়েছে।',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
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

  return (
    <DashboardLayout>
      <Head title={`${product.name} - পর্যালোচনা`} />

      <div className="space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center gap-4">
          <Link
            href={route('admin.product-approval.index')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">পণ্য পর্যালোচনা</h1>
            <p className="text-sm text-gray-600 mt-1">
              {product.name} পর্যালোচনা ও যাচাই করুন
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiPackage className="w-5 h-5 text-indigo-600" />
                পণ্যের ছবি
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.main_image ? (
                  <div className="col-span-2">
                    <img
                      src={product.main_image}
                      alt={product.name}
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                ) : (
                  <div className="col-span-2 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FiPackage className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Product Details - Tabbed interface */}
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
                    পণ্যের বিবরণ
                  </button>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className={`px-6 py-3 text-sm font-medium ${activeTab === 'pricing'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    মূল্য ও মজুত
                  </button>
                  <button
                    onClick={() => setActiveTab('supplier')}
                    className={`px-6 py-3 text-sm font-medium ${activeTab === 'supplier'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    সাপ্লায়ার তথ্য
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Product Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h4>
                      <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">ক্যাটাগরি</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <MdOutlineCategory className="w-4 h-4 text-indigo-600" />
                          {product.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ইউনিট</p>
                        <p className="font-medium text-gray-900">{product.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">সর্বনিম্ন অর্ডার পরিমাণ</p>
                        <p className="font-medium text-gray-900">{product.minimum_order_quantity} {product.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">স্টক পরিমাণ</p>
                        <p className="font-medium text-gray-900">{product.stock_quantity || 0} {product.unit}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">স্লাগ</p>
                      <p className="font-medium text-gray-900">{product.slug}</p>
                    </div>
                  </div>
                )}

                {/* Pricing & Inventory Tab */}
                {activeTab === 'pricing' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">মূল মূল্য</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(product.base_price)}</p>
                    </div>

                    {product.bulkPrices && product.bulkPrices.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">বাল্ক মূল্য স্তর</h4>
                        <div className="space-y-2">
                          {product.bulkPrices.map((tier, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {tier.min_quantity} - {tier.max_quantity || '∞'} {product.unit}
                                </span>
                              </div>
                              <span className="font-medium text-indigo-600">
                                {formatCurrency(tier.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Supplier Info Tab */}
                {activeTab === 'supplier' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                        <BsBuilding className="w-8 h-8 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{product.supplier?.company_name}</h4>
                        <p className="text-sm text-gray-500">{new Date(product.supplier?.created_at).getFullYear()} থেকে সাপ্লায়ার</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-2">
                        <FiMail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${product.supplier?.company_email}`} className="text-sm text-indigo-600 hover:text-indigo-700">
                          {product.supplier?.company_email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiPhone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${product.supplier?.company_phone}`} className="text-sm text-gray-600 hover:text-indigo-600">
                          {product.supplier?.company_phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiMapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {product.supplier?.company_address}, {product.supplier?.city}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500">যোগাযোগের ব্যক্তি</p>
                      <p className="font-medium text-gray-900">{product.supplier?.user?.name}</p>
                      <p className="text-sm text-gray-500">{product.supplier?.user?.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Review Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">পর্যালোচনা নোট</h3>
              <textarea
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="এই পণ্য পর্যালোচনা সম্পর্কে নোট যোগ করুন..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="mt-4 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">প্রচারিত পণ্য হিসেবে চিহ্নিত করুন</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sendNotification}
                    onChange={(e) => setSendNotification(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">সাপ্লায়ারকে ইমেইল নোটিফিকেশন পাঠান</span>
                </label>
              </div>
            </div>

            {/* Reject Form */}
            {showRejectForm && (
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
                  <MdWarning className="w-5 h-5" />
                  প্রত্যাখ্যানের কারণ
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      প্রত্যাখ্যানের কারণ *
                    </label>
                    <textarea
                      rows="3"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="কেন এই পণ্যটি প্রত্যাখ্যান করা হচ্ছে তা ব্যাখ্যা করুন..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      প্রত্যাখ্যান নিশ্চিত করুন
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">কার্যক্রম</h3>
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <FiCheckCircle className="w-5 h-5" />
                  পণ্য অনুমোদন
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <FiXCircle className="w-5 h-5" />
                  পণ্য প্রত্যাখ্যান
                </button>
                <button
                  onClick={() => router.get(route('admin.product-approval.index'))}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <FiArrowLeft className="w-5 h-5" />
                  তালিকায় ফিরে যান
                </button>
              </div>
            </div>

            {/* Product Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">স্ট্যাটাস</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">বর্তমান স্ট্যাটাস</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    পর্যালোচনাধীন
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">জমা দেওয়ার তারিখ</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(product.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">সাপ্লায়ার স্ট্যাটাস</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.supplier?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {product.supplier?.isVerified ? 'ভেরিফাইড' : 'ভেরিফিকেশন বিচারাধীন'}
                  </span>
                </div>
              </div>
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">অনুরূপ পণ্য</h3>
                <div className="space-y-3">
                  {similarProducts.map((similar) => (
                    <div key={similar.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{similar.name}</p>
                          <p className="text-sm text-gray-500">{similar.supplier?.company_name}</p>
                        </div>
                        <span className="text-sm font-medium text-indigo-600">
                          {formatCurrency(similar.base_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supplier's Other Products */}
            {supplierProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">সাপ্লায়ারের অন্যান্য পণ্য</h3>
                <div className="space-y-3">
                  {supplierProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiPackage className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(product.base_price)}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        অনুমোদিত
                      </span>
                    </div>
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