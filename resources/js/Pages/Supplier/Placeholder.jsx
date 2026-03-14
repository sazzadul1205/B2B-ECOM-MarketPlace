// Pages/Supplier/Placeholder.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head, Link } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiAlertCircle,
  FiArrowLeft,
  FiClock,
  FiHome
} from 'react-icons/fi';

export default function SupplierPlaceholder({ title, description }) {
  return (
    <DashboardLayout>
      <Head title={title || 'পৃষ্ঠা' | 'সাপ্লায়ার'} />

      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
            <FiClock className="w-12 h-12 text-indigo-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">
          {title || 'পৃষ্ঠা স্থানান্তরিত হচ্ছে'}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 text-center max-w-2xl mb-8">
          {description || 'এই পৃষ্ঠাটি Inertia.js-এ স্থানান্তরিত হচ্ছে। শীঘ্রই এটি উপলব্ধ হবে।'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={route('supplier.dashboard')}
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiHome className="mr-2 w-5 h-5" />
            ড্যাশবোর্ডে ফিরে যান
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FiArrowLeft className="mr-2 w-5 h-5" />
            পূর্ববর্তী পৃষ্ঠায় যান
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">স্থানান্তর প্রক্রিয়া</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                আমরা আমাদের অ্যাপ্লিকেশনকে Inertia.js-এ স্থানান্তরিত করছি যাতে আরও ভালো পারফরম্যান্স
                এবং ব্যবহারকারীর অভিজ্ঞতা প্রদান করা যায়। এই পৃষ্ঠাটি বর্তমানে উন্নয়নাধীন।
                দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}