// Pages/Admin/Users/Create.jsx

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
  FiUser,
  FiMail,
  FiLock,
  FiAlertCircle
} from 'react-icons/fi';
import {
  MdOutlineAdminPanelSettings,
  MdOutlineStorefront,
  MdOutlineShoppingCart
} from 'react-icons/md';

export default function Create() {
  // State management for form data, errors and processing status
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    is_active: true,
    password_confirmation: '',
  });

  // State management for form data, errors and processing status
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    router.post(route('admin.users.store'), formData, {
      onSuccess: () => {
        Swal.fire({
          title: 'সফল!',
          text: 'ব্যবহারকারী সফলভাবে তৈরি করা হয়েছে।',
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

  // Role options for user types
  const roleOptions = [
    {
      value: 'admin',
      label: 'অ্যাডমিন',
      icon: MdOutlineAdminPanelSettings,
      description: 'সম্পূর্ণ সিস্টেম অ্যাক্সেস',
      color: 'purple'
    },
    {
      value: 'supplier',
      label: 'সাপ্লায়ার',
      icon: MdOutlineStorefront,
      description: 'পণ্য ব্যবস্থাপনা এবং RFQ-তে সাড়া দিতে পারেন',
      color: 'blue'
    },
    {
      value: 'buyer',
      label: 'ক্রেতা',
      icon: MdOutlineShoppingCart,
      description: 'RFQ তৈরি এবং অর্ডার দিতে পারেন',
      color: 'green'
    },
  ];

  return (
    <DashboardLayout>
      <Head title="নতুন ব্যবহারকারী তৈরি" />

      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          {/* Header - Back button and page title */}
          <div className="flex items-center gap-4">
            <Link
              href={route('admin.users.index')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">নতুন ব্যবহারকারী তৈরি</h1>
              <p className="text-sm text-gray-600 mt-1">
                সিস্টেমে একটি নতুন ব্যবহারকারী যোগ করুন
              </p>
            </div>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Basic Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">মৌলিক তথ্য</h3>
                <div className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      সম্পূর্ণ নাম *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="সম্পূর্ণ নাম লিখুন"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ইমেইল ঠিকানা *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="ইমেইল ঠিকানা লিখুন"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">পাসওয়ার্ড</h3>
                <div className="space-y-4">
                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      পাসওয়ার্ড *
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="পাসওয়ার্ড লিখুন"
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      পাসওয়ার্ড নিশ্চিত করুন *
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Selection Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ব্যবহারকারীর ভূমিকা</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roleOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = formData.role === option.value;
                    const colorClass = isSelected ? `border-${option.color}-500 bg-${option.color}-50` : 'border-gray-200 hover:border-gray-300';

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role: option.value }))}
                        className={`p-4 border-2 rounded-lg text-left transition ${colorClass}`}
                      >
                        <Icon className={`w-8 h-8 mb-2 ${isSelected ? `text-${option.color}-600` : 'text-gray-400'
                          }`} />
                        <h4 className={`font-medium ${isSelected ? `text-${option.color}-900` : 'text-gray-900'
                          }`}>{option.label}</h4>
                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
                {errors.role && (
                  <p className="mt-2 text-sm text-red-600">{errors.role}</p>
                )}
              </div>

              {/* Active Status Toggle */}
              <div className="border-t pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">সক্রিয় স্ট্যাটাস</span>
                    <p className="text-sm text-gray-500">ব্যবহারকারী লগ ইন করে সিস্টেম অ্যাক্সেস করতে পারবেন</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Form Actions - Submit and Cancel buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <Link
                href={route('admin.users.index')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                বাতিল
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'তৈরি হচ্ছে...' : 'ব্যবহারকারী তৈরি'}
              </button>
            </div>
          </form>

          {/* Info Note - Important information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">নোট:</p>
              <p>যদি আপনি একটি সাপ্লায়ার অ্যাকাউন্ট তৈরি করেন, তাহলে তৈরি করার পরে আপনাকে তাদের সাপ্লায়ার প্রোফাইল সম্পূর্ণ করতে পুনঃনির্দেশিত করা হবে।</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}