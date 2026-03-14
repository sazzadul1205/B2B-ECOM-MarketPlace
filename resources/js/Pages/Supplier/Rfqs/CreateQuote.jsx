// Pages/Supplier/Rfqs/CreateQuote.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiArrowLeft,
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiPackage,
  FiAlertCircle
} from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function CreateQuote({ rfq, products, requestedProducts }) {
  // State management for selected products
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Inertia form handling
  const { data, setData, post, processing, errors } = useForm({
    total_amount: 0,
    valid_until: '',
    product_breakdown: [],
    notes: '',
    delivery_estimate: '',
    payment_terms: ''
  });

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Add product to breakdown
  const addProduct = (product) => {
    const exists = selectedProducts.find(p => p.id === product.id);
    if (exists) return;

    const newProduct = {
      product_id: product.id,
      name: product.name,
      quantity: product.minimum_order_quantity || 1,
      unit_price: product.base_price,
      total_price: (product.minimum_order_quantity || 1) * product.base_price
    };

    const newSelected = [...selectedProducts, newProduct];
    setSelectedProducts(newSelected);
    updateTotal(newSelected);
  };

  // Update product in breakdown
  const updateProduct = (index, field, value) => {
    const updated = [...selectedProducts];
    updated[index][field] = value;

    // Recalculate total price
    updated[index].total_price = updated[index].quantity * updated[index].unit_price;

    setSelectedProducts(updated);
    updateTotal(updated);
  };

  // Remove product from breakdown
  const removeProduct = (index) => {
    const updated = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updated);
    updateTotal(updated);
  };

  // Update total amount
  const updateTotal = (products) => {
    const total = products.reduce((sum, p) => sum + p.total_price, 0);
    setData('total_amount', total);
    setData('product_breakdown', products);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "পণ্য যোগ করুন",
        text: "অনুগ্রহ করে আপনার কোটায় অন্তত একটি পণ্য যোগ করুন",
        confirmButtonText: "ঠিক আছে"
      });
      return;
    }

    Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "আপনি কি এই কোটাটি সাবমিট করতে চান?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, সাবমিট করুন",
      cancelButtonText: "না",
      confirmButtonColor: "#16a34a"
    }).then((result) => {
      if (result.isConfirmed) {
        post(route("supplier.rfqs.store-quote", rfq.id), {
          onSuccess: () => {
            Swal.fire({
              icon: "success",
              title: "সফল",
              text: "কোটা সফলভাবে সাবমিট হয়েছে"
            });
          },
          onError: () => {
            Swal.fire({
              icon: "error",
              title: "ত্রুটি",
              text: "কোটা সাবমিট করা যায়নি"
            });
          }
        });
      }
    });
  };

  // Set minimum valid until date (tomorrow)
  const minValidUntil = new Date();
  minValidUntil.setDate(minValidUntil.getDate() + 1);
  const minValidUntilStr = minValidUntil.toISOString().split('T')[0];

  return (
    <DashboardLayout>
      <Head title={`RFQ #${rfq.rfq_number} - কোটা তৈরি`} />

      <div className="space-y-6">
        {/* Header - Back button, title and action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              href={route('supplier.rfqs.show', rfq.id)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">কোটা তৈরি</h1>
              <p className="text-sm text-gray-600 mt-1">
                RFQ: {rfq.rfq_number} - {rfq.title} -এর জন্য
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={route('supplier.rfqs.show', rfq.id)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition"
            >
              <FiX className="w-4 h-4" />
              <span>বাতিল</span>
            </Link>
            <button
              onClick={handleSubmit}
              disabled={processing || selectedProducts.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              <span>{processing ? 'জমা দেওয়া হচ্ছে...' : 'কোটা জমা দিন'}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Product Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* RFQ Info Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">RFQ সারসংক্ষেপ</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">মোট অনুরোধকৃত পরিমাণ</p>
                    <p className="font-bold text-gray-900">{rfq.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">প্রয়োজনীয় তারিখ</p>
                    <p className="font-medium text-gray-900">
                      {new Date(rfq.required_by_date).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">পণ্য নির্বাচন</h2>

                {/* Requested Products Suggestions */}
                {requestedProducts.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">ক্রেতার অনুরোধ:</p>
                    <div className="flex flex-wrap gap-2">
                      {requestedProducts.map((item, index) => (
                        <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                          {item.category || item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Products */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">আপনার পণ্য:</p>
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-indigo-200 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <FiPackage className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            মূল মূল্য: {formatCurrency(product.base_price)} | সর্বনিম্ন অর্ডার: {product.minimum_order_quantity} {product.unit}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addProduct(product)}
                        className="p-2 text-indigo-600 hover:text-indigo-700"
                      >
                        <FiPlus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quote Items */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">কোটা আইটেম</h2>

                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    আপনার কোটায় যোগ করতে উপরের পণ্য নির্বাচন করুন
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedProducts.map((product, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">পরিমাণ</label>
                            <input
                              type="number"
                              value={product.quantity}
                              onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 0)}
                              min="1"
                              className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">একক মূল্য (টাকা)</label>
                            <input
                              type="number"
                              value={product.unit_price}
                              onChange={(e) => updateProduct(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">মোট</label>
                            <p className="font-medium text-indigo-600 pt-1">
                              {formatCurrency(product.total_price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Quote Total */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">মোট কোটা পরিমাণ</span>
                        <span className="text-2xl font-bold text-indigo-600">
                          {formatCurrency(data.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Quote Details */}
            <div className="space-y-6">
              {/* Quote Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">কোটা বিবরণ</h2>

                <div className="space-y-4">
                  {/* Valid Until */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      মেয়াদ শেষ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={data.valid_until}
                      onChange={(e) => setData('valid_until', e.target.value)}
                      min={minValidUntilStr}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      required
                    />
                    {errors.valid_until && (
                      <p className="mt-1 text-sm text-red-600">{errors.valid_until}</p>
                    )}
                  </div>

                  {/* Delivery Estimate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ডেলিভারি সময়
                    </label>
                    <input
                      type="text"
                      value={data.delivery_estimate}
                      onChange={(e) => setData('delivery_estimate', e.target.value)}
                      placeholder="যেমন: ৫-৭ কার্যদিবস"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>

                  {/* Payment Terms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      পেমেন্ট শর্তাবলী
                    </label>
                    <select
                      value={data.payment_terms}
                      onChange={(e) => setData('payment_terms', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    >
                      <option value="">পেমেন্ট শর্তাবলী নির্বাচন</option>
                      <option value="advance">১০০% অগ্রিম</option>
                      <option value="partial">৫০% অগ্রিম, ৫০% ডেলিভারিতে</option>
                      <option value="delivery">ডেলিভারিতে পেমেন্ট</option>
                      <option value="credit_7">৭ দিন ক্রেডিট</option>
                      <option value="credit_15">১৫ দিন ক্রেডিট</option>
                      <option value="credit_30">৩০ দিন ক্রেডিট</option>
                    </select>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      অতিরিক্ত নোট
                    </label>
                    <textarea
                      value={data.notes}
                      onChange={(e) => setData('notes', e.target.value)}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="ক্রেতার জন্য যেকোনো অতিরিক্ত তথ্য..."
                    />
                  </div>
                </div>
              </div>

              {/* Info Box - Quote Tips */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">কোটা টিপস</p>
                    <ul className="mt-2 text-xs text-blue-600 list-disc list-inside space-y-1">
                      <li>আপনার মূল্য প্রতিযোগিতামূলক রাখুন</li>
                      <li>বাস্তবসম্মত ডেলিভারি সময় নির্ধারণ করুন</li>
                      <li>স্পষ্ট পেমেন্ট শর্তাবলী আস্থা তৈরি করতে সাহায্য করে</li>
                      <li>ক্রেতারা বিস্তারিত মূল্য বিশ্লেষণ সহ কোটা পছন্দ করেন</li>
                    </ul>
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