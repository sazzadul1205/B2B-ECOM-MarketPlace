// Pages/Buyer/Orders/Index.jsx

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
  FiEye,
  FiSearch,
  FiCalendar,
  FiDollarSign,
  FiDownload,
} from 'react-icons/fi';

export default function OrdersIndex({ orders, counts }) {


  // State management for filters
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    search: '',
    from_date: '',
    to_date: '',
    sort: 'latest'
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    router.get(route('buyer.orders.index'), newFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('buyer.orders.index'), filters, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Reset all filters to default
  const resetFilters = () => {
    const resetValues = {
      status: '',
      search: '',
      to_date: '',
      from_date: '',
      sort: 'latest',
      payment_status: '',
    };
    setFilters(resetValues);
    router.get(route('buyer.orders.index'), resetValues, {
      preserveState: true
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
      month: 'short',
      day: 'numeric'
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

  // Get payment status badge color
  const getPaymentStatusColor = (status) => {
    return status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  };

  return (
    <DashboardLayout>
      <Head title="আমার অর্ডার সমূহ" />

      <div className="space-y-6">
        {/* Header - Page title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">আমার অর্ডার</h2>
            <p className="text-gray-600 mt-1">আপনার অর্ডার ট্র্যাক এবং পরিচালনা করুন</p>
          </div>
        </div>

        {/* Stats Cards - Order status counts */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">অপেক্ষমান</p>
            <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">প্রক্রিয়াধীন</p>
            <p className="text-2xl font-bold text-purple-600">{counts.processing}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">পাঠানো হয়েছে</p>
            <p className="text-2xl font-bold text-indigo-600">{counts.shipped}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">ডেলিভারি হয়েছে</p>
            <p className="text-2xl font-bold text-green-600">{counts.delivered}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">মোট অর্ডার</p>
            <p className="text-2xl font-bold text-gray-800">{orders.total}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl p-4 border">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">অনুসন্ধান</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="অর্ডার নম্বর..."
                    className="w-full pl-10 border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Order Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">অর্ডার স্ট্যাটাস</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">সব স্ট্যাটাস</option>
                  <option value="pending_confirmation">অপেক্ষমান</option>
                  <option value="confirmed">নিশ্চিত</option>
                  <option value="processing">প্রক্রিয়াধীন</option>
                  <option value="shipped">পাঠানো হয়েছে</option>
                  <option value="delivered">ডেলিভারি হয়েছে</option>
                  <option value="cancelled">বাতিল</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">পেমেন্ট স্ট্যাটাস</label>
                <select
                  value={filters.payment_status}
                  onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">সব</option>
                  <option value="pending">অপেক্ষমান</option>
                  <option value="paid">পরিশোধিত</option>
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">সাজান</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="latest">সর্বশেষ প্রথম</option>
                  <option value="oldest">পুরানো প্রথম</option>
                  <option value="amount_high">পরিমাণ: বেশি থেকে কম</option>
                  <option value="amount_low">পরিমাণ: কম থেকে বেশি</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">থেকে তারিখ</label>
                <input
                  type="date"
                  value={filters.from_date}
                  onChange={(e) => handleFilterChange('from_date', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">পর্যন্ত তারিখ</label>
                <input
                  type="date"
                  value={filters.to_date}
                  onChange={(e) => handleFilterChange('to_date', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  ফিল্টার প্রয়োগ
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  রিসেট
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Orders List */}
        {orders.data.length === 0 ? (
          // Empty State - No orders
          <div className="bg-white rounded-xl p-12 text-center border">
            <FiShoppingBag className="mx-auto text-5xl text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">কোনো অর্ডার নেই</h3>
            <p className="text-gray-500 mb-6">যখন আপনি অর্ডার দেবেন, সেগুলি এখানে দেখাবে</p>
            <Link
              href={route('buyer.products.index')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center"
            >
              পণ্য ব্রাউজ করুন
            </Link>
          </div>
        ) : (
          // Order Items List
          <div className="space-y-4">
            {orders.data.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                  {/* Main Content */}
                  <div className="flex-1">
                    <div className="flex items-start mb-3">
                      {getStatusIcon(order.order_status)}
                      <div className="ml-2 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="font-semibold text-lg text-gray-800">
                            অর্ডার #{order.order_number}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.order_status)}`}>
                            {order.order_status === 'pending_confirmation' ? 'অপেক্ষমান' :
                              order.order_status === 'confirmed' ? 'নিশ্চিত' :
                                order.order_status === 'processing' ? 'প্রক্রিয়াধীন' :
                                  order.order_status === 'shipped' ? 'পাঠানো হয়েছে' :
                                    order.order_status === 'delivered' ? 'ডেলিভারি হয়েছে' :
                                      order.order_status === 'cancelled' ? 'বাতিল' : order.order_status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                            পেমেন্ট: {order.payment_status === 'paid' ? 'পরিশোধিত' : 'অপেক্ষমান'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Supplier Information */}
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <FiTruck className="mr-1" />
                      <span>সাপ্লায়ার: {order.supplier?.name || 'N/A'}</span>
                    </div>

                    {/* Order Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">আইটেম:</p>
                        <div className="space-y-2">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex items-center text-sm bg-gray-50 p-2 rounded">
                              <FiPackage className="text-gray-400 mr-2" />
                              <span className="flex-1">{item.product_name}</span>
                              <span className="text-gray-600">{item.quantity} x {formatCurrency(item.unit_price)}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-xs text-gray-500">+{order.items.length - 2} আরো আইটেম</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" />
                        অর্ডার: {formatDate(order.created_at)}
                      </div>
                      <div className="flex items-center">
                        <FiDollarSign className="mr-1" />
                        মোট: <span className="font-medium ml-1">{formatCurrency(order.total_amount)}</span>
                      </div>
                      {order.confirmed_at && (
                        <div className="flex items-center">
                          <FiCheckCircle className="mr-1 text-green-500" />
                          নিশ্চিত: {formatDate(order.confirmed_at)}
                        </div>
                      )}
                    </div>

                    {/* RFQ Reference */}
                    {order.rfq && (
                      <div className="mt-3 p-2 bg-indigo-50 rounded-lg inline-block">
                        <p className="text-xs text-indigo-600">
                          RFQ থেকে: {order.rfq.title} (#{order.rfq.rfq_number})
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 mt-4 lg:mt-0 lg:ml-6">
                    <Link
                      href={route('buyer.orders.show', order.id)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center justify-center"
                    >
                      <FiEye className="mr-2" />
                      বিস্তারিত দেখুন
                    </Link>

                    {order.order_status === 'delivered' && (
                      <button
                        onClick={() => router.get(route('buyer.orders.invoice', order.id))}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
                      >
                        <FiDownload className="mr-2" />
                        চালান
                      </button>
                    )}

                    {order.order_status === 'shipped' && (
                      <button
                        onClick={() => {
                          if (confirm('আপনি কি এই অর্ডার পেয়েছেন?')) {
                            router.post(route('buyer.orders.mark-received', order.id));
                          }
                        }}
                        className="px-4 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors inline-flex items-center justify-center"
                      >
                        <FiCheckCircle className="mr-2" />
                        প্রাপ্ত হিসেবে চিহ্নিত
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {orders.links && orders.links.length > 3 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  {orders.links.map((link, index) => (
                    <button
                      key={index}
                      onClick={() => router.get(link.url)}
                      dangerouslySetInnerHTML={{
                        __html: link.label
                          .replace('Previous', 'পূর্ববর্তী')
                          .replace('Next', 'পরবর্তী')
                      }}
                      className={`px-4 py-2 rounded-lg ${link.active
                        ? 'bg-indigo-600 text-white'
                        : link.url
                          ? 'bg-white border hover:bg-gray-50'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      disabled={!link.url}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}