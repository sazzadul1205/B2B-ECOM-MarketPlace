// Pages/Buyer/Products/Show.jsx

// React - Core React imports for component functionality
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Buyer dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiPackage,
  FiTruck,
  FiShoppingCart,
  FiCheckCircle,
  FiArrowLeft,
  FiClock,
  FiShield,
  FiAward,
} from 'react-icons/fi';
import { BsGraphUp } from 'react-icons/bs';

const NoImg = "/noImg.jpg";

export default function ProductShow({ product, relatedProducts, bulkTiers }) {
  // State management for quantity, pricing and loading
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [quantity, setQuantity] = useState(product.minimum_order_quantity || 1);

  // State management for price information
  const [priceInfo, setPriceInfo] = useState({
    unitPrice: product.base_price,
    totalPrice: product.base_price * product.minimum_order_quantity,
    savings: 0
  });

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle quantity change with empty state support
  const handleQuantityChange = (e) => {
    const value = e.target.value;

    // allow empty typing
    if (value === '') {
      setQuantity('');
      return;
    }

    const newQuantity = parseInt(value);

    setQuantity(newQuantity);

    if (newQuantity >= product.minimum_order_quantity) {
      calculatePrice(newQuantity);
    }
  };

  // Calculate price based on quantity and bulk pricing tiers
  const calculatePrice = (qty) => {
    let unitPrice = product.base_price;
    let savings = 0;
    let matchedTier = null;

    // Find applicable bulk pricing tier
    for (const tier of bulkTiers) {
      if (qty >= tier.quantity) {
        unitPrice = tier.price;
        savings = tier.savings || 0;
        matchedTier = tier;
      }
    }

    setSelectedTier(matchedTier);

    setPriceInfo({
      unitPrice,
      totalPrice: unitPrice * qty,
      savings
    });
  };

  // Order now - Direct purchase
  const handleOrderNow = () => {

    setLoading(true);

    router.post(route('buyer.orders.order-now'), {
      product_id: product.id,
      quantity: quantity,
      shipping_address: "Default Address"
    }, {
      onSuccess: () => {
        setLoading(false);
        router.get(route('buyer.orders.index'));
      },
      onError: () => {
        setLoading(false);
      }
    });

  };

  // Create RFQ from this product
  const createRFQ = () => {
    router.get(route('buyer.rfqs.create'), {
      product_id: product.id,
      quantity: quantity
    });
  };

  // Calculate initial price on component mount
  React.useEffect(() => {
    calculatePrice(quantity);
  }, []);

  return (
    <DashboardLayout>
      <Head title={`${product.name} - পণ্যের বিবরণ`} />

      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm">
          <Link href={route('buyer.dashboard')} className="text-gray-500 hover:text-gray-700">
            ড্যাশবোর্ড
          </Link>
          <span className="text-gray-400">/</span>
          <Link href={route('buyer.products.index')} className="text-gray-500 hover:text-gray-700">
            পণ্য
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <FiArrowLeft className="mr-2" /> পণ্যে ফিরে যান
        </button>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Image */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-4">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                {product.main_image ? (
                  <img
                    src={product.main_image ? `/storage/${product.main_image}` : NoImg}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = NoImg;
                    }}
                  />
                ) : (
                  <FiPackage className="text-6xl text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border p-6">
              {/* Title and Category */}
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm rounded-full">
                    {product.category}
                  </span>
                  {product.bulk_prices?.length > 0 && (
                    <span className="px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full flex items-center">
                      <BsGraphUp className="mr-1" /> বাল্ক মূল্য উপলব্ধ
                    </span>
                  )}
                </div>
              </div>

              {/* Supplier Information */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">সাপ্লায়ার</p>
                    <div className="flex items-center">
                      <FiTruck className="text-gray-400 mr-2" />
                      <span className="font-medium text-gray-800">{product.supplier?.user?.name}</span>
                      {product.supplier?.verification_status === 'verified' && (
                        <FiCheckCircle className="ml-2 text-green-500" title="ভেরিফাইড সাপ্লায়ার" />
                      )}
                    </div>
                  </div>
                  <Link
                    href={route('buyer.suppliers.show', product.supplier_id)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    সাপ্লায়ার প্রোফাইল দেখুন →
                  </Link>
                </div>
              </div>

              {/* Product Description */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">পণ্যের বিবরণ</h3>
                <p className="text-gray-600">{product.description || 'কোনো বিবরণ দেওয়া হয়নি।'}</p>
              </div>

              {/* Pricing and Quantity Section */}
              <div className="mb-6 p-4 border rounded-lg">
                <h3 className="font-medium text-gray-700 mb-4">মূল্য ও পরিমাণ</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quantity Input */}
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      পরিমাণ ({product.unit})
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={quantity}
                        min={product.minimum_order_quantity || 1}
                        onChange={handleQuantityChange}
                        className="w-32 border rounded-lg px-3 py-2 text-center"
                      />

                      <span className="text-sm text-gray-500">
                        (সর্বনিম্ন: {product.minimum_order_quantity})
                      </span>
                    </div>
                  </div>

                  {/* Unit Price Display */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">একক মূল্য</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(priceInfo.unitPrice)}
                    </p>
                    {priceInfo.savings > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        আপনি {priceInfo.savings}% সাশ্রয় করছেন
                      </p>
                    )}
                  </div>

                  {/* Total Amount Display */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">মোট পরিমাণ</p>
                    <p className="text-xl font-bold text-gray-800">
                      {quantity < product.minimum_order_quantity ? (
                        <span className="text-red-500 text-sm font-medium">
                          অনুমোদিত নয় (সর্বনিম্ন {product.minimum_order_quantity})
                        </span>
                      ) : (
                        formatCurrency(priceInfo.totalPrice)
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bulk Pricing Table */}
              {bulkTiers?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                    <BsGraphUp className="mr-2" /> বাল্ক মূল্য স্তর
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">পরিমাণ</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">একক মূল্য</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">মোট</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">সাশ্রয়</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {bulkTiers.map((tier, index) => (
                          <tr
                            key={index}
                            className={selectedTier?.quantity === tier.quantity ? 'bg-green-50' : ''}
                          >
                            <td className="px-4 py-2 text-sm">
                              {tier.quantity}+ {product.unit}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium">
                              {formatCurrency(tier.price)}/{product.unit}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {formatCurrency(tier.total)}
                            </td>
                            <td className="px-4 py-2 text-sm text-green-600">
                              {tier.savings ? `সাশ্রয় ${tier.savings}%` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleOrderNow}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <FiShoppingCart className="mr-2" />
                  এখনই অর্ডার করুন
                </button>
                <button
                  onClick={createRFQ}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <FiPackage className="mr-2" />
                  RFQ তৈরি করুন
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Specifications */}
          <div className="lg:col-span-2 bg-white rounded-xl border p-6">
            <h3 className="font-medium text-gray-700 mb-4">পণ্যের বিবরণ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">সর্বনিম্ন অর্ডার পরিমাণ</p>
                <p className="font-medium">{product.minimum_order_quantity} {product.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">স্টক অবস্থা</p>
                <p className="font-medium">
                  {product.stock_quantity > 0 ? (
                    <span className="text-green-600">স্টকে আছে ({product.stock_quantity})</span>
                  ) : (
                    <span className="text-red-600">স্টকে নেই</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ইউনিট</p>
                <p className="font-medium">{product.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ক্যাটাগরি</p>
                <p className="font-medium">{product.category}</p>
              </div>
            </div>
          </div>

          {/* Supplier Badges */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-medium text-gray-700 mb-4">সাপ্লায়ার তথ্য</h3>
            <div className="space-y-3">
              {product.supplier?.verification_status === 'verified' && (
                <div className="flex items-center text-green-600">
                  <FiShield className="mr-2" />
                  <span className="text-sm">ভেরিফাইড সাপ্লায়ার</span>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <FiAward className="mr-2" />
                <span className="text-sm">{new Date(product.supplier?.created_at).getFullYear()} থেকে সদস্য</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiClock className="mr-2" />
                <span className="text-sm">প্রতিক্রিয়া সময়: &lt; ২৪ ঘন্টা</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts?.length > 0 && (
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-medium text-gray-700 mb-4">সম্পর্কিত পণ্য</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={route('buyer.products.show', product.slug)}
                  className="group"
                >
                  <div className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center">
                      {product.main_image ? (
                        <img
                          src={product.main_image ? `/storage/${product.main_image}` : NoImg}
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = NoImg;
                          }}
                        />
                      ) : (
                        <FiPackage className="text-2xl text-gray-400" />
                      )}
                    </div>
                    <h4 className="font-medium text-sm group-hover:text-indigo-600 line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                    <p className="text-sm font-bold text-indigo-600 mt-1">
                      {formatCurrency(product.base_price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}