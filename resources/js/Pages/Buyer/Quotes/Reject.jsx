// Pages/Buyer/Quotes/Reject.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Buyer dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiXCircle,
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiAlertCircle,
} from 'react-icons/fi';

export default function QuoteReject({ quote }) {

  // State management for form data, submission status and errors
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ rejection_reason: '' });

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
      year: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate rejection reason
    if (!formData.rejection_reason.trim()) {
      setErrors({ rejection_reason: 'অনুগ্রহ করে প্রত্যাখ্যানের কারণ উল্লেখ করুন' });
      return;
    }

    setSubmitting(true);
    router.post(route('buyer.quotes.reject', quote.id), formData, {
      onSuccess: () => {
        setSubmitting(false);
      },
      onError: (errors) => {
        setErrors(errors);
        setSubmitting(false);
      }
    });
  };

  return (
    <DashboardLayout>
      <Head title="কোটা প্রত্যাখ্যান" />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center space-x-4">
          <Link
            href={route('buyer.quotes.show', quote.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">কোটা প্রত্যাখ্যান</h2>
            <p className="text-gray-600 mt-1">এই কোটা প্রত্যাখ্যানের কারণ উল্লেখ করুন</p>
          </div>
        </div>

        {/* Quote Summary Section */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-medium text-gray-700 mb-4">কোটা সারসংক্ষেপ</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">কোটা নম্বর</p>
              <p className="font-medium">{quote.quote_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">সাপ্লায়ার</p>
              <p className="font-medium flex items-center">
                <FiUser className="mr-2 text-gray-400" />
                {quote.supplier?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">মোট পরিমাণ</p>
              <p className="font-medium text-indigo-600">{formatCurrency(quote.total_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">মেয়াদ শেষ</p>
              <p className="font-medium flex items-center">
                <FiCalendar className="mr-2 text-gray-400" />
                {formatDate(quote.valid_until)}
              </p>
            </div>
          </div>
        </div>

        {/* Rejection Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6">
          <h3 className="font-medium text-gray-700 mb-4">প্রত্যাখ্যানের কারণ</h3>

          {/* Reason Textarea */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              প্রত্যাখ্যানের কারণ <span className="text-red-500">*</span>
            </label>
            <textarea
              name="rejection_reason"
              value={formData.rejection_reason}
              onChange={handleChange}
              rows="4"
              className={`w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.rejection_reason ? 'border-red-500' : ''
                }`}
              placeholder="কেন আপনি এই কোটা প্রত্যাখ্যান করছেন তা ব্যাখ্যা করুন..."
            />
            {errors.rejection_reason && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.rejection_reason}
              </p>
            )}
          </div>

          {/* Warning Message */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700 flex items-center">
              <FiAlertCircle className="mr-2" />
              এই কোটা প্রত্যাখ্যান করলে সাপ্লায়ারকে নোটিফিকেশন পাঠানো হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              href={route('buyer.quotes.show', quote.id)}
              className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              বাতিল
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  প্রক্রিয়াকরণ...
                </>
              ) : (
                <>
                  <FiXCircle className="mr-2" />
                  প্রত্যাখ্যান নিশ্চিত করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}