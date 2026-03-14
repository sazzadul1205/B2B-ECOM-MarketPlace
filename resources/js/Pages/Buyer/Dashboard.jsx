// Pages/Buyer/Dashboard.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

// Layout - Buyer dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiPackage,
  FiShoppingCart,
  FiFileText,
  FiMessageCircle,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle,
  FiUsers
} from 'react-icons/fi';
import { BsGraphUp } from 'react-icons/bs';
import { MdOutlineMessage } from 'react-icons/md';

export default function BuyerDashboard() {
  // Destructure props from Inertia page
  const {
    recentRfqs,
    recentOrders,
    recentQuotes,
    unreadMessages,
    recentMessages,
    statistics,
    chartData,
    recentActivity,
    savedSuppliersCount,
    pendingActions
  } = usePage().props;

  // Helper function to format currency in BDT
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper function to get status color based on status type
  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'accepted': 'bg-blue-100 text-blue-700',
      'rejected': 'bg-red-100 text-red-700',
      'pending_confirmation': 'bg-orange-100 text-orange-700',
      'confirmed': 'bg-indigo-100 text-indigo-700',
      'processing': 'bg-purple-100 text-purple-700',
      'shipped': 'bg-cyan-100 text-cyan-700',
      'delivered': 'bg-emerald-100 text-emerald-700',
      'cancelled': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <DashboardLayout>
      <Head title="ক্রেতা ড্যাশবোর্ড" />

      <div className="space-y-6">
        {/* Header with Welcome Message and Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">ক্রেতা ড্যাশবোর্ড</h2>
            <p className="text-gray-600 mt-1">স্বাগতম! আপনার মার্কেটপ্লেস কার্যকলাপের সারসংক্ষেপ এখানে দেওয়া হল।</p>
          </div>
          <div className="flex space-x-3 mt-3 md:mt-0">
            <Link
              href={route('buyer.rfqs.create')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center"
            >
              <FiFileText className="mr-2" /> + নতুন RFQ
            </Link>
            <Link
              href={route('buyer.messages.index')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all relative"
            >
              <MdOutlineMessage className="text-xl" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Pending Actions Alert */}
        {pendingActions?.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start">
              <FiAlertCircle className="text-yellow-600 text-xl mr-3 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-yellow-800 font-medium">অপেক্ষমান কাজ ({pendingActions.length})</h4>
                <div className="mt-2 space-y-2">
                  {pendingActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <p className="text-yellow-700 text-sm">{action.message}</p>
                      <Link href={action.url} className="text-sm text-yellow-800 hover:text-yellow-900 font-medium">
                        দেখুন →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards - Key metrics overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* RFQs Card */}
          <div className="bg-white rounded-xl p-6 border hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">মোট RFQ</p>
                <h3 className="text-2xl font-bold mt-1">{statistics.total_rfqs}</h3>
                <p className="text-sm mt-2">
                  <span className="text-green-600">{statistics.active_rfqs} সক্রিয়</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-indigo-600">{statistics.rfqs_this_month} এই মাসে</span>
                </p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <FiFileText className="text-indigo-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <FiTrendingUp className={`mr-1 ${statistics.rfq_change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={statistics.rfq_change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {statistics.rfq_change}%
              </span>
              <span className="text-gray-500 ml-1">গত মাসের তুলনায়</span>
            </div>
          </div>

          {/* Quotes Card */}
          <div className="bg-white rounded-xl p-6 border hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">প্রাপ্ত কোটা</p>
                <h3 className="text-2xl font-bold mt-1">{statistics.total_quotes}</h3>
                <p className="text-sm mt-2">
                  <span className="text-green-600">{statistics.pending_quotes} অপেক্ষমান</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-indigo-600">{statistics.quotes_this_month} এই মাসে</span>
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FiPackage className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-xl p-6 border hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">মোট অর্ডার</p>
                <h3 className="text-2xl font-bold mt-1">{statistics.total_orders}</h3>
                <p className="text-sm mt-2">
                  <span className="text-yellow-600">{statistics.pending_orders} অপেক্ষমান</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-green-600">{statistics.delivered_orders} ডেলিভারি হয়েছে</span>
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <FiShoppingCart className="text-purple-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <FiTrendingUp className={`mr-1 ${statistics.order_change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={statistics.order_change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {statistics.order_change}%
              </span>
              <span className="text-gray-500 ml-1">গত মাসের তুলনায়</span>
            </div>
          </div>

          {/* Spending Card */}
          <div className="bg-white rounded-xl p-6 border hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">মোট ব্যয়</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(statistics.total_spent)}</h3>
                <p className="text-sm mt-2">
                  <span className="text-indigo-600">{formatCurrency(statistics.monthly_spent)} এই মাসে</span>
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiDollarSign className="text-blue-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <FiUsers className="mr-1 text-gray-500" />
              <span className="text-gray-600">{savedSuppliersCount} টি সাপ্লায়ার</span>
            </div>
          </div>
        </div>

        {/* Charts Section - Activity Overview */}
        {chartData && (
          <div className="bg-white rounded-xl p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center">
                <BsGraphUp className="mr-2" /> কার্যকলাপের সারসংক্ষেপ (গত ৬ মাস)
              </h3>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center"><span className="w-2.5 h-2.5 bg-indigo-500 rounded mr-2"></span> RFQ</div>
                <div className="flex items-center"><span className="w-2.5 h-2.5 bg-green-500 rounded mr-2"></span> অর্ডার</div>
                <div className="flex items-center"><span className="w-2.5 h-2.5 bg-purple-500 rounded mr-2"></span> কোটা</div>
              </div>
            </div>
            <div className="h-64">
              <div className="h-48 border border-gray-100 rounded-lg bg-gradient-to-b from-gray-50 to-white px-3 py-4">
                <div className="grid grid-cols-6 gap-3 h-full items-end">
                  {chartData.labels.map((label, index) => {
                    const rfqMax = Math.max(...chartData.rfqs, 1);
                    const orderMax = Math.max(...chartData.orders, 1);
                    const quoteMax = Math.max(...chartData.quotes, 1);
                    const rfqHeight = Math.round((chartData.rfqs[index] / rfqMax) * 100);
                    const orderHeight = Math.round((chartData.orders[index] / orderMax) * 100);
                    const quoteHeight = Math.round((chartData.quotes[index] / quoteMax) * 100);
                    return (
                      <div key={label} className="flex flex-col items-center h-full">
                        <div className="flex items-end space-x-1 h-full w-full">
                          <div
                            className="w-full bg-indigo-500/80 rounded-t"
                            style={{ height: `${rfqHeight}%` }}
                            title={`RFQ: ${chartData.rfqs[index]}`}
                          ></div>
                          <div
                            className="w-full bg-green-500/80 rounded-t"
                            style={{ height: `${orderHeight}%` }}
                            title={`অর্ডার: ${chartData.orders[index]}`}
                          ></div>
                          <div
                            className="w-full bg-purple-500/80 rounded-t"
                            style={{ height: `${quoteHeight}%` }}
                            title={`কোটা: ${chartData.quotes[index]}`}
                          ></div>
                        </div>
                        <span className="text-xs mt-2 text-gray-600">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                বারগুলি পঠনযোগ্যতার জন্য স্বাধীনভাবে স্কেল করা হয়েছে।
              </p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Recent RFQs and Quotes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent RFQs */}
            <div className="bg-white rounded-xl p-6 border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <FiFileText className="mr-2" /> সাম্প্রতিক RFQ
                </h3>
                <Link href={route('buyer.rfqs.index')} className="text-sm text-indigo-600 hover:text-indigo-800">
                  সব দেখুন →
                </Link>
              </div>
              <div className="space-y-3">
                {recentRfqs?.length > 0 ? recentRfqs.map((rfq) => (
                  <div key={rfq.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium">{rfq.title}</h4>
                          <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusColor(rfq.status)}`}>
                            {rfq.status === 'open' ? 'খোলা' :
                              rfq.status === 'closed' ? 'বন্ধ' :
                                rfq.status === 'cancelled' ? 'বাতিল' : rfq.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">RFQ #{rfq.rfq_number}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <FiPackage className="mr-1" /> পরিমাণ: {rfq.quantity} ইউনিট
                          <span className="mx-2">•</span>
                          <FiClock className="mr-1" /> প্রয়োজনীয় তারিখ: {new Date(rfq.required_by_date).toLocaleDateString('bn-BD')}
                        </div>
                        {rfq.quotes_count > 0 && (
                          <p className="text-sm text-indigo-600 mt-2 font-medium">
                            {rfq.quotes_count} টি কোটা প্রাপ্ত
                          </p>
                        )}
                      </div>
                      <Link
                        href={route('buyer.rfqs.show', rfq.id)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        বিস্তারিত দেখুন →
                      </Link>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">কোনো RFQ নেই</p>
                )}
              </div>
            </div>

            {/* Recent Quotes */}
            <div className="bg-white rounded-xl p-6 border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <FiPackage className="mr-2" /> সাম্প্রতিক কোটা
                </h3>
                <Link href={route('buyer.quotes.index')} className="text-sm text-indigo-600 hover:text-indigo-800">
                  সব দেখুন →
                </Link>
              </div>
              <div className="space-y-3">
                {recentQuotes?.length > 0 ? recentQuotes.map((quote) => (
                  <div key={quote.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium">{quote.supplier?.name} থেকে কোটা</h4>
                          <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusColor(quote.status)}`}>
                            {quote.status === 'pending' ? 'অপেক্ষমান' :
                              quote.status === 'accepted' ? 'গৃহীত' :
                                quote.status === 'rejected' ? 'প্রত্যাখ্যাত' : quote.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{quote.rfq?.title} -এর জন্য</p>
                        <p className="text-sm text-gray-600 mt-1">কোটা #: {quote.quote_number}</p>
                        <div className="flex items-center text-sm mt-2">
                          <FiDollarSign className="text-gray-500 mr-1" />
                          <span className="font-medium">{formatCurrency(quote.total_amount)}</span>
                          <span className="mx-2 text-gray-300">|</span>
                          <FiClock className="text-gray-500 mr-1" />
                          <span className="text-gray-600">মেয়াদ শেষ: {new Date(quote.valid_until).toLocaleDateString('bn-BD')}</span>
                        </div>
                      </div>
                      <Link
                        href={route('buyer.quotes.show', quote.id)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        পর্যালোচনা →
                      </Link>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">এখনও কোনো কোটা পাওয়া যায়নি</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Orders, Messages and Suppliers */}
          <div className="space-y-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl p-6 border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <FiShoppingCart className="mr-2" /> সাম্প্রতিক অর্ডার
                </h3>
                <Link href={route('buyer.orders.index')} className="text-sm text-indigo-600 hover:text-indigo-800">
                  সব দেখুন →
                </Link>
              </div>
              <div className="space-y-3">
                {recentOrders?.length > 0 ? recentOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">অর্ডার #{order.order_number}</p>
                        <p className="text-sm text-gray-600">সাপ্লায়ার: {order.supplier?.name}</p>
                        <p className="text-sm text-gray-600 mt-1">মোট: {formatCurrency(order.total_amount)}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.order_status)}`}>
                        {order.order_status === 'pending_confirmation' ? 'অপেক্ষমান' :
                          order.order_status === 'confirmed' ? 'নিশ্চিত' :
                            order.order_status === 'processing' ? 'প্রক্রিয়াধীন' :
                              order.order_status === 'shipped' ? 'পাঠানো হয়েছে' :
                                order.order_status === 'delivered' ? 'ডেলিভারি হয়েছে' :
                                  order.order_status === 'cancelled' ? 'বাতিল' : order.order_status.replace('_', ' ')}
                      </span>
                    </div>
                    <Link
                      href={route('buyer.orders.show', order.id)}
                      className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      অর্ডার ট্র্যাক করুন →
                    </Link>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">কোনো অর্ডার নেই</p>
                )}
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-xl p-6 border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <FiMessageCircle className="mr-2" /> সাম্প্রতিক বার্তা
                </h3>
                <Link href={route('buyer.messages.index')} className="text-sm text-indigo-600 hover:text-indigo-800">
                  সব দেখুন →
                </Link>
              </div>
              <div className="space-y-3">
                {recentMessages?.length > 0 ? recentMessages.map((message) => {
                  const isFromMe = message.sender_id === usePage().props.auth.user.id;
                  return (
                    <div key={message.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {isFromMe ? 'আপনি' : message.sender?.name}
                            </p>
                            {!message.is_read && !isFromMe && (
                              <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">{message.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(message.created_at).toLocaleDateString('bn-BD')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-gray-500 text-center py-4">কোনো বার্তা নেই</p>
                )}
              </div>
            </div>

            {/* Saved Suppliers */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FiUsers className="mr-2" /> সাপ্লায়ার ({savedSuppliersCount})
              </h3>
              <p className="text-sm text-gray-600 mb-4">আপনি {savedSuppliersCount} টি সাপ্লায়ারের সাথে যোগাযোগ করেছেন</p>
              <Link
                href={route('buyer.suppliers.index')}
                className="inline-block w-full text-center px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                সকল সাপ্লায়ার ব্রাউজ করুন
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        {recentActivity?.length > 0 && (
          <div className="bg-white rounded-xl p-6 border">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FiClock className="mr-2" /> সাম্প্রতিক কার্যকলাপ
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start py-2 border-b last:border-0">
                  <div className={`p-2 rounded-full mr-3 ${activity.type === 'rfq' ? 'bg-indigo-100' :
                    activity.type === 'order' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                    {activity.type === 'rfq' && <FiFileText className={activity.type === 'rfq' ? 'text-indigo-600' : ''} />}
                    {activity.type === 'order' && <FiShoppingCart className="text-green-600" />}
                    {activity.type === 'quote' && <FiPackage className="text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                        {activity.status === 'open' ? 'খোলা' :
                          activity.status === 'pending' ? 'অপেক্ষমান' :
                            activity.status === 'accepted' ? 'গৃহীত' :
                              activity.status === 'delivered' ? 'ডেলিভারি হয়েছে' :
                                activity.status === 'cancelled' ? 'বাতিল' : activity.status}
                      </span>
                    </div>
                    {activity.amount && (
                      <p className="text-sm text-gray-600 mt-1">{formatCurrency(activity.amount)}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.time).toLocaleDateString('bn-BD')} {new Date(activity.time).toLocaleTimeString('bn-BD')}
                    </p>
                  </div>
                  <Link href={activity.url} className="text-indigo-600 hover:text-indigo-800 text-sm ml-2">
                    দেখুন
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}