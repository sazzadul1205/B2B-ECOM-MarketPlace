// Pages/Buyer/Orders/CreateFromRfq.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// Layout - Buyer dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiArrowLeft,
  FiPackage,
  FiCheckCircle,
  FiMapPin,
  FiAlertCircle
} from 'react-icons/fi';

export default function CreateFromRfq({ rfq, quote }) {
  // State management for order placement confirmation
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  // Inertia form handling
  const { data, setData, post, processing, errors } = useForm({
    notes: '',
    rfq_id: rfq.id,
    quote_id: quote.id,
    shipping_address: '',
    terms_accepted: false,
  });

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    post(route('buyer.orders.store-from-quote'), {
      preserveScroll: true,
      onSuccess: (response) => {
        setOrderPlaced(true);
        // Set order number from response if available
        if (response.props?.order?.order_number) {
          setOrderNumber(response.props.order.order_number);
        }
      },
      onError: () => {

      },
    });
  };

  // Check if RFQ is still open
  if (rfq.status !== 'open') {
    return (
      <DashboardLayout>
        <Head title="RFQ বন্ধ - অর্ডার তৈরি" />

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">RFQ বন্ধ রয়েছে</h2>
            <p className="text-gray-600 mb-6">
              এই RFQ অর্ডারের জন্য উন্মুক্ত নয়। এটি বন্ধ করা হয়েছে অথবা ইতিমধ্যে একটি অর্ডার তৈরি করা হয়েছে।
            </p>
            <Link
              href={route('buyer.rfqs.show', rfq.id)}
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              RFQ-তে ফিরে যান
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if order already exists for this RFQ
  if (rfq.order) {
    return (
      <DashboardLayout>
        <Head title="অর্ডার বিদ্যমান" />

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">অর্ডার ইতিমধ্যে রয়েছে</h2>
            <p className="text-gray-600 mb-6">
              এই RFQ-র জন্য ইতিমধ্যে একটি অর্ডার তৈরি করা হয়েছে।
            </p>
            <Link
              href={route('buyer.orders.show', rfq.order.id)}
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              অর্ডার দেখুন
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Success state after order placement
  if (orderPlaced) {
    return (
      <DashboardLayout>
        <Head title="অর্ডার সফল হয়েছে" />

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">অর্ডার সফলভাবে তৈরি হয়েছে!</h2>
            <p className="text-gray-600 mb-4">
              আপনার অর্ডার সফলভাবে তৈরি করা হয়েছে। সাপ্লায়ার ২৪-৪৮ ঘন্টার মধ্যে আপনার অর্ডার নিশ্চিত করবে।
            </p>
            {orderNumber && (
              <p className="text-sm bg-gray-50 p-3 rounded-lg mb-6">
                অর্ডার নম্বর: <span className="font-bold text-indigo-600">{orderNumber}</span>
              </p>
            )}
            <div className="space-y-3">
              <Link
                href={route('buyer.orders.index')}
                className="block w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                আমার অর্ডার দেখুন
              </Link>
              <Link
                href={route('buyer.rfqs.show', rfq.id)}
                className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                RFQ-তে ফিরে যান
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head title="অর্ডার নিশ্চিতকরণ" />

      <div className="space-y-6">
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary Section */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                <FiPackage className="mr-2" /> অর্ডারের সারসংক্ষেপ
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">RFQ: {rfq.rfq_number}</p>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      গৃহীত কোটা
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rfq.title}</p>

                  {/* Product items list */}
                  <div className="space-y-2">
                    {rfq.products_requested?.map((product, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{product.name} x {product.quantity} {product.unit}</span>
                        <span className="font-medium">{formatCurrency(product.quantity * (quote.total_amount / rfq.quantity))}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total amount */}
                  <div className="mt-3 pt-3 border-t flex justify-between">
                    <span className="font-medium">মোট পরিমাণ</span>
                    <span className="font-bold text-indigo-600">{formatCurrency(quote.total_amount)}</span>
                  </div>
                </div>

                {/* Supplier and quote details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">সাপ্লায়ার</p>
                    <p className="font-medium">{quote.supplier?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">কোম্পানি</p>
                    <p className="font-medium">{quote.supplier?.supplier?.company_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">কোটা নম্বর</p>
                    <p className="font-medium">{quote.quote_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">মেয়াদ শেষ</p>
                    <p className="font-medium">{formatDate(quote.valid_until)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address Form */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                <FiMapPin className="mr-2" /> শিপিং ঠিকানা
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    শিপিং ঠিকানা <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={data.shipping_address}
                    onChange={(e) => setData('shipping_address', e.target.value)}
                    rows="3"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="আপনার সম্পূর্ণ শিপিং ঠিকানা লিখুন"
                    required
                  />
                  {errors.shipping_address && (
                    <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    অতিরিক্ত নোট (ঐচ্ছিক)
                  </label>
                  <textarea
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    rows="2"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="সাপ্লায়ারের জন্য বিশেষ নির্দেশনা..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Order Total Card */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-medium text-gray-700 mb-4">অর্ডারের মোট পরিমাণ</h3>
              <p className="text-3xl font-bold text-indigo-600">{formatCurrency(quote.total_amount)}</p>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>সাবটোটাল</span>
                  <span>{formatCurrency(quote.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>শিপিং</span>
                  <span>সাপ্লায়ার গণনা করবেন</span>
                </div>
                <div className="flex justify-between">
                  <span>ট্যাক্স</span>
                  <span>অন্তর্ভুক্ত</span>
                </div>
              </div>
            </div>

            {/* Terms and Submit Button */}
            <div className="bg-white rounded-xl border p-6">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.terms_accepted}
                    onChange={(e) => setData('terms_accepted', e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    আমি নিশ্চিত করছি যে অর্ডারের বিবরণ সঠিক এবং শর্তাবলী মেনে নিচ্ছি
                  </span>
                </label>
                {errors.terms_accepted && (
                  <p className="text-sm text-red-600">{errors.terms_accepted}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={processing || !data.terms_accepted || !data.shipping_address}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {processing ? (
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
            </div>

            {/* Information Box - Next steps */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">পরবর্তী কী হবে?</p>
                  <ul className="mt-2 text-xs text-blue-600 list-disc list-inside space-y-1">
                    <li>সাপ্লায়ার ২৪-৪৮ ঘন্টার মধ্যে অর্ডার নিশ্চিত করবে</li>
                    <li>অর্ডার প্রক্রিয়াকরণের আপডেট পাবেন</li>
                    <li>অর্ডার নিশ্চিত হওয়ার পর পেমেন্ট সম্পন্ন করতে পারবেন</li>
                    <li>রিয়েল-টাইমে আপনার অর্ডারের স্ট্যাটাস ট্র্যাক করুন</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}