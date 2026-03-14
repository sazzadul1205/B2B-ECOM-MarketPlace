// Pages/Admin/SupplierVerification/Verify.jsx

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
  FiAlertCircle,
  FiSend,
  FiPackage
} from 'react-icons/fi';
import {
  MdWarning,
  MdOutlineStorefront,
  MdOutlineDescription
} from 'react-icons/md';

export default function Verify({ verificationData }) {
  // Destructure verification data
  const { supplier, documents, existing_products, user_status } = verificationData;

  // State management for forms and UI controls
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [showDocRequestForm, setShowDocRequestForm] = useState(false);
  const [documentRequest, setDocumentRequest] = useState({ message: '' });

  // Handle approve supplier
  const handleApprove = () => {
    Swal.fire({
      title: 'সাপ্লায়ার অনুমোদন',
      text: `আপনি কি ${supplier.company_name} অনুমোদন করতে চান?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, অনুমোদন',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.supplier-verification.approve', supplier.id), {
          notes,
          send_notification: sendNotification
        }, {
          onSuccess: () => {
            Swal.fire({
              title: 'অনুমোদিত!',
              text: 'সাপ্লায়ার সফলভাবে ভেরিফাই করা হয়েছে।',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  // Handle reject supplier
  const handleReject = () => {
    if (!rejectionReason) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'প্রত্যাখ্যানের কারণ প্রদান করুন।',
        icon: 'error',
        confirmButtonColor: '#4F46E5'
      });
      return;
    }

    Swal.fire({
      title: 'সাপ্লায়ার প্রত্যাখ্যান',
      text: `আপনি কি ${supplier.company_name} প্রত্যাখ্যান করতে চান?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, প্রত্যাখ্যান',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.supplier-verification.reject', supplier.id), {
          rejection_reason: rejectionReason,
          send_notification: sendNotification
        }, {
          onSuccess: () => {
            Swal.fire({
              title: 'প্রত্যাখ্যাত!',
              text: 'সাপ্লায়ার ভেরিফিকেশন প্রত্যাখ্যান করা হয়েছে।',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  // Handle document request
  const handleDocumentRequest = () => {
    if (!documentRequest.message) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'সাপ্লায়ারের জন্য একটি বার্তা প্রদান করুন।',
        icon: 'error',
        confirmButtonColor: '#4F46E5'
      });
      return;
    }

    router.post(route('admin.supplier-verification.request-documents', supplier.id), documentRequest, {
      onSuccess: () => {
        setShowDocRequestForm(false);
        Swal.fire({
          title: 'অনুরোধ পাঠানো!',
          text: 'নথির অনুরোধ সাপ্লায়ারের কাছে পাঠানো হয়েছে।',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  // Get document status icon
  const getDocumentIcon = (status) => {
    switch (status) {
      case 'present':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'missing':
        return <FiXCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FiAlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get document status color
  const getDocumentStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <Head title={`${supplier.company_name} - ভেরিফিকেশন`} />

      <div className="space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center gap-4">
          <Link
            href={route('admin.supplier-verification.index')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">সাপ্লায়ার ভেরিফিকেশন</h1>
            <p className="text-sm text-gray-600 mt-1">
              {supplier.company_name} - এর তথ্য পর্যালোচনা ও ভেরিফাই করুন
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Company Info & Documents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MdOutlineStorefront className="w-5 h-5 text-indigo-600" />
                কোম্পানির তথ্য
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">কোম্পানির নাম</p>
                    <p className="font-medium text-gray-900">{supplier.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">যোগাযোগের ব্যক্তি</p>
                    <p className="font-medium text-gray-900">{supplier.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ইমেইল</p>
                    <a href={`mailto:${supplier.company_email}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                      {supplier.company_email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ফোন</p>
                    <a href={`tel:${supplier.company_phone}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      {supplier.company_phone || 'N/A'}
                    </a>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">ট্রেড লাইসেন্স নম্বর</p>
                    <p className="font-medium text-gray-900">{supplier.trade_license_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ঠিকানা</p>
                    <p className="font-medium text-gray-900">{supplier.company_address || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{supplier.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">জমার তারিখ</p>
                    <p className="font-medium text-gray-900">
                      {new Date(supplier.created_at).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MdOutlineDescription className="w-5 h-5 text-indigo-600" />
                প্রয়োজনীয় নথি
              </h3>
              <div className="space-y-4">
                {Object.entries(documents).map(([key, doc]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getDocumentIcon(doc.status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </p>
                        {doc.number && (
                          <p className="text-sm text-gray-500">নম্বর: {doc.number}</p>
                        )}
                        {doc.company_name && (
                          <p className="text-sm text-gray-500">কোম্পানি: {doc.company_name}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDocumentStatusColor(doc.status)}`}>
                        {doc.status === 'present' ? 'উপস্থিত' : 'অনুপস্থিত'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">ভেরিফিকেশন নোট</h3>
              <textarea
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="এই ভেরিফিকেশন সম্পর্কে নোট যোগ করুন..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendNotification"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="sendNotification" className="text-sm text-gray-700">
                  সাপ্লায়ারকে ইমেইল নোটিফিকেশন পাঠান
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
                      placeholder="কেন এই সাপ্লায়ার প্রত্যাখ্যান করা হচ্ছে তা ব্যাখ্যা করুন..."
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
                      প্রত্যাখ্যান নিশ্চিত
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Document Request Form */}
            {showDocRequestForm && (
              <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
                <h3 className="font-semibold text-yellow-600 mb-4 flex items-center gap-2">
                  <FiSend className="w-5 h-5" />
                  অতিরিক্ত তথ্য অনুরোধ
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      সাপ্লায়ারের জন্য বার্তা
                    </label>
                    <textarea
                      rows="4"
                      value={documentRequest.message}
                      onChange={(e) => setDocumentRequest({ message: e.target.value })}
                      placeholder="কি অতিরিক্ত তথ্য বা নথি প্রয়োজন তা ব্যাখ্যা করুন..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowDocRequestForm(false)}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={handleDocumentRequest}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      অনুরোধ পাঠান
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
                  সাপ্লায়ার অনুমোদন
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <FiXCircle className="w-5 h-5" />
                  সাপ্লায়ার প্রত্যাখ্যান
                </button>
                <button
                  onClick={() => setShowDocRequestForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                >
                  <FiSend className="w-5 h-5" />
                  তথ্য অনুরোধ
                </button>
              </div>
            </div>

            {/* User Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">অ্যাকাউন্ট স্ট্যাটাস</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">ইউজার অ্যাকাউন্ট</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user_status.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user_status.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">ইমেইল ভেরিফিকেশন</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user_status.email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {user_status.email_verified ? 'ভেরিফাইড' : 'অভেরিফাইড'}
                  </span>
                </div>
              </div>
            </div>

            {/* Products Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiPackage className="w-5 h-5 text-indigo-600" />
                পণ্য
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">মোট পণ্য</span>
                  <span className="font-medium text-gray-900">{existing_products}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">বিচারাধীন পণ্য</span>
                  <span className="font-medium text-gray-900">{supplier.products?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}