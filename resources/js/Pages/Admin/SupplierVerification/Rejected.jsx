// Pages/Admin/SupplierVerification/Rejected.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiArrowLeft,
  FiSearch,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser
} from 'react-icons/fi';
import { MdWarning } from 'react-icons/md';

export default function Rejected({ rejectedSuppliers }) {
  // State management for search term
  const [searchTerm, setSearchTerm] = useState('');

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('admin.supplier-verification.rejected'), {
      search: searchTerm
    }, { preserveState: true });
  };

  return (
    <DashboardLayout>
      <Head title="প্রত্যাখ্যাত সাপ্লায়ার" />

      <div className="space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center gap-4">
          <Link
            href={route('admin.supplier-verification.index')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">প্রত্যাখ্যাত সাপ্লায়ার</h1>
            <p className="text-sm text-gray-600 mt-1">
              প্রত্যাখ্যাত সাপ্লায়ার আবেদনের তালিকা
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="কোম্পানির নাম, ইমেইল বা ফোন দ্বারা অনুসন্ধান..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              অনুসন্ধান
            </button>
          </form>
        </div>

        {/* Suppliers Grid - Card layout for rejected suppliers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rejectedSuppliers.data.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              {/* Header - Company info and status badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                    <MdWarning className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{supplier.company_name}</h3>
                    <p className="text-sm text-gray-500">{supplier.city || 'শহর উল্লেখ নেই'}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  প্রত্যাখ্যাত
                </span>
              </div>

              {/* Contact Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiUser className="w-4 h-4 text-gray-400" />
                  <span>{supplier.user?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${supplier.company_email}`} className="hover:text-indigo-600 truncate">
                    {supplier.company_email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiPhone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${supplier.company_phone}`} className="hover:text-indigo-600">
                    {supplier.company_phone || 'N/A'}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMapPin className="w-4 h-4 text-gray-400" />
                  <span>{supplier.city || 'N/A'}</span>
                </div>
              </div>

              {/* Review Button */}
              <Link
                href={route('admin.supplier-verification.verify', supplier.id)}
                className="block w-full text-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
              >
                আবেদন পর্যালোচনা
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination - Navigation controls */}
        {rejectedSuppliers.links && (
          <div className="flex justify-center gap-2 mt-6">
            {rejectedSuppliers.links.map((link, index) => (
              <button
                key={index}
                onClick={() => router.get(link.url)}
                disabled={!link.url || link.active}
                className={`px-3 py-1 rounded-lg text-sm ${link.active
                  ? 'bg-indigo-600 text-white'
                  : link.url
                    ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                dangerouslySetInnerHTML={{
                  __html: link.label
                    .replace('Previous', 'পূর্ববর্তী')
                    .replace('Next', 'পরবর্তী')
                }}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}