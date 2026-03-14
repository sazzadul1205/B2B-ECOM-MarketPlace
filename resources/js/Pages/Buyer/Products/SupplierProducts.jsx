// Pages/Buyer/Products/SupplierProducts.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head, Link } from '@inertiajs/react';

// Layout - Buyer dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import { FiPackage } from 'react-icons/fi';

export default function SupplierProducts({ products }) {
  // Format currency - Converts number to BDT currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <Head title="সাপ্লায়ারের পণ্য" />

      <div className="space-y-6">
        {/* Header - Page title and back link */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">সাপ্লায়ারের পণ্য</h2>
          <Link
            href={route('buyer.products.index')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← সকল পণ্যে ফিরে যান
          </Link>
        </div>

        {/* Products Grid */}
        {products.data.length === 0 ? (
          // Empty State - No products found
          <div className="bg-white rounded-xl p-12 text-center border">
            <FiPackage className="mx-auto text-5xl text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">কোনো পণ্য পাওয়া যায়নি</h3>
            <p className="text-gray-500">এই সাপ্লায়ার এখনো কোনো পণ্য তালিকাভুক্ত করেননি।</p>
          </div>
        ) : (
          // Product Grid
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.data.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border p-4 hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center">
                  {product.main_image ? (
                    <img
                      src={product.main_image ? `/storage/${product.main_image}` : '/noImg.jpg'}
                      alt={product.name}
                      className="h-full object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/noImg.jpg';
                      }}
                    />
                  ) : (
                    <FiPackage className="text-3xl text-gray-400" />
                  )}
                </div>

                {/* Product Details */}
                <h3 className="font-medium mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <p className="text-lg font-bold text-indigo-600 mb-2">{formatCurrency(product.base_price)}</p>
                <p className="text-sm text-gray-500 mb-3">
                  সর্বনিম্ন অর্ডার: {product.minimum_order_quantity} {product.unit}
                </p>

                {/* View Details Button */}
                <Link
                  href={route('buyer.products.show', product.slug)}
                  className="block text-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  বিস্তারিত দেখুন
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}