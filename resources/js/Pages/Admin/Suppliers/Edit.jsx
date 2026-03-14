// Pages/Admin/Suppliers/Edit.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function Edit({ supplier }) {
  // State management for form data, errors and processing status
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    city: supplier.city,
    company_name: supplier.company_name,
    company_phone: supplier.company_phone,
    company_email: supplier.company_email,
    company_address: supplier.company_address,
    verification_status: supplier.verification_status,
    trade_license_number: supplier.trade_license_number,
  });
  const [processing, setProcessing] = useState(false);

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    router.put(route('admin.suppliers.update', supplier.id), formData, {
      onSuccess: () => {
        setProcessing(false);
      },
      onError: (errors) => {
        setErrors(errors);
        setProcessing(false);
      }
    });
  };

  return (
    <DashboardLayout>
      <Head title={`${supplier.company_name} - সম্পাদনা`} />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center gap-4">
          <Link
            href={route('admin.suppliers.show', supplier.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">সাপ্লায়ার সম্পাদনা</h1>
            <p className="text-sm text-gray-600 mt-1">
              {supplier.company_name} - এর তথ্য আপডেট করুন
            </p>
          </div>
        </div>

        {/* Form - Supplier information edit form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                কোম্পানির নাম *
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.company_name ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.company_name && (
                <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
              )}
            </div>

            {/* Trade License Number */}
            <div>
              <label htmlFor="trade_license_number" className="block text-sm font-medium text-gray-700 mb-2">
                ট্রেড লাইসেন্স নম্বর *
              </label>
              <input
                type="text"
                id="trade_license_number"
                name="trade_license_number"
                value={formData.trade_license_number}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.trade_license_number ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.trade_license_number && (
                <p className="mt-1 text-sm text-red-600">{errors.trade_license_number}</p>
              )}
            </div>

            {/* Contact Information - Phone and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700 mb-2">
                  ফোন নম্বর *
                </label>
                <input
                  type="text"
                  id="company_phone"
                  name="company_phone"
                  value={formData.company_phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.company_phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.company_phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.company_phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="company_email" className="block text-sm font-medium text-gray-700 mb-2">
                  ইমেইল ঠিকানা *
                </label>
                <input
                  type="email"
                  id="company_email"
                  name="company_email"
                  value={formData.company_email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.company_email ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.company_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.company_email}</p>
                )}
              </div>
            </div>

            {/* Company Address */}
            <div>
              <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-2">
                কোম্পানির ঠিকানা *
              </label>
              <textarea
                id="company_address"
                name="company_address"
                rows="3"
                value={formData.company_address}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.company_address ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.company_address && (
                <p className="mt-1 text-sm text-red-600">{errors.company_address}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                শহর *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            {/* Verification Status */}
            <div>
              <label htmlFor="verification_status" className="block text-sm font-medium text-gray-700 mb-2">
                ভেরিফিকেশন স্ট্যাটাস
              </label>
              <select
                id="verification_status"
                name="verification_status"
                value={formData.verification_status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="pending">বিচারাধীন</option>
                <option value="verified">ভেরিফাইড</option>
                <option value="rejected">প্রত্যাখ্যাত</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Link
                href={route('admin.suppliers.show', supplier.id)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                বাতিল
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="w-4 h-4" />
                <span>{processing ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}