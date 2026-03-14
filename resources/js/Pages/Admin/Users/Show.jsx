// Pages/Admin/Users/Show.jsx

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
  FiMail,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiLock,
  FiPackage,
  FiShoppingCart,
  FiClock
} from 'react-icons/fi';
import {
  MdVerified,
  MdPending,
  MdWarning,
  MdOutlineAdminPanelSettings,
  MdOutlineStorefront,
  MdOutlineShoppingCart,
  MdOutlineAttachMoney
} from 'react-icons/md';
import { BsBuilding, BsGraphUp, BsPeople } from 'react-icons/bs';

export default function Show({ user, activity }) {
  // State management for password reset form
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ password: '', password_confirmation: '' });

  // Handle toggle user status (activate/deactivate)
  const handleToggleStatus = () => {
    const action = user.is_active ? 'নিষ্ক্রিয়' : 'সক্রিয়';
    Swal.fire({
      title: `${user.is_active ? 'নিষ্ক্রিয়' : 'সক্রিয়'} করুন`,
      text: `আপনি কি ${user.name} কে ${action} করতে চান?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: user.is_active ? '#EF4444' : '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: `হ্যাঁ, ${action} করুন`,
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.users.toggle-status', user.id), {}, {
          onSuccess: () => {
            Swal.fire({
              title: 'সফল!',
              text: `ব্যবহারকারী ${action} করা হয়েছে।`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  // Handle reset password
  const handleResetPassword = (e) => {
    e.preventDefault();

    router.post(route('admin.users.reset-password', user.id), passwordData, {
      onSuccess: () => {
        setShowResetPassword(false);
        setPasswordData({ password: '', password_confirmation: '' });
        Swal.fire({
          title: 'সফল!',
          text: 'পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে।',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      onError: (errors) => {
        setPasswordErrors(errors);
      }
    });
  };

  // Handle delete user
  const handleDelete = () => {
    Swal.fire({
      title: 'ব্যবহারকারী মুছুন',
      text: `আপনি কি ${user.name} মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.users.destroy', user.id), {
          onSuccess: () => {
            router.get(route('admin.users.index'));
          }
        });
      }
    });
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

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get role icon and color based on user role
  const getRoleInfo = (role) => {
    const roles = {
      admin: { icon: MdOutlineAdminPanelSettings, color: 'purple', label: 'অ্যাডমিন' },
      supplier: { icon: MdOutlineStorefront, color: 'blue', label: 'সাপ্লায়ার' },
      buyer: { icon: MdOutlineShoppingCart, color: 'green', label: 'ক্রেতা' },
    };
    return roles[role] || roles.buyer;
  };

  // Get role info
  const roleInfo = getRoleInfo(user.role);

  // Get role icon
  const RoleIcon = roleInfo.icon;

  return (
    <DashboardLayout>
      <Head title={`${user.name} - প্রোফাইল`} />

      <div className="space-y-6">
        {/* Header - Back button, title and action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={route('admin.users.index')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ব্যবহারকারী প্রোফাইল</h1>
              <p className="text-sm text-gray-600 mt-1">
                ব্যবহারকারীর বিবরণ দেখুন এবং পরিচালনা করুন
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${user.is_active
                ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
            >
              {user.is_active ? <FiUserX className="w-4 h-4" /> : <FiUserCheck className="w-4 h-4" />}
              <span>{user.is_active ? 'নিষ্ক্রিয়' : 'সক্রিয়'}</span>
            </button>
            <Link
              href={route('admin.users.edit', user.id)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
            >
              <FiEdit2 className="w-4 h-4" />
              <span>সম্পাদনা</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>মুছুন</span>
            </button>
          </div>
        </div>

        {/* User Info Card - Main user information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-6">
              {/* User Avatar */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold bg-${roleInfo.color}-500`}>
                {user.name.charAt(0)}
              </div>

              <div className="flex-1">
                {/* User Name and Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${roleInfo.color}-100 text-${roleInfo.color}-800`}>
                        <RoleIcon className="w-4 h-4 mr-1" />
                        {roleInfo.label}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {user.is_active ? <FiUserCheck className="w-4 h-4 mr-1" /> : <FiUserX className="w-4 h-4 mr-1" />}
                        {user.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>
                  </div>
                  {/* Reset Password Button */}
                  <button
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    <FiLock className="w-4 h-4" />
                    <span>পাসওয়ার্ড রিসেট</span>
                  </button>
                </div>

                {/* User Contact and Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-3">
                    <FiMail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">ইমেইল</p>
                      <a href={`mailto:${user.email}`} className="text-indigo-600 hover:text-indigo-700">
                        {user.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiCalendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">যোগদানের তারিখ</p>
                      <p className="text-gray-900">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                  {activity.last_login && (
                    <div className="flex items-center gap-3">
                      <FiClock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">সর্বশেষ লগইন</p>
                        <p className="text-gray-900">{formatDate(activity.last_login)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reset Password Form */}
          {showResetPassword && (
            <div className="border-t border-gray-100 p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">পাসওয়ার্ড রিসেট</h3>
              <form onSubmit={handleResetPassword} className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    নতুন পাসওয়ার্ড *
                  </label>
                  <input
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${passwordErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {passwordErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    নতুন পাসওয়ার্ড নিশ্চিত করুন *
                  </label>
                  <input
                    type="password"
                    value={passwordData.password_confirmation}
                    onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    পাসওয়ার্ড রিসেট
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Activity Stats - User activity metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">তৈরি RFQ</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{activity.rfqs_count}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">জমা দেওয়া কোটা</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{activity.quotes_count}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BsGraphUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">অর্ডার (ক্রেতা)</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{activity.orders_as_buyer}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">অর্ডার (সাপ্লায়ার)</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{activity.orders_as_supplier}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BsPeople className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Stats - Role-specific financial information */}
        {(user.role === 'buyer' || user.role === 'supplier') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.role === 'buyer' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MdOutlineAttachMoney className="w-5 h-5 text-indigo-600" />
                  মোট ব্যয়
                </h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(activity.total_spent)}</p>
                <p className="text-sm text-gray-500 mt-2">সকল পরিশোধিত অর্ডারে</p>
              </div>
            )}
            {user.role === 'supplier' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MdOutlineAttachMoney className="w-5 h-5 text-indigo-600" />
                  মোট আয়
                </h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(activity.total_earned)}</p>
                <p className="text-sm text-gray-500 mt-2">সম্পন্ন অর্ডার থেকে</p>
              </div>
            )}
          </div>
        )}

        {/* Supplier Profile Info - Additional supplier details */}
        {user.role === 'supplier' && user.supplier && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <BsBuilding className="w-5 h-5 text-indigo-600" />
                সাপ্লায়ার প্রোফাইল
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">কোম্পানির নাম</p>
                  <p className="font-medium text-gray-900">{user.supplier.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ট্রেড লাইসেন্স</p>
                  <p className="font-medium text-gray-900">{user.supplier.trade_license_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">কোম্পানির ফোন</p>
                  <a href={`tel:${user.supplier.company_phone}`} className="text-indigo-600 hover:text-indigo-700">
                    {user.supplier.company_phone}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-500">কোম্পানির ইমেইল</p>
                  <a href={`mailto:${user.supplier.company_email}`} className="text-indigo-600 hover:text-indigo-700">
                    {user.supplier.company_email}
                  </a>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">ঠিকানা</p>
                  <p className="text-gray-900">{user.supplier.company_address}</p>
                  <p className="text-sm text-gray-500 mt-1">{user.supplier.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ভেরিফিকেশন স্ট্যাটাস</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.supplier.verification_status === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : user.supplier.verification_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {user.supplier.verification_status === 'verified' ? <MdVerified className="w-3 h-3 mr-1" /> :
                      user.supplier.verification_status === 'pending' ? <MdPending className="w-3 h-3 mr-1" /> :
                        <MdWarning className="w-3 h-3 mr-1" />}
                    {user.supplier.verification_status === 'verified' ? 'ভেরিফাইড' :
                      user.supplier.verification_status === 'pending' ? 'বিচারাধীন' :
                        user.supplier.verification_status === 'rejected' ? 'প্রত্যাখ্যাত' : user.supplier.verification_status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}