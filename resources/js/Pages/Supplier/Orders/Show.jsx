// Pages/Supplier/Orders/Show.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiTruck,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiMessageSquare,
  FiSend,
  FiPrinter,
  FiCheck,
} from 'react-icons/fi';
import { MdVerified, MdPending } from 'react-icons/md';

// sweetalert - For beautiful alert messages
import Swal from 'sweetalert2';

export default function OrderShow({
  order,
  messages,
  timeline,
  canCancel,
  availableStatuses
}) {
  // State management for messages, shipping form and cancellation
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  // State management for shipping info
  const [shippingInfo, setShippingInfo] = useState({
    tracking_number: '',
    shipping_carrier: '',
    estimated_delivery: '',
    notes: ''
  });


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
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge with appropriate styling
  const getStatusBadge = (status) => {
    const badges = {
      pending_confirmation: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: MdPending, label: 'অপেক্ষমান' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: MdVerified, label: 'নিশ্চিত' },
      processing: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: FiPackage, label: 'প্রক্রিয়াধীন' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', icon: FiTruck, label: 'পাঠানো হয়েছে' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle, label: 'ডেলিভারি হয়েছে' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle, label: 'বাতিল' }
    };
    const badge = badges[status] || badges.pending_confirmation;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  // Handle order confirmation
  const handleConfirmOrder = () => {
    if (confirm('আপনি কি এই অর্ডার নিশ্চিত করতে চান?')) {
      router.post(route('supplier.orders.confirm', order.id));
    }
  };

  // Handle order status update
  const handleUpdateStatus = (status) => {
    if (status === 'shipped' && !showShippingForm) {
      setShowShippingForm(true);
      return;
    }

    router.post(route('supplier.orders.update-status', order.id), {
      order_status: status,
      ...shippingInfo
    }, {
      onSuccess: () => {
        setShowShippingForm(false);
        setShippingInfo({
          tracking_number: '',
          shipping_carrier: '',
          estimated_delivery: '',
          notes: ''
        });
      }
    });
  };

  const handleCancelOrder = () => {
    if (!cancellationReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'কারণ প্রয়োজন',
        text: 'অনুগ্রহ করে বাতিলের কারণ উল্লেখ করুন',
        confirmButtonText: 'ঠিক আছে'
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
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('supplier.orders.cancel', order.id), {
          cancellation_reason: cancellationReason
        }, {
          onSuccess: () => {
            setShowCancelForm(false);
            setCancellationReason('');

            Swal.fire({
              icon: 'success',
              title: 'বাতিল হয়েছে',
              text: 'অর্ডার সফলভাবে বাতিল করা হয়েছে'
            });
          },
          onError: () => {
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

  // Handle send message to buyer
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    router.post(route('supplier.messages.store'), {
      receiver_id: order.buyer_id,
      rfq_id: order.rfq_id,
      message: newMessage
    }, {
      onSuccess: () => {
        setNewMessage('');
        setSending(false);
      },
      onError: () => setSending(false)
    });
  };

  return (
    <DashboardLayout>
      <Head title={`অর্ডার #${order.order_number}`} />

      <div className="space-y-6">
        {/* Header - Back button, title and print button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              href={route('supplier.orders.index')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">অর্ডার #{order.order_number}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(order.created_at)} তারিখে অর্ডার করা হয়েছে
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
            >
              <FiPrinter className="w-4 h-4" />
              <span>প্রিন্ট</span>
            </button>
          </div>
        </div>

        {/* Order Status Banner - For pending confirmation orders */}
        {order.order_status === 'pending_confirmation' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <FiClock className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-700 font-medium">
                    এই অর্ডারটি আপনার নিশ্চিতকরণের অপেক্ষায় রয়েছে
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    অনুগ্রহ করে অর্ডারের বিবরণ পর্যালোচনা করুন এবং ২৪ ঘন্টার মধ্যে নিশ্চিত করুন।
                  </p>
                </div>
              </div>
              <button
                onClick={handleConfirmOrder}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                অর্ডার নিশ্চিত করুন
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">অর্ডার আইটেম</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                        {item.product?.main_image ? (
                          <img
                            src={`/storage/${item.product.main_image}`}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <FiPackage className="w-6 h-6 text-indigo-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-xs text-gray-500">পরিমাণ</p>
                            <p className="font-medium">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">একক মূল্য</p>
                            <p className="font-medium">{formatCurrency(item.unit_price)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">মোট</p>
                            <p className="font-bold text-indigo-600">{formatCurrency(item.total_price)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">সাবটোটাল</span>
                  <span className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">অর্ডার টাইমলাইন</h2>
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${event.completed ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                        {event.completed ? (
                          <FiCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        )}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className={`absolute top-6 left-3 w-0.5 h-12 -ml-0.5 ${event.completed ? 'bg-green-200' : 'bg-gray-200'
                          }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {event.status === 'pending_confirmation' ? 'অপেক্ষমান' :
                              event.status === 'confirmed' ? 'নিশ্চিত' :
                                event.status === 'processing' ? 'প্রক্রিয়াধীন' :
                                  event.status === 'shipped' ? 'পাঠানো হয়েছে' :
                                    event.status === 'delivered' ? 'ডেলিভারি হয়েছে' :
                                      event.status === 'cancelled' ? 'বাতিল' : event.status}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                        </div>
                        {event.date && (
                          <p className="text-xs text-gray-400">{formatDate(event.date)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Form - When marking as shipped */}
            {showShippingForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">শিপিং তথ্য</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ট্র্যাকিং নম্বর <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.tracking_number}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, tracking_number: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        শিপিং ক্যারিয়ার <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.shipping_carrier}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, shipping_carrier: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      আনুমানিক ডেলিভারি তারিখ
                    </label>
                    <input
                      type="date"
                      value={shippingInfo.estimated_delivery}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, estimated_delivery: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      অতিরিক্ত নোট
                    </label>
                    <textarea
                      value={shippingInfo.notes}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="ক্রেতার জন্য কোনো অতিরিক্ত তথ্য..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus('shipped')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      পাঠানো হিসেবে চিহ্নিত
                    </button>
                    <button
                      onClick={() => setShowShippingForm(false)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cancel Form */}
            {showCancelForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">অর্ডার বাতিল</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      বাতিলের কারণ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="অনুগ্রহ করে বাতিলের কারণ উল্লেখ করুন..."
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelOrder}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      বাতিল নিশ্চিত করুন
                    </button>
                    <button
                      onClick={() => setShowCancelForm(false)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      ফিরে যান
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Buyer Info & Actions */}
          <div className="space-y-6">
            {/* Order Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">অর্ডার স্ট্যাটাস</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">বর্তমান স্ট্যাটাস</span>
                  {getStatusBadge(order.order_status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">পেমেন্ট স্ট্যাটাস</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.payment_status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {order.payment_status === 'paid' ? 'পরিশোধিত' : 'অপেক্ষমান'}
                  </span>
                </div>

                {/* Status Update Actions */}
                {Object.keys(availableStatuses).length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">স্ট্যাটাস আপডেট</p>
                    <div className="space-y-2">
                      {Object.entries(availableStatuses).map(([status, label]) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(status)}
                          className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                        >
                          {status === 'processing' ? 'প্রক্রিয়াধীন' :
                            status === 'shipped' ? 'পাঠানো হয়েছে' :
                              status === 'delivered' ? 'ডেলিভারি হয়েছে' : label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cancel Button */}
                {canCancel && (
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setShowCancelForm(true)}
                      className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      অর্ডার বাতিল
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Buyer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ক্রেতার তথ্য</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiUser className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">নাম</p>
                    <p className="font-medium text-gray-900">{order.buyer?.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiMail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">ইমেইল</p>
                    <a href={`mailto:${order.buyer?.email}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                      {order.buyer?.email}
                    </a>
                  </div>
                </div>
                {order.buyer?.phone && (
                  <div className="flex items-start gap-3">
                    <FiPhone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">ফোন</p>
                      <p className="font-medium text-gray-900">{order.buyer.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">শিপিং ঠিকানা</p>
                    <p className="font-medium text-gray-900">{order.shipping_address || 'দেওয়া হয়নি'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RFQ Information */}
            {order.rfq && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">RFQ বিবরণ</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">RFQ নম্বর</p>
                    <Link href={route('supplier.rfqs.show', order.rfq.id)} className="font-medium text-indigo-600 hover:text-indigo-700">
                      {order.rfq.rfq_number}
                    </Link>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">শিরোনাম</p>
                    <p className="font-medium text-gray-900">{order.rfq.title}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Info (if shipped) */}
            {order.order_status === 'shipped' && order.tracking_number && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">শিপিং তথ্য</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">ট্র্যাকিং নম্বর</p>
                    <p className="font-medium text-gray-900">{order.tracking_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ক্যারিয়ার</p>
                    <p className="font-medium text-gray-900">{order.shipping_carrier}</p>
                  </div>
                  {order.estimated_delivery && (
                    <div>
                      <p className="text-sm text-gray-500">আনুমানিক ডেলিভারি</p>
                      <p className="font-medium text-gray-900">{formatDate(order.estimated_delivery)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">পাঠানোর তারিখ</p>
                    <p className="font-medium text-gray-900">{formatDate(order.shipped_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FiMessageSquare className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">বার্তা</h2>
                <p className="text-sm text-gray-500">ক্রেতার সাথে যোগাযোগ করুন</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Message List */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === order.supplier_id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-lg rounded-lg p-4 ${message.sender_id === order.supplier_id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                      }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${message.sender_id === order.supplier_id
                      ? 'text-indigo-200'
                      : 'text-gray-500'
                      }`}>
                      {formatDate(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}

              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  এখনও কোনো বার্তা নেই। ক্রেতার সাথে কথোপকথন শুরু করুন।
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="আপনার বার্তা লিখুন..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FiSend className="w-4 h-4" />
                <span>পাঠান</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}