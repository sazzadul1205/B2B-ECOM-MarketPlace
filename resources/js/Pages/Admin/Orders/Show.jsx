// Pages/Admin/Orders/Show.jsx

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
  FiPackage,
  FiUser,
  FiMapPin,
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiPrinter
} from 'react-icons/fi';
import {
  MdVerified,
  MdPending,
  MdOutlineLocalShipping,
  MdOutlinePayment,
  MdOutlineReceipt
} from 'react-icons/md';
import { BsBuilding, BsBoxSeam } from 'react-icons/bs';

export default function Show({ order, timeline, paymentInfo }) {
  // State management for forms and UI controls
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Status update form state
  const [statusData, setStatusData] = useState({
    order_status: order.order_status,
    notes: ''
  });

  // Payment update form state
  const [paymentData, setPaymentData] = useState({
    payment_status: order.payment_status,
    payment_method: order.payment_method || '',
    payment_reference: order.payment_reference || '',
    payment_notes: ''
  });

  // Cancel order form state
  const [cancelData, setCancelData] = useState({
    cancellation_reason: '',
    refund_required: order.payment_status === 'paid'
  });

  // Handle order status update
  const handleStatusUpdate = () => {
    router.post(route('admin.orders.update-status', order.id), statusData, {
      onSuccess: () => {
        setShowStatusForm(false);
        Swal.fire({
          title: 'সফল!',
          text: 'অর্ডার স্ট্যাটাস সফলভাবে আপডেট হয়েছে।',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  // Handle payment status update
  const handlePaymentUpdate = () => {
    router.post(route('admin.orders.update-payment', order.id), paymentData, {
      onSuccess: () => {
        setShowPaymentForm(false);
        Swal.fire({
          title: 'সফল!',
          text: 'পেমেন্ট স্ট্যাটাস সফলভাবে আপডেট হয়েছে।',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  // Handle order cancellation
  const handleCancelOrder = () => {
    if (!cancelData.cancellation_reason) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'অনুগ্রহ করে বাতিলের কারণ উল্লেখ করুন।',
        icon: 'error',
        confirmButtonColor: '#4F46E5'
      });
      return;
    }

    router.post(route('admin.orders.cancel', order.id), cancelData, {
      onSuccess: () => {
        setShowCancelForm(false);
        Swal.fire({
          title: 'বাতিল!',
          text: 'অর্ডার সফলভাবে বাতিল করা হয়েছে।',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
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

  // Get order status badge with appropriate styling
  const getOrderStatusBadge = (status) => {
    const badges = {
      pending_confirmation: { color: 'bg-yellow-100 text-yellow-800', icon: MdPending, label: 'অপেক্ষমান' },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: MdVerified, label: 'নিশ্চিত' },
      processing: { color: 'bg-indigo-100 text-indigo-800', icon: FiClock, label: 'প্রক্রিয়াধীন' },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: MdOutlineLocalShipping, label: 'পাঠানো হয়েছে' },
      delivered: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: 'ডেলিভারি হয়েছে' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: FiXCircle, label: 'বাতিল' },
    };
    const badge = badges[status] || badges.pending_confirmation;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.label}
      </span>
    );
  };

  // Get payment status badge with appropriate styling
  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, label: 'অপেক্ষমান' },
      paid: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: 'পরিশোধিত' },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.label}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <Head title={`অর্ডার #${order.order_number}`} />

      <div className="space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={route('admin.orders.index')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">অর্ডার #{order.order_number}</h1>
              <p className="text-sm text-gray-600 mt-1">
                অর্ডারের বিবরণ ও ব্যবস্থাপনা
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <FiPrinter className="w-4 h-4" />
              <span>প্রিন্ট</span>
            </button>
          </div>
        </div>

        {/* Order Status Bar - Current status and action buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {getOrderStatusBadge(order.order_status)}
              {getPaymentStatusBadge(order.payment_status)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStatusForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                স্ট্যাটাস আপডেট
              </button>
              <button
                onClick={() => setShowPaymentForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                পেমেন্ট আপডেট
              </button>
              {order.canBeCancelled && (
                <button
                  onClick={() => setShowCancelForm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  অর্ডার বাতিল
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Update Form - Modal-like form for status changes */}
        {showStatusForm && (
          <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">অর্ডার স্ট্যাটাস আপডেট</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  নতুন স্ট্যাটাস
                </label>
                <select
                  value={statusData.order_status}
                  onChange={(e) => setStatusData({ ...statusData, order_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pending_confirmation">অপেক্ষমান</option>
                  <option value="confirmed">নিশ্চিত</option>
                  <option value="processing">প্রক্রিয়াধীন</option>
                  <option value="shipped">পাঠানো হয়েছে</option>
                  <option value="delivered">ডেলিভারি হয়েছে</option>
                  <option value="cancelled">বাতিল</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  নোট (ঐচ্ছিক)
                </label>
                <textarea
                  value={statusData.notes}
                  onChange={(e) => setStatusData({ ...statusData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="এই স্ট্যাটাস পরিবর্তন সম্পর্কে নোট যোগ করুন..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowStatusForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  স্ট্যাটাস আপডেট
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Update Form - Modal-like form for payment changes */}
        {showPaymentForm && (
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">পেমেন্ট স্ট্যাটাস আপডেট</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পেমেন্ট স্ট্যাটাস
                </label>
                <select
                  value={paymentData.payment_status}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="pending">অপেক্ষমান</option>
                  <option value="paid">পরিশোধিত</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পেমেন্ট পদ্ধতি
                </label>
                <input
                  type="text"
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="যেমন: ব্যাংক ট্রান্সফার, ক্রেডিট কার্ড"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পেমেন্ট রেফারেন্স
                </label>
                <input
                  type="text"
                  value={paymentData.payment_reference}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ট্রানজেকশন আইডি বা রেফারেন্স নম্বর"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  নোট (ঐচ্ছিক)
                </label>
                <textarea
                  value={paymentData.payment_notes}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_notes: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="পেমেন্ট সম্পর্কিত নোট যোগ করুন..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  বাতিল
                </button>
                <button
                  onClick={handlePaymentUpdate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  পেমেন্ট আপডেট
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Order Form - Modal-like form for order cancellation */}
        {showCancelForm && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <h3 className="font-semibold text-red-600 mb-4">অর্ডার বাতিল</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বাতিলের কারণ *
                </label>
                <textarea
                  value={cancelData.cancellation_reason}
                  onChange={(e) => setCancelData({ ...cancelData, cancellation_reason: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="এই অর্ডার কেন বাতিল করা হচ্ছে তা ব্যাখ্যা করুন..."
                />
              </div>
              {order.payment_status === 'paid' && (
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cancelData.refund_required}
                      onChange={(e) => setCancelData({ ...cancelData, refund_required: e.target.checked })}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">এই অর্ডারের জন্য রিফান্ড প্রক্রিয়া করুন</span>
                  </label>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCancelForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  বাতিল নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Order details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main order content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items - List of products in the order */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiPackage className="w-5 h-5 text-indigo-600" />
                অর্ডার আইটেম
              </h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                        {item.product?.main_image ? (
                          <img
                            src={item.product.main_image}
                            alt={item.product_name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <BsBoxSeam className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-indigo-600">{formatCurrency(item.total_price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary - Total calculations */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">সাবটোটাল</span>
                  <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">শিপিং</span>
                  <span className="font-medium">অন্তর্ভুক্ত</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">মোট</span>
                  <span className="text-lg font-bold text-indigo-600">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information - Delivery address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiMapPin className="w-5 h-5 text-indigo-600" />
                শিপিং তথ্য
              </h3>
              <p className="text-gray-700 whitespace-pre-line">{order.shipping_address}</p>
            </div>

            {/* Order Timeline - Status history */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiClock className="w-5 h-5 text-indigo-600" />
                অর্ডার টাইমলাইন
              </h3>
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FiCheckCircle className="w-4 h-4 text-indigo-600" />
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="absolute top-8 left-4 w-0.5 h-12 bg-indigo-200"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-gray-900">
                        {event.status === 'pending_confirmation' ? 'অপেক্ষমান' :
                          event.status === 'confirmed' ? 'নিশ্চিত' :
                            event.status === 'processing' ? 'প্রক্রিয়াধীন' :
                              event.status === 'shipped' ? 'পাঠানো হয়েছে' :
                                event.status === 'delivered' ? 'ডেলিভারি হয়েছে' :
                                  event.status === 'cancelled' ? 'বাতিল' : event.status}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar with additional information */}
          <div className="space-y-6">
            {/* Customer Information - Buyer details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-indigo-600" />
                ক্রেতার তথ্য
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-blue-600">
                      {order.buyer?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.buyer?.name}</p>
                    <p className="text-sm text-gray-500">ক্রেতা</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${order.buyer?.email}`} className="text-indigo-600 hover:text-indigo-700">
                    {order.buyer?.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Supplier Information - Seller details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BsBuilding className="w-5 h-5 text-indigo-600" />
                সাপ্লায়ারের তথ্য
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-purple-600">
                      {order.supplier?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.supplier?.name}</p>
                    <p className="text-sm text-gray-500">সাপ্লায়ার</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${order.supplier?.email}`} className="text-indigo-600 hover:text-indigo-700">
                    {order.supplier?.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Payment Information - Payment details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MdOutlinePayment className="w-5 h-5 text-indigo-600" />
                পেমেন্ট তথ্য
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">স্ট্যাটাস</span>
                  <span>{getPaymentStatusBadge(paymentInfo.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">পদ্ধতি</span>
                  <span className="text-sm font-medium text-gray-900">{paymentInfo.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">রেফারেন্স</span>
                  <span className="text-sm font-mono text-gray-900">{paymentInfo.reference}</span>
                </div>
                {paymentInfo.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">পরিশোধের তারিখ</span>
                    <span className="text-sm text-gray-900">{formatDate(paymentInfo.paid_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* RFQ Information - Related RFQ if any */}
            {order.rfq && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MdOutlineReceipt className="w-5 h-5 text-indigo-600" />
                  RFQ তথ্য
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-500">RFQ নম্বর:</span>{' '}
                    <span className="font-medium text-gray-900">{order.rfq.rfq_number}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">শিরোনাম:</span>{' '}
                    <span className="text-gray-900">{order.rfq.title}</span>
                  </p>
                  <Link
                    href={route('admin.rfqs.show', order.rfq.id)}
                    className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mt-2"
                  >
                    RFQ বিস্তারিত দেখুন
                    <FiArrowLeft className="w-3 h-3 rotate-180" />
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