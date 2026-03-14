// Pages/Supplier/Products/BulkPrices.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiInfo,
  FiArrowLeft
} from 'react-icons/fi';

// Image placeholder
const NoImg = "/noImg.jpg";

export default function BulkPrices({ product }) {

  // State management for form saving
  const [saving, setSaving] = useState(false);

  // State management for bulk pricing tiers
  const [bulkPrices, setBulkPrices] = useState(
    product.bulk_prices?.length > 0
      ? product.bulk_prices.map(bp => ({
        id: bp.id,
        price: bp.price,
        min_quantity: bp.min_quantity,
        max_quantity: bp.max_quantity,
      }))
      : [{ min_quantity: '', max_quantity: '', price: '' }]
  );

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Add new bulk pricing tier
  const addBulkPrice = () => {
    setBulkPrices([...bulkPrices, { min_quantity: '', max_quantity: '', price: '' }]);
  };

  // Remove bulk pricing tier
  const removeBulkPrice = (index) => {
    const newPrices = bulkPrices.filter((_, i) => i !== index);
    setBulkPrices(newPrices);
  };

  // Update bulk pricing field
  const updateBulkPrice = (index, field, value) => {
    const newPrices = [...bulkPrices];
    newPrices[index][field] = value;
    setBulkPrices(newPrices);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    // Filter out empty entries
    const validPrices = bulkPrices.filter(
      bp => bp.min_quantity && bp.price
    );

    router.post(route('supplier.products.bulk-prices.update', product.id), {
      bulk_prices: validPrices
    }, {
      onSuccess: () => {
        setSaving(false);
      },
      onError: () => {
        setSaving(false);
      }
    });
  };

  // Calculate discount percentage for a price tier
  const calculateDiscount = (price) => {
    if (!price || !product.base_price) return null;
    const discount = ((product.base_price - price) / product.base_price) * 100;
    return discount.toFixed(1);
  };

  return (
    <DashboardLayout>
      <Head title={`${product.name} - বাল্ক মূল্য`} />

      <div className="space-y-6">
        {/* Header - Back button, title and action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              href={route('supplier.products.edit', product.id)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">বাল্ক মূল্য নির্ধারণ</h1>
              <p className="text-sm text-gray-600 mt-1">
                {product.name} - এর জন্য ভলিউম ভিত্তিক মূল্য নির্ধারণ করুন
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={route('supplier.products.edit', product.id)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
            >
              <FiX className="w-4 h-4" />
              <span>বাতিল</span>
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ'}</span>
            </button>
          </div>
        </div>

        {/* Product Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
              <img
                src={product.main_image ? `/storage/${product.main_image}` : NoImg}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = NoImg;
                }}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
              <p className="text-sm text-gray-500 mt-1">ক্যাটাগরি: {product.category}</p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm">
                  <span className="text-gray-500">মূল মূল্য:</span>{' '}
                  <span className="font-bold text-indigo-600">
                    {formatCurrency(product.base_price)} / {product.unit}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">সর্বনিম্ন অর্ডার:</span>{' '}
                  <span className="font-medium">{product.minimum_order_quantity} {product.unit}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Pricing Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">মূল্য স্তর</h2>
              <button
                type="button"
                onClick={addBulkPrice}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <FiPlus className="w-4 h-4" />
                স্তর যোগ করুন
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              বাল্ক ক্রয়কে উৎসাহিত করতে অর্ডার পরিমাণের ভিত্তিতে বিভিন্ন মূল্য নির্ধারণ করুন।
            </p>
          </div>

          <div className="p-6">
            {/* Price Comparison Preview */}
            {bulkPrices.some(bp => bp.min_quantity && bp.price) && (
              <div className="mb-6 bg-indigo-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-indigo-800 mb-3">মূল্য তুলনা</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-indigo-600">মূল মূল্য:</span>
                    <span className="font-medium text-indigo-900">
                      {formatCurrency(product.base_price)} / {product.unit}
                    </span>
                  </div>
                  {bulkPrices.filter(bp => bp.min_quantity && bp.price).map((bp, index) => {
                    const discount = calculateDiscount(bp.price);
                    return (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-indigo-600">
                          {bp.min_quantity} - {bp.max_quantity || '∞'} {product.unit}:
                        </span>
                        <div className="text-right">
                          <span className="font-medium text-indigo-900">
                            {formatCurrency(bp.price)} / {product.unit}
                          </span>
                          {discount > 0 && (
                            <span className="ml-2 text-xs text-green-600">
                              ({discount}% ছাড়)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bulk Price Tiers Input */}
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 uppercase">
                <div className="col-span-3">সর্বনিম্ন পরিমাণ</div>
                <div className="col-span-3">সর্বোচ্চ পরিমাণ</div>
                <div className="col-span-4">প্রতি ইউনিট মূল্য (টাকা)</div>
                <div className="col-span-2">কার্যক্রম</div>
              </div>

              {bulkPrices.map((price, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={price.min_quantity}
                      onChange={(e) => updateBulkPrice(index, 'min_quantity', e.target.value)}
                      placeholder="সর্বনিম্ন"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={price.max_quantity}
                      onChange={(e) => updateBulkPrice(index, 'max_quantity', e.target.value)}
                      placeholder="সর্বোচ্চ (ঐচ্ছিক)"
                      min={price.min_quantity || 1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      value={price.price}
                      onChange={(e) => updateBulkPrice(index, 'price', e.target.value)}
                      placeholder="মূল্য"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    {bulkPrices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBulkPrice(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {bulkPrices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  এখনও কোনো বাল্ক মূল্য স্তর যোগ করা হয়নি। ভলিউম ভিত্তিক মূল্য তৈরি করতে "স্তর যোগ করুন" বাটনে ক্লিক করুন।
                </div>
              )}
            </div>

            {/* Information Box */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4 flex items-start gap-3">
              <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700 font-medium">বাল্ক মূল্য সম্পর্কে তথ্য</p>
                <ul className="mt-2 text-sm text-blue-600 list-disc list-inside space-y-1">
                  <li>বাল্ক অর্ডার উৎসাহিত করতে মূল্য মূল্যের চেয়ে কম হতে হবে</li>
                  <li>সর্বোচ্চ পরিমাণ ফাঁকা রাখলে সীমাহীন রেঞ্জ নির্দেশ করে (যেমন: ১০০+)</li>
                  <li>পরিমাণের রেঞ্জগুলি ওভারল্যাপ করা উচিত নয়</li>
                  <li>সিস্টেম স্বয়ংক্রিয়ভাবে অর্ডারকৃত পরিমাণের জন্য সর্বোত্তম মূল্য প্রয়োগ করবে</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}