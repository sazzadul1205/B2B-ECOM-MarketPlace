// Pages/Supplier/Products/Create.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiSave,
  FiX,
  FiUpload,
  FiPlus,
  FiTrash2,
  FiInfo,
} from 'react-icons/fi';

// Image placeholder
const NoImg = "/noImg.jpg";

export default function CreateProduct({ categories, units }) {

  // State management for main image and additional images
  const [imagePreview, setImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);

  // State management for bulk pricing tiers and image previews
  const [bulkPrices, setBulkPrices] = useState([
    { min_quantity: '', max_quantity: '', price: '' }
  ]);

  // Inertia form handling
  const { data, setData, post, processing, errors, progress } = useForm({
    name: '',
    category: '',
    unit: 'piece',
    base_price: '',
    description: '',
    main_image: null,
    stock_quantity: 0,
    additional_images: [],
    bulk_prices: bulkPrices,
    minimum_order_quantity: 1,
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Filter out empty bulk prices
    const validBulkPrices = bulkPrices.filter(
      bp => bp.min_quantity && bp.price
    );

    post(route('supplier.products.store'), {
      data: {
        ...data,
        bulk_prices: validBulkPrices
      },
      preserveScroll: true
    });
  };

  // Handle main image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('main_image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle additional images selection and previews
  const handleAdditionalImages = (e) => {
    const files = Array.from(e.target.files);
    setData('additional_images', [...data.additional_images, ...files]);

    // Create previews for each selected image
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalImages(prev => [...prev, { file, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove additional image
  const removeAdditionalImage = (index) => {
    const newImages = [...data.additional_images];
    newImages.splice(index, 1);
    setData('additional_images', newImages);

    const newPreviews = [...additionalImages];
    newPreviews.splice(index, 1);
    setAdditionalImages(newPreviews);
  };

  // Add new bulk pricing tier
  const addBulkPrice = () => {
    setBulkPrices([...bulkPrices, { min_quantity: '', max_quantity: '', price: '' }]);
  };

  // Remove bulk pricing tier
  const removeBulkPrice = (index) => {
    const newPrices = bulkPrices.filter((_, i) => i !== index);
    setBulkPrices(newPrices);
    setData('bulk_prices', newPrices);
  };

  // Update bulk pricing field
  const updateBulkPrice = (index, field, value) => {
    const newPrices = [...bulkPrices];
    newPrices[index][field] = value;
    setBulkPrices(newPrices);
    setData('bulk_prices', newPrices);
  };

  return (
    <DashboardLayout>
      <Head title="নতুন পণ্য তৈরি" />

      <div className="space-y-6">
        {/* Header - Page title and action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">নতুন পণ্য যোগ করুন</h1>
            <p className="text-sm text-gray-600 mt-1">
              আপনার ক্যাটালগের জন্য একটি নতুন পণ্য তৈরি করুন
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={route('supplier.products.index')}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
            >
              <FiX className="w-4 h-4" />
              <span>বাতিল</span>
            </Link>
            <button
              onClick={handleSubmit}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              <span>{processing ? 'সংরক্ষণ হচ্ছে...' : 'পণ্য সংরক্ষণ'}</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">মৌলিক তথ্য</h2>

                <div className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      পণ্যের নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ক্যাটাগরি <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.category}
                      onChange={e => setData('category', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      required
                    >
                      <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      বিবরণ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={data.description}
                      onChange={e => setData('description', e.target.value)}
                      rows="6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      required
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">মূল্য ও মজুত</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Base Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      মূল মূল্য (টাকা) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={data.base_price}
                      onChange={e => setData('base_price', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      required
                    />
                    {errors.base_price && (
                      <p className="mt-1 text-sm text-red-600">{errors.base_price}</p>
                    )}
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ইউনিট <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.unit}
                      onChange={e => setData('unit', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      required
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  {/* Minimum Order Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      সর্বনিম্ন অর্ডার পরিমাণ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={data.minimum_order_quantity}
                      onChange={e => setData('minimum_order_quantity', e.target.value)}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      required
                    />
                    {errors.minimum_order_quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.minimum_order_quantity}</p>
                    )}
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      মজুত পরিমাণ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={data.stock_quantity}
                      onChange={e => setData('stock_quantity', e.target.value)}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      required
                    />
                    {errors.stock_quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.stock_quantity}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bulk Pricing Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">বাল্ক মূল্য (ঐচ্ছিক)</h2>
                  <button
                    type="button"
                    onClick={addBulkPrice}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                  >
                    <FiPlus className="w-4 h-4" />
                    স্তর যোগ করুন
                  </button>
                </div>

                <div className="space-y-3">
                  {bulkPrices.map((price, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="সর্বনিম্ন পরিমাণ"
                        value={price.min_quantity}
                        onChange={(e) => updateBulkPrice(index, 'min_quantity', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="সর্বোচ্চ পরিমাণ"
                        value={price.max_quantity}
                        onChange={(e) => updateBulkPrice(index, 'max_quantity', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="মূল্য"
                        value={price.price}
                        onChange={(e) => updateBulkPrice(index, 'price', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      />
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
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  সর্বোচ্চ পরিমাণ ফাঁকা রাখলে সীমাহীন রেঞ্জ নির্দেশ করে। যেমন: ১০-৫০, ৫০-১০০, ১০০+
                </p>
              </div>
            </div>

            {/* Sidebar - Right Column */}
            <div className="space-y-6">
              {/* Main Image Upload */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">প্রধান ছবি</h2>

                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="প্রিভিউ"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = NoImg;
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setData('main_image', null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-gray-200 border-dashed rounded-lg p-6 text-center">
                      <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">পণ্যের প্রধান ছবি আপলোড করুন</p>
                      <input
                        type="file"
                        id="main_image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('main_image').click()}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                      >
                        ছবি নির্বাচন
                      </button>
                    </div>
                  )}

                  {progress?.main_image && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${progress.main_image.percentage}%` }}
                      />
                    </div>
                  )}

                  {errors.main_image && (
                    <p className="text-sm text-red-600">{errors.main_image}</p>
                  )}
                </div>
              </div>

              {/* Additional Images Upload */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">অতিরিক্ত ছবি</h2>

                <div className="space-y-4">
                  {/* Image Previews */}
                  {additionalImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {additionalImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.preview}
                            alt={`অতিরিক্ত ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = NoImg;
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-2 border-gray-200 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="additional_images"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImages}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('additional_images').click()}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      + আরো ছবি যোগ করুন
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      আপনি একাধিক ছবি নির্বাচন করতে পারেন
                    </p>
                  </div>

                  {errors.additional_images && (
                    <p className="text-sm text-red-600">{errors.additional_images}</p>
                  )}
                </div>
              </div>

              {/* Information Box - Product Approval Notice */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">পণ্য অনুমোদন</p>
                    <p className="text-xs text-blue-600 mt-1">
                      নতুন পণ্য অ্যাডমিন দ্বারা পর্যালোচনা করা হবে এবং তারপর ক্রেতাদের কাছে দৃশ্যমান হবে।
                      এটি সাধারণত ১-২ কার্যদিবস সময় নেয়।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}