// Pages/Buyer/Orders/Show.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Buyer dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiShoppingBag,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiArrowLeft,
  FiDollarSign,
  FiUser,
  FiMapPin,
  FiAlertCircle,
  FiCreditCard,
  FiCheck,
  FiPrinter
} from 'react-icons/fi';

// sweetalert - For beautiful alert messages
import Swal from 'sweetalert2';

export default function OrderShow({ order, tracking }) {

  // State management for cancellation modal
  const [cancelling, setCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

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
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color based on order status
  const getStatusColor = (status) => {
    const colors = {
      'pending_confirmation': 'bg-yellow-100 text-yellow-700',
      'confirmed': 'bg-blue-100 text-blue-700',
      'processing': 'bg-purple-100 text-purple-700',
      'shipped': 'bg-indigo-100 text-indigo-700',
      'delivered': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Get status icon based on order status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_confirmation':
        return <FiClock className="text-yellow-600" />;
      case 'confirmed':
        return <FiCheckCircle className="text-blue-600" />;
      case 'processing':
        return <FiPackage className="text-purple-600" />;
      case 'shipped':
        return <FiTruck className="text-indigo-600" />;
      case 'delivered':
        return <FiCheckCircle className="text-green-600" />;
      case 'cancelled':
        return <FiXCircle className="text-red-600" />;
      default:
        return <FiShoppingBag className="text-gray-600" />;
    }
  };

  // Handle order cancellation
  const handleCancel = () => {
    if (!cancellationReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'কারণ লিখুন',
        text: 'অনুগ্রহ করে বাতিলের কারণ উল্লেখ করুন',
      });
      return;
    }

    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই অর্ডারটি বাতিল করা হবে!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, বাতিল করুন',
      cancelButtonText: 'না',
    }).then((result) => {
      if (result.isConfirmed) {
        setCancelling(true);

        router.post(route('buyer.orders.cancel', order.id), {
          cancellation_reason: cancellationReason
        }, {
          onSuccess: () => {
            setShowCancelModal(false);
            setCancelling(false);

            Swal.fire({
              icon: 'success',
              title: 'বাতিল হয়েছে',
              text: 'অর্ডার সফলভাবে বাতিল করা হয়েছে'
            });
          },
          onError: () => {
            setCancelling(false);

            Swal.fire({
              icon: 'error',
              title: 'ত্রুটি',
              text: 'অর্ডার বাতিল করা যায়নি'
            });
          }
        });
      }
    });
  };

  // Handle mark as received
  const handleMarkReceived = () => {
    Swal.fire({
      title: 'আপনি কি অর্ডারটি পেয়েছেন?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, পেয়েছি',
      cancelButtonText: 'না',
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('buyer.orders.mark-received', order.id), {}, {
          onSuccess: () => {
            Swal.fire({
              icon: 'success',
              title: 'ধন্যবাদ',
              text: 'অর্ডারটি গ্রহণ করা হয়েছে'
            });
          }
        });
      }
    });
  };

  // Handle payment (demo mode)
  const handlePayment = () => {
    Swal.fire({
      title: "পেমেন্ট সম্পন্ন করুন?",
      text: "এটি একটি ডেমো প্রকল্প। পেমেন্ট সিমুলেট করা হবে।",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, পেমেন্ট করুন",
      cancelButtonText: "বাতিল",
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#6b7280",
    }).then((result) => {
      if (result.isConfirmed) {

        router.post(route('buyer.orders.pay', order.id), {}, {
          onSuccess: () => {
            Swal.fire({
              icon: "success",
              title: "পেমেন্ট সফল হয়েছে",
              text: "আপনার পেমেন্ট সম্পন্ন হয়েছে।",
              timer: 2000,
              showConfirmButton: false,
            });
          },
          onError: (errors) => {
            Swal.fire({
              icon: "error",
              title: "পেমেন্ট ব্যর্থ হয়েছে",
              text: errors.message || "অনুগ্রহ করে আবার চেষ্টা করুন",
            });
          }
        });

      }
    });
  };

  return (
    <DashboardLayout>
      <Head title={`অর্ডার #${order.order_number}`} />

      <div className="space-y-6">
        {/* Header - Back button, title and action buttons */}
        <div className="flex items-center space-x-4">
          <Link
            href={route('buyer.orders.index')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800">অর্ডারের বিবরণ</h2>
              <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(order.order_status)}`}>
                {order.order_status === 'pending_confirmation' ? 'অপেক্ষমান' :
                  order.order_status === 'confirmed' ? 'নিশ্চিত' :
                    order.order_status === 'processing' ? 'প্রক্রিয়াধীন' :
                      order.order_status === 'shipped' ? 'পাঠানো হয়েছে' :
                        order.order_status === 'delivered' ? 'ডেলিভারি হয়েছে' :
                          order.order_status === 'cancelled' ? 'বাতিল' : order.order_status.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                পেমেন্ট: {order.payment_status === 'paid' ? 'পরিশোধিত' : 'অপেক্ষমান'}
              </span>
            </div>
            <p className="text-gray-600 mt-1">অর্ডার #{order.order_number}</p>
          </div>

          {/* Action Buttons - Context sensitive */}
          <div className="flex space-x-2">
            <button
              onClick={() => router.get(route('buyer.orders.invoice', order.id))}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <FiPrinter className="mr-2" />
              চালান
            </button>

            {order.order_status === 'pending_confirmation' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <FiXCircle className="mr-2" />
                অর্ডার বাতিল
              </button>
            )}

            {order.order_status === 'shipped' && (
              <button
                onClick={handleMarkReceived}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <FiCheckCircle className="mr-2" />
                প্রাপ্ত হিসেবে চিহ্নিত
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                <FiClock className="mr-2" /> অর্ডার টাইমলাইন
              </h3>

              <div className="relative">
                {order.timeline?.map((step, index) => (
                  <div key={index} className="flex items-start mb-4 last:mb-0">
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                        {step.completed ? (
                          <FiCheck className="text-green-600" />
                        ) : (
                          <FiClock className="text-gray-400" />
                        )}
                      </div>
                      {index < order.timeline.length - 1 && (
                        <div className={`absolute top-8 left-4 w-0.5 h-12 ${step.completed ? 'bg-green-200' : 'bg-gray-200'
                          }`}></div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className={`font-medium ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                        {step.status}
                      </p>
                      {step.date && (
                        <p className="text-sm text-gray-500">{formatDate(step.date)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                <FiPackage className="mr-2" /> অর্ডার আইটেম
              </h3>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-500 mt-1">পরিমাণ: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.unit_price)} প্রতি</p>
                      <p className="text-sm text-gray-600 mt-1">মোট: {formatCurrency(item.total_price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">সাবটোটাল</span>
                  <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">শিপিং</span>
                  <span className="font-medium">ফ্রি</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-4">
                  <span>মোট</span>
                  <span className="text-indigo-600">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Additional Information */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                <FiMapPin className="mr-2" /> শিপিং ঠিকানা
              </h3>
              <p className="text-gray-600 whitespace-pre-line">{order.shipping_address}</p>
            </div>

            {/* Supplier Information */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                <FiUser className="mr-2" /> সাপ্লায়ারের তথ্য
              </h3>
              <div className="space-y-2">
                <p className="font-medium">{order.supplier?.name}</p>
                {order.supplier?.supplier && (
                  <>
                    <p className="text-sm text-gray-600">{order.supplier.supplier.company_name}</p>
                    <p className="text-sm text-gray-600">{order.supplier.supplier.company_phone}</p>
                    <p className="text-sm text-gray-600">{order.supplier.supplier.company_email}</p>
                  </>
                )}
                <Link
                  href={route('buyer.suppliers.show', order.supplier_id)}
                  className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-800"
                >
                  সাপ্লায়ার প্রোফাইল দেখুন →
                </Link>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                <FiCreditCard className="mr-2" /> পেমেন্ট তথ্য
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">স্ট্যাটাস</span>
                  <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                    {order.payment_status === 'paid' ? 'পরিশোধিত' : 'অপেক্ষমান'}
                  </span>
                </div>

                {/* Demo mode indicator */}
                {order.payment_status === 'pending' && (
                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <span className="flex items-center">
                      <FiAlertCircle className="mr-1 text-yellow-500" />
                      ডেমো মোড: কোনো প্রকৃত পেমেন্ট প্রক্রিয়া করা হবে না
                    </span>
                  </div>
                )}

                {order.payment_status === 'pending' && (
                  <button
                    onClick={handlePayment}
                    className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                  >
                    <FiDollarSign className="mr-2" />
                    এখন পেমেন্ট করুন (ডেমো)
                  </button>
                )}
              </div>
            </div>

            {/* RFQ Information */}
            {order.rfq && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-medium text-gray-700 mb-4">সম্পর্কিত RFQ</h3>
                <p className="font-medium">{order.rfq.title}</p>
                <p className="text-sm text-gray-500 mt-1">RFQ #{order.rfq.rfq_number}</p>
                <Link
                  href={route('buyer.rfqs.show', order.rfq.id)}
                  className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-800"
                >
                  RFQ দেখুন →
                </Link>
              </div>
            )}

            {/* Tracking Information */}
            {tracking && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                  <FiTruck className="mr-2" /> ট্র্যাকিং তথ্য
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">ক্যারিয়ার: {tracking.carrier}</p>
                  <p className="text-sm">ট্র্যাকিং নম্বর: {tracking.tracking_number}</p>
                  {tracking.estimated_delivery && (
                    <p className="text-sm">আনুমানিক ডেলিভারি: {formatDate(tracking.estimated_delivery)}</p>
                  )}
                  <a
                    href={tracking.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    প্যাকেজ ট্র্যাক করুন →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cancellation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowCancelModal(false)}></div>

              <div className="relative bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">অর্ডার বাতিল</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    বাতিলের কারণ
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    rows="3"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="অনুগ্রহ করে কারণ উল্লেখ করুন..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    বন্ধ
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling || !cancellationReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {cancelling ? 'বাতিল করা হচ্ছে...' : 'বাতিল নিশ্চিত করুন'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}