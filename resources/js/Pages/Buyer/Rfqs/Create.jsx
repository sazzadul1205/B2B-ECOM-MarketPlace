// Pages/Buyer/Rfqs/Create.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Buyer dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiPlus,
  FiTrash2,
  FiPackage,
  FiCalendar,
  FiFileText,
  FiInfo,
  FiAlertCircle,
  FiArrowLeft
} from 'react-icons/fi';

export default function RfqCreate({ recentProducts, categories }) {

  // State management for form data, errors and submission status
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Form state - Initial form structure
  const [formData, setFormData] = useState({
    notes: '',
    title: '',
    description: '',
    required_by_date: '',
    products_requested: [
      {
        name: '',
        quantity: 1,
        unit: 'pcs',
        category: '',
        specifications: '',
      }
    ],
  });

  // Handle basic input field changes (non-product fields)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle product-specific field changes
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products_requested];
    updatedProducts[index][field] = value;
    setFormData(prev => ({ ...prev, products_requested: updatedProducts }));

    // Clear product field errors
    if (errors[`products_requested.${index}.${field}`]) {
      setErrors(prev => ({ ...prev, [`products_requested.${index}.${field}`]: null }));
    }
  };

  // Add new empty product row
  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products_requested: [
        ...prev.products_requested,
        {
          name: '',
          quantity: 1,
          unit: 'pcs',
          specifications: '',
          category: ''
        }
      ]
    }));
  };

  // Remove product row (minimum one product must remain)
  const removeProduct = (index) => {
    if (formData.products_requested.length > 1) {
      setFormData(prev => ({
        ...prev,
        products_requested: prev.products_requested.filter((_, i) => i !== index)
      }));
    }
  };

  // Quick select from recent products
  const useRecentProduct = (product) => {
    setFormData(prev => ({
      ...prev,
      products_requested: [
        {
          name: product.name,
          quantity: product.minimum_order_quantity || 1,
          unit: product.unit || 'pcs',
          specifications: '',
          category: product.category || ''
        }
      ]
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    // Validate title
    if (!formData.title) {
      newErrors.title = 'শিরোনাম প্রয়োজন';
    }

    // Validate required by date
    if (!formData.required_by_date) {
      newErrors.required_by_date = 'প্রয়োজনীয় তারিখ প্রয়োজন';
    } else {
      const selectedDate = new Date(formData.required_by_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        newErrors.required_by_date = 'প্রয়োজনীয় তারিখ ভবিষ্যতের হতে হবে';
      }
    }

    // Validate each product
    formData.products_requested.forEach((product, index) => {
      if (!product.name) {
        newErrors[`products_requested.${index}.name`] = 'পণ্যের নাম প্রয়োজন';
      }
      if (!product.quantity || product.quantity < 1) {
        newErrors[`products_requested.${index}.quantity`] = 'বৈধ পরিমাণ প্রয়োজন';
      }
      if (!product.unit) {
        newErrors[`products_requested.${index}.unit`] = 'ইউনিট প্রয়োজন';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    router.post(route('buyer.rfqs.store'), formData, {
      onSuccess: () => {
        setSubmitting(false);
      },
      onError: (errors) => {
        setErrors(errors);
        setSubmitting(false);
      }
    });
  };

  return (
    <DashboardLayout>
      <Head title="নতুন RFQ তৈরি" />

      <div className="space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center space-x-4">
          <Link
            href={route('buyer.rfqs.index')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">নতুন RFQ তৈরি</h2>
            <p className="text-gray-600 mt-1">ভেরিফাইড সাপ্লায়ারদের কাছ থেকে কোটা অনুরোধ করুন</p>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recent Products Quick Select - Optional feature */}
          {recentProducts?.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiPackage className="mr-2" /> সাম্প্রতিক পণ্য থেকে দ্রুত নির্বাচন
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => useRecentProduct(product)}
                    className="px-3 py-2 bg-white rounded-lg text-sm hover:bg-indigo-50 hover:text-indigo-600 transition-colors border"
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Basic Information Section */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-medium text-gray-700 mb-4 flex items-center">
              <FiFileText className="mr-2" /> মৌলিক তথ্য
            </h3>

            <div className="space-y-4">
              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RFQ শিরোনাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="যেমন: অফিস স্টেশনারি সরবরাহ প্রয়োজন"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.title ? 'border-red-500' : ''
                    }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.title}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  বিবরণ (ঐচ্ছিক)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="আপনার প্রয়োজনীয়তা সম্পর্কে অতিরিক্ত বিবরণ দিন..."
                  className="w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Products Requested Section */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-700 flex items-center">
                <FiPackage className="mr-2" /> প্রয়োজনীয় পণ্য <span className="text-red-500 ml-1">*</span>
              </h3>
              <button
                type="button"
                onClick={addProduct}
                className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors text-sm flex items-center"
              >
                <FiPlus className="mr-1" /> পণ্য যোগ করুন
              </button>
            </div>

            <div className="space-y-4">
              {formData.products_requested.map((product, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                  {/* Remove button - only shown if more than one product */}
                  {formData.products_requested.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Product Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        পণ্যের নাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                        placeholder="যেমন: A4 কাগজ"
                        className={`w-full border rounded-lg px-3 py-2 text-sm ${errors[`products_requested.${index}.name`] ? 'border-red-500' : ''
                          }`}
                      />
                      {errors[`products_requested.${index}.name`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`products_requested.${index}.name`]}</p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        পরিমাণ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        className={`w-full border rounded-lg px-3 py-2 text-sm ${errors[`products_requested.${index}.quantity`] ? 'border-red-500' : ''
                          }`}
                      />
                      {errors[`products_requested.${index}.quantity`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`products_requested.${index}.quantity`]}</p>
                      )}
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        ইউনিট <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={product.unit}
                        onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 text-sm ${errors[`products_requested.${index}.unit`] ? 'border-red-500' : ''
                          }`}
                      >
                        <option value="pcs">পিস (pcs)</option>
                        <option value="kg">কিলোগ্রাম (kg)</option>
                        <option value="g">গ্রাম (g)</option>
                        <option value="ton">টন</option>
                        <option value="m">মিটার (m)</option>
                        <option value="cm">সেন্টিমিটার (cm)</option>
                        <option value="l">লিটার (l)</option>
                        <option value="ml">মিলিলিটার (ml)</option>
                        <option value="box">বক্স</option>
                        <option value="pack">প্যাক</option>
                        <option value="set">সেট</option>
                      </select>
                      {errors[`products_requested.${index}.unit`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`products_requested.${index}.unit`]}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        ক্যাটাগরি (ঐচ্ছিক)
                      </label>
                      <select
                        value={product.category}
                        onChange={(e) => handleProductChange(index, 'category', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">ক্যাটাগরি নির্বাচন</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Specifications */}
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        বিবরণ (ঐচ্ছিক)
                      </label>
                      <textarea
                        value={product.specifications}
                        onChange={(e) => handleProductChange(index, 'specifications', e.target.value)}
                        rows="2"
                        placeholder="যেমন: সাইজ: A4, ওজন: ৮০gsm, ব্র্যান্ড: যেকোনো"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-medium text-gray-700 mb-4 flex items-center">
              <FiInfo className="mr-2" /> অতিরিক্ত তথ্য
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Required By Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  প্রয়োজনীয় তারিখ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    name="required_by_date"
                    value={formData.required_by_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.required_by_date ? 'border-red-500' : ''
                      }`}
                  />
                </div>
                {errors.required_by_date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.required_by_date}
                  </p>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  অতিরিক্ত নোট (ঐচ্ছিক)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="সাপ্লায়ারদের জন্য বিশেষ প্রয়োজনীয়তা বা নির্দেশনা..."
                  className="w-full border rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions - Submit and Cancel buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              href={route('buyer.rfqs.index')}
              className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              বাতিল
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  তৈরি হচ্ছে...
                </>
              ) : (
                'RFQ তৈরি করুন'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}