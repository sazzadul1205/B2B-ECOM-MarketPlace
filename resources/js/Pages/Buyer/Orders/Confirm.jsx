// Pages/Buyer/Orders/Confirm.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';

// Layout - Buyer dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiShoppingBag,
  FiCheckCircle,
  FiArrowLeft,
  FiMapPin,
  FiFileText,
  FiAlertCircle,
} from 'react-icons/fi';

export default function OrderConfirm({ rfq, quote }) {

  // Destructure page props
  const { auth } = usePage().props;

  // State management for form data, submission status and errors
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // State management for form data
  const [formData, setFormData] = useState({
    notes: '',
    rfq_id: rfq.id,
    quote_id: quote.id,
    terms_accepted: false,
    shipping_address: auth.user.address || '',
  });

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate terms acceptance
    if (!formData.terms_accepted) {
      setErrors({ terms_accepted: 'আপনাকে শর্তাবলী accept করতে হবে' });
      return;
    }

    setSubmitting(true);
    router.post(route('buyer.orders.store'), formData, {
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
      <Head title="অর্ডার নিশ্চিতকরণ" />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center space-x-4">
          <Link
            href={route('buyer.rfqs.show', rfq.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">অর্ডার নিশ্চিত করুন</h2>
            <p className="text-gray-600 mt-1">আপনার অর্ডারের বিবরণ পর্যালোচনা ও নিশ্চিত করুন</p>
          </div>
        </div>

        {/* Success Message - Quote accepted notification */}
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <FiCheckCircle className="text-green-600 mr-3" />
            <div>
              <p className="text-green-700 font-medium">কোটা সফলভাবে গৃহীত হয়েছে</p>
              <p className="text-green-600 text-sm mt-1">
                নিচের অর্ডারের বিবরণ পর্যালোচনা করুন এবং চালিয়ে যেতে নিশ্চিত করুন।
              </p>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary Section */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-medium text-gray-700 mb-4 flex items-center">
              <FiShoppingBag className="mr-2" /> অর্ডারের সারসংক্ষেপ
            </h3>

            {/* RFQ Information */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">RFQ: {rfq.title}</p>
              <p className="text-sm text-gray-500 mt-1">RFQ #{rfq.rfq_number}</p>
            </div>

            {/* Product Items List */}
            <div className="space-y-3 mb-4">
              {rfq.products_requested.map((product, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">পরিমাণ: {product.quantity} {product.unit}</p>
                  </div>
                  <p className="font-medium text-indigo-600">
                    {formatCurrency(quote.total_amount / rfq.products_requested.length)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-medium">মোট পরিমাণ</span>
              <span className="text-xl font-bold text-indigo-600">
                {formatCurrency(quote.total_amount)}
              </span>
            </div>
          </div>

          {/* Quote Details Section */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-medium text-gray-700 mb-4 flex items-center">
              <FiFileText className="mr-2" /> কোটা বিবরণ
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">কোটা নম্বর</p>
                <p className="font-medium">{quote.quote_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">মেয়াদ শেষ</p>
                <p className="font-medium">{new Date(quote.valid_until).toLocaleDateString('bn-BD')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">সাপ্লায়ার</p>
                <p className="font-medium">{quote.supplier?.name}</p>
              </div>
            </div>

            {/* Price Breakdown - Detailed product pricing */}
            {quote.product_breakdown && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">মূল্য বিশ্লেষণ:</p>
                <div className="space-y-2">
                  {quote.product_breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Shipping Address Section */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-medium text-gray-700 mb-4 flex items-center">
              <FiMapPin className="mr-2" /> শিপিং ঠিকানা
            </h3>

            <textarea
              name="shipping_address"
              value={formData.shipping_address}
              onChange={handleChange}
              rows="4"
              className={`w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.shipping_address ? 'border-red-500' : ''
                }`}
              placeholder="আপনার শিপিং ঠিকানা লিখুন"
            />
            {errors.shipping_address && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.shipping_address}
              </p>
            )}
          </div>

          {/* Additional Notes Section */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-medium text-gray-700 mb-4">অতিরিক্ত নোট (ঐচ্ছিক)</h3>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="সাপ্লায়ারের জন্য বিশেষ নির্দেশনা..."
            />
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="bg-white rounded-xl border p-6">
            <label className="flex items-start">
              <input
                type="checkbox"
                name="terms_accepted"
                checked={formData.terms_accepted}
                onChange={handleChange}
                className="mt-1 mr-3"
              />
              <span className="text-sm text-gray-600">
                আমি নিশ্চিত করছি যে অর্ডারের বিবরণ সঠিক এবং আমি
                <Link href="/terms" className="text-indigo-600 hover:text-indigo-800 mx-1">
                  শর্তাবলী
                </Link>
                এবং
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-800 mx-1">
                  গোপনীয়তা নীতি
                </Link>
                মেনে নিচ্ছি।
              </span>
            </label>
            {errors.terms_accepted && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.terms_accepted}
              </p>
            )}
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              href={route('buyer.rfqs.show', rfq.id)}
              className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              বাতিল
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                'অর্ডার নিশ্চিত করুন'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}