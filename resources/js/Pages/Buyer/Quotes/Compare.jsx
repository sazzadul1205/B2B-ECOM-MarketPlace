// Pages/Buyer/Quotes/Compare.jsx

// React - Core React imports for component functionality
import React from 'react';
import { Head, Link } from '@inertiajs/react';

// Layout - Buyer dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiStar,
  FiPackage
} from 'react-icons/fi';

export default function QuoteCompare({ comparisonData }) {

  // Format currency - Converts number to BDT currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date - Converts ISO date to readable format
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get all unique product names across all quotes for comparison
  const getAllProducts = () => {
    const products = new Set();
    comparisonData.forEach(item => {
      item.breakdown?.forEach(product => {
        products.add(product.name);
      });
    });
    return Array.from(products);
  };

  const allProducts = getAllProducts();

  return (
    <DashboardLayout>
      <Head title="কোটা তুলনা" />

      <div className="space-y-6">
        {/* Header - Back button and page title */}
        <div className="flex items-center space-x-4">
          <Link
            href={route('buyer.quotes.index')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">কোটা তুলনা</h2>
            <p className="text-gray-600 mt-1">সেরা সিদ্ধান্ত নিতে কোটা পাশাপাশি তুলনা করুন</p>
          </div>
        </div>

        {/* Comparison Table - Responsive with horizontal scroll */}
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full min-w-[800px]">
            {/* Table Header - Quote headers */}
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 text-left font-medium text-gray-700">মানদণ্ড</th>
                {comparisonData.map((item, index) => (
                  <th key={index} className="p-4 text-left font-medium text-gray-700">
                    <div className="space-y-2">
                      <p className="font-bold">কোটা #{item.quote.quote_number}</p>
                      <p className="text-sm text-gray-500">{item.supplier}</p>
                      <div className="flex items-center text-sm">
                        <FiStar className="text-yellow-400 mr-1" />
                        <span>{item.supplier_rating}</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body - Comparison rows */}
            <tbody>
              {/* Total Amount Row */}
              <tr className="border-b">
                <td className="p-4 font-medium">মোট পরিমাণ</td>
                {comparisonData.map((item, index) => (
                  <td key={index} className="p-4">
                    <span className="text-lg font-bold text-indigo-600">
                      {formatCurrency(item.total)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Status Row */}
              <tr className="border-b">
                <td className="p-4 font-medium">স্ট্যাটাস</td>
                {comparisonData.map((item, index) => (
                  <td key={index} className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.quote.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        item.quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {item.quote.status === 'pending' ? 'অপেক্ষমান' :
                        item.quote.status === 'accepted' ? 'গৃহীত' :
                          item.quote.status === 'rejected' ? 'প্রত্যাখ্যাত' : item.quote.status}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Valid Until Row */}
              <tr className="border-b">
                <td className="p-4 font-medium">মেয়াদ শেষ</td>
                {comparisonData.map((item, index) => (
                  <td key={index} className="p-4">
                    <div className="flex items-center">
                      <FiClock className="mr-2 text-gray-400" />
                      <span>{formatDate(item.valid_until)}</span>
                    </div>
                    {new Date(item.valid_until) < new Date() && (
                      <span className="text-xs text-red-600 block mt-1">মেয়াদোত্তীর্ণ</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Supplier Verification Status Row */}
              <tr className="border-b">
                <td className="p-4 font-medium">সাপ্লায়ার স্ট্যাটাস</td>
                {comparisonData.map((item, index) => (
                  <td key={index} className="p-4">
                    {item.quote.supplier?.supplier?.verification_status === 'verified' ? (
                      <span className="flex items-center text-green-600">
                        <FiCheckCircle className="mr-2" /> ভেরিফাইড
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-500">
                        <FiXCircle className="mr-2" /> অভেরিফাইড
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Product Breakdown Rows - Dynamic per product */}
              {allProducts.map((productName, productIndex) => (
                <tr key={productIndex} className="border-b">
                  <td className="p-4 font-medium">{productName}</td>
                  {comparisonData.map((item, quoteIndex) => {
                    const product = item.breakdown?.find(p => p.name === productName);
                    return (
                      <td key={quoteIndex} className="p-4">
                        {product ? (
                          <div>
                            <p className="font-medium">{formatCurrency(product.price)}</p>
                            <p className="text-xs text-gray-500">
                              {product.quantity} ইউনিট
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Action Buttons Row */}
              <tr>
                <td className="p-4"></td>
                {comparisonData.map((item, index) => (
                  <td key={index} className="p-4">
                    {item.quote.status === 'pending' && new Date(item.valid_until) >= new Date() ? (
                      <div className="space-y-2">
                        <Link
                          href={route('buyer.quotes.accept-confirm', item.quote.id)}
                          className="block w-full text-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          গ্রহণ
                        </Link>
                        <Link
                          href={route('buyer.quotes.reject-confirm', item.quote.id)}
                          className="block w-full text-center px-3 py-2 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200"
                        >
                          প্রত্যাখ্যান
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={route('buyer.quotes.show', item.quote.id)}
                        className="block w-full text-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                      >
                        বিস্তারিত দেখুন
                      </Link>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend/Notes */}
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          <p className="flex items-center">
            <FiPackage className="mr-2" />
            মোট পরিমাণ, পণ্যের মূল্য এবং সাপ্লায়ারের বিবরণের ভিত্তিতে কোটা তুলনা করুন।
            আপনার প্রয়োজন অনুযায়ী সেরা কোটা নির্বাচন করুন।
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}