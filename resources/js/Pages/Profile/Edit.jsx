// Pages/Profile/Edit.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

// Layout - Dashboard layout wrapper (handles user-specific sidebar based on role)
import DashboardLayout from '@/Layouts/DashboardLayout';

// Sweetalert - For beautiful alert messages
import Swal from 'sweetalert2';

// Icons - Importing icon sets for UI elements
import {
    FiUser,
    FiLock,
    FiSave,
    FiAlertCircle,
    FiCheckCircle
} from 'react-icons/fi';
import { FaBuilding } from "react-icons/fa";
import { MdVerified, MdPending } from 'react-icons/md';

export default function Edit({ auth, mustVerifyEmail, status }) {
    // Destructure user data from auth prop
    const user = auth.user;
    const supplier = user.supplier;

    // Profile form state - For updating basic user info
    const [profileData, setProfileData] = useState({
        name: user.name,
        email: user.email,
    });

    // Password form state - For changing password
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Supplier form state - For supplier-specific information (read-only)
    const [supplierData, setSupplierData] = useState(supplier ? {
        company_name: supplier.company_name || '',
        trade_license_number: supplier.trade_license_number || '',
        company_phone: supplier.company_phone || '',
        company_email: supplier.company_email || '',
        company_address: supplier.company_address || '',
        city: supplier.city || '',
    } : null);

    // Error and processing states
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    // Handle profile update submission
    const handleProfileUpdate = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.patch(route('profile.update'), profileData, {
            onSuccess: () => {
                Swal.fire({
                    title: 'সফল!',
                    text: 'প্রোফাইল সফলভাবে আপডেট হয়েছে।',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            onError: (errors) => {
                setErrors(errors);
                Swal.fire({
                    title: 'ত্রুটি!',
                    text: 'ফর্মে ত্রুটি আছে। অনুগ্রহ করে পরীক্ষা করুন।',
                    icon: 'error',
                    confirmButtonColor: '#4F46E5'
                });
            },
            onFinish: () => setProcessing(false)
        });
    };

    // Handle password update submission
    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.put(route('password.update'), passwordData, {
            onSuccess: () => {
                // Clear password fields after successful update
                setPasswordData({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
                Swal.fire({
                    title: 'সফল!',
                    text: 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে।',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            onError: (errors) => {
                setErrors(errors);
                Swal.fire({
                    title: 'ত্রুটি!',
                    text: 'ফর্মে ত্রুটি আছে। অনুগ্রহ করে পরীক্ষা করুন।',
                    icon: 'error',
                    confirmButtonColor: '#4F46E5'
                });
            },
            onFinish: () => setProcessing(false)
        });
    };

    // Handle account deletion with SweetAlert confirmation
    const handleDeleteAccount = () => {
        Swal.fire({
            title: 'অ্যাকাউন্ট মুছুন',
            text: 'আপনি কি আপনার অ্যাকাউন্ট মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'হ্যাঁ, আমার অ্যাকাউন্ট মুছুন',
            cancelButtonText: 'বাতিল',
            input: 'password',
            inputLabel: 'পাসওয়ার্ড',
            inputPlaceholder: 'আপনার পাসওয়ার্ড দিন',
            inputAttributes: {
                autocapitalize: 'off',
                type: 'password'
            },
            preConfirm: (password) => {
                return router.delete(route('profile.destroy'), {
                    data: { password },
                    onSuccess: () => {
                        Swal.fire({
                            title: 'মুছে ফেলা হয়েছে!',
                            text: 'আপনার অ্যাকাউন্ট মুছে ফেলা হয়েছে।',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    },
                    onError: () => {
                        Swal.showValidationMessage('ভুল পাসওয়ার্ড');
                    }
                });
            }
        });
    };

    return (
        <DashboardLayout>
            <Head title="প্রোফাইল" />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header - Page title and description */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">প্রোফাইল সেটিংস</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        আপনার অ্যাকাউন্ট সেটিংস এবং পছন্দগুলি পরিচালনা করুন
                    </p>
                </div>

                {/* User Role Badge - Displays user role and status */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${user.role === 'admin' ? 'bg-purple-500' :
                        user.role === 'supplier' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 capitalize flex items-center gap-2">
                            <span>{user.role === 'admin' ? 'অ্যাডমিন' :
                                user.role === 'supplier' ? 'সাপ্লায়ার' : 'ক্রেতা'}</span>
                            {user.is_active ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <FiCheckCircle className="w-3 h-3 mr-1" />
                                    সক্রিয়
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <FiAlertCircle className="w-3 h-3 mr-1" />
                                    নিষ্ক্রিয়
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Profile Information Form - Editable user details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FiUser className="w-5 h-5 text-indigo-600" />
                            প্রোফাইল তথ্য
                        </h3>
                    </div>
                    <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                সম্পূর্ণ নাম
                            </label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ইমেইল ঠিকানা
                            </label>
                            <input
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Email Verification Status - Shows if email needs verification */}
                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-700">
                                    আপনার ইমেইল ঠিকানা ভেরিফাই করা হয়নি।
                                    <button
                                        onClick={() => router.post(route('verification.send'))}
                                        className="ml-2 text-yellow-600 underline hover:text-yellow-500"
                                    >
                                        ভেরিফিকেশন ইমেইল পুনরায় পাঠাতে এখানে ক্লিক করুন।
                                    </button>
                                </p>
                            </div>
                        )}

                        {/* Success Status - Displays success messages */}
                        {status && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-600">{status}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                <FiSave className="w-4 h-4" />
                                {processing ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Supplier Profile Information - Read-only supplier details */}
                {user.role === 'supplier' && supplierData && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FaBuilding className="w-5 h-5 text-indigo-600" />
                                সাপ্লায়ার প্রোফাইল
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Verification Status Badge */}
                            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">ভেরিফিকেশন স্ট্যাটাস</span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${supplier.verification_status === 'verified'
                                    ? 'bg-green-100 text-green-800'
                                    : supplier.verification_status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {supplier.verification_status === 'verified' ? (
                                        <><MdVerified className="w-4 h-4 mr-1" /> ভেরিফাইড</>
                                    ) : supplier.verification_status === 'pending' ? (
                                        <><MdPending className="w-4 h-4 mr-1" /> বিচারাধীন</>
                                    ) : (
                                        <><FiAlertCircle className="w-4 h-4 mr-1" /> বাতিল</>
                                    )}
                                </span>
                            </div>

                            {/* Supplier Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Company Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        কোম্পানির নাম
                                    </label>
                                    <input
                                        type="text"
                                        value={supplierData.company_name}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                                    />
                                </div>

                                {/* Trade License */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ট্রেড লাইসেন্স নম্বর
                                    </label>
                                    <input
                                        type="text"
                                        value={supplierData.trade_license_number}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                                    />
                                </div>

                                {/* Company Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        কোম্পানির ফোন
                                    </label>
                                    <input
                                        type="text"
                                        value={supplierData.company_phone}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                                    />
                                </div>

                                {/* Company Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        কোম্পানির ইমেইল
                                    </label>
                                    <input
                                        type="email"
                                        value={supplierData.company_email}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        শহর
                                    </label>
                                    <input
                                        type="text"
                                        value={supplierData.city}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                                    />
                                </div>
                            </div>

                            {/* Company Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    কোম্পানির ঠিকানা
                                </label>
                                <textarea
                                    value={supplierData.company_address}
                                    readOnly
                                    rows="3"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                                />
                            </div>

                            {/* Info Note */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                <p className="text-sm text-blue-700 flex items-center gap-2">
                                    <FiAlertCircle className="w-4 h-4" />
                                    সাপ্লায়ার প্রোফাইল তথ্য শুধুমাত্র সাপোর্টের সাথে যোগাযোগ করে আপডেট করা যেতে পারে।
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Update Password Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FiLock className="w-5 h-5 text-indigo-600" />
                            পাসওয়ার্ড আপডেট করুন
                        </h3>
                    </div>
                    <form onSubmit={handlePasswordUpdate} className="p-6 space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                বর্তমান পাসওয়ার্ড
                            </label>
                            <input
                                type="password"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.current_password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.current_password && (
                                <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                নতুন পাসওয়ার্ড
                            </label>
                            <input
                                type="password"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                নতুন পাসওয়ার্ড নিশ্চিত করুন
                            </label>
                            <input
                                type="password"
                                value={passwordData.password_confirmation}
                                onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                <FiSave className="w-4 h-4" />
                                {processing ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Delete Account Section */}
                <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-red-100 bg-red-50">
                        <h3 className="font-semibold text-red-600 flex items-center gap-2">
                            <FiAlertCircle className="w-5 h-5" />
                            অ্যাকাউন্ট মুছুন
                        </h3>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-600 mb-4">
                            আপনার অ্যাকাউন্ট মুছে ফেলা হলে, এর সমস্ত রিসোর্স এবং ডেটা স্থায়ীভাবে মুছে যাবে।
                            আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলার জন্য আপনার পাসওয়ার্ড দিন।
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            অ্যাকাউন্ট মুছুন
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}