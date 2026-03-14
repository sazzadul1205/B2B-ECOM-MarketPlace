// Pages/Supplier/Messages/Settings.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiArrowLeft,
  FiSave,
  FiBell,
  FiMail,
  FiMessageSquare,
  FiUsers,
} from 'react-icons/fi';

export default function MessageSettings() {
  // Form state management using Inertia's useForm hook
  const { data, setData, put, processing } = useForm({
    signature: '',
    auto_reply: false,
    max_file_size: 10,
    max_attachments: 5,
    auto_reply_message: '',
    push_notifications: true,
    email_notifications: true,
    sound_notifications: true,
    working_hours_end: '17:00',
    desktop_notifications: true,
    working_hours_start: '09:00',
    block_new_from_unknown: false,
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('supplier.messages.settings.update'), {
      preserveScroll: true,
      onSuccess: () => {
        // Show success message
      }
    });
  };

  return (
    <DashboardLayout>
      <Head title="বার্তা সেটিংস" />

      <div className="space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center gap-4">
          <Link
            href={route('supplier.messages.index')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">বার্তা সেটিংস</h1>
            <p className="text-sm text-gray-600 mt-1">
              আপনার বার্তা পছন্দগুলি কনফিগার করুন
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notification Settings Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">বিজ্ঞপ্তি</h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FiMail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">ইমেইল বিজ্ঞপ্তি</span>
                </div>
                <input
                  type="checkbox"
                  checked={data.email_notifications}
                  onChange={(e) => setData('email_notifications', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FiBell className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">পুশ বিজ্ঞপ্তি</span>
                </div>
                <input
                  type="checkbox"
                  checked={data.push_notifications}
                  onChange={(e) => setData('push_notifications', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FiBell className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">শব্দ বিজ্ঞপ্তি</span>
                </div>
                <input
                  type="checkbox"
                  checked={data.sound_notifications}
                  onChange={(e) => setData('sound_notifications', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FiBell className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">ডেস্কটপ বিজ্ঞপ্তি</span>
                </div>
                <input
                  type="checkbox"
                  checked={data.desktop_notifications}
                  onChange={(e) => setData('desktop_notifications', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </label>
            </div>
          </div>

          {/* Auto Reply Settings Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">স্বয়ংক্রিয় উত্তর</h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FiMessageSquare className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">স্বয়ংক্রিয় উত্তর সক্রিয় করুন</span>
                </div>
                <input
                  type="checkbox"
                  checked={data.auto_reply}
                  onChange={(e) => setData('auto_reply', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </label>

              {data.auto_reply && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    স্বয়ংক্রিয় উত্তর বার্তা
                  </label>
                  <textarea
                    value={data.auto_reply_message}
                    onChange={(e) => setData('auto_reply_message', e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="আপনার বার্তার জন্য ধন্যবাদ। আমি যত তাড়াতাড়ি সম্ভব উত্তর দেব।"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Working Hours Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">কাজের সময়</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  শুরুর সময়
                </label>
                <input
                  type="time"
                  value={data.working_hours_start}
                  onChange={(e) => setData('working_hours_start', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  শেষ সময়
                </label>
                <input
                  type="time"
                  value={data.working_hours_end}
                  onChange={(e) => setData('working_hours_end', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">স্বাক্ষর</h2>

            <div>
              <textarea
                value={data.signature}
                onChange={(e) => setData('signature', e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="আপনার স্বাক্ষর সমস্ত আউটগোয়িং বার্তায় যুক্ত হবে"
              />
            </div>
          </div>

          {/* Privacy & Security Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">গোপনীয়তা ও নিরাপত্তা</h2>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <FiUsers className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">অজানা ব্যবহারকারীদের থেকে বার্তা ব্লক করুন</span>
              </div>
              <input
                type="checkbox"
                checked={data.block_new_from_unknown}
                onChange={(e) => setData('block_new_from_unknown', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
            </label>
          </div>

          {/* File Upload Limits Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ফাইল আপলোড সীমা</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  প্রতি বার্তায় সর্বোচ্চ সংযুক্তি
                </label>
                <input
                  type="number"
                  value={data.max_attachments}
                  onChange={(e) => setData('max_attachments', parseInt(e.target.value))}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  সর্বোচ্চ ফাইল সাইজ (MB)
                </label>
                <input
                  type="number"
                  value={data.max_file_size}
                  onChange={(e) => setData('max_file_size', parseInt(e.target.value))}
                  min="1"
                  max="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              {processing ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}