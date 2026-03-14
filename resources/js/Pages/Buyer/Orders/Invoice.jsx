// Pages/Buyer/Orders/Invoice.jsx

// React - Core React imports for component functionality
import React, { useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// Layout - Buyer dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiArrowLeft,
  FiDownload,
  FiPrinter,
} from 'react-icons/fi';

export default function OrderInvoice({ order }) {
  // React hooks
  const invoiceRef = useRef();

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
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle print - Opens print window with invoice content
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>চালান #${order.order_number}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .company-name { font-size: 24px; font-weight: bold; color: #4f46e5; }
              .invoice-title { font-size: 20px; margin-top: 10px; }
              .details { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background: #f3f4f6; padding: 10px; text-align: left; }
              td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
              .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
              .footer { margin-top: 40px; text-align: center; color: #6b7280; }
            </style>
          </head>
          <body>
            ${invoiceRef.current?.innerHTML || ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <DashboardLayout>
      <Head title={`চালান #${order.order_number}`} />

      <div className="space-y-6">
        {/* Header - Back button, title and action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={route('buyer.orders.show', order.id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="text-xl" />
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">চালান</h2>
              <p className="text-gray-600 mt-1">অর্ডার #{order.order_number}</p>
            </div>
          </div>

          {/* Print and Download Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <FiPrinter className="mr-2" />
              প্রিন্ট
            </button>
            <button
              onClick={() => router.get(route('buyer.orders.download-invoice', order.id))}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <FiDownload className="mr-2" />
              ডাউনলোড PDF
            </button>
          </div>
        </div>

        {/* Invoice Content - Will be used for printing */}
        <div className="bg-white rounded-xl border p-8" ref={invoiceRef}>
          {/* Header - Company and invoice title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-600">আপনার কোম্পানির নাম</h1>
            <p className="text-gray-600 mt-2">চালান</p>
          </div>

          {/* Invoice Information */}
          <div className="flex justify-between mb-8">
            <div>
              <p className="text-sm text-gray-500">চালান নম্বর</p>
              <p className="font-medium">INV-{order.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">অর্ডার নম্বর</p>
              <p className="font-medium">{order.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">তারিখ</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">নির্ধারিত তারিখ</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
          </div>

          {/* Buyer & Supplier Information */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">প্রাপক:</h3>
              <p className="font-medium">{order.buyer?.name}</p>
              <p className="text-sm text-gray-600">{order.buyer?.email}</p>
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{order.shipping_address}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">প্রেরক:</h3>
              <p className="font-medium">{order.supplier?.name}</p>
              {order.supplier?.supplier && (
                <>
                  <p className="text-sm text-gray-600">{order.supplier.supplier.company_name}</p>
                  <p className="text-sm text-gray-600">{order.supplier.supplier.company_email}</p>
                  <p className="text-sm text-gray-600">{order.supplier.supplier.company_phone}</p>
                </>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr>
                <th className="text-left">আইটেম</th>
                <th className="text-left">পরিমাণ</th>
                <th className="text-left">একক মূল্য</th>
                <th className="text-left">মোট</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unit_price)}</td>
                  <td>{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Order Summary */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">সাবটোটাল:</span>
                <span className="font-medium">{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">শিপিং:</span>
                <span className="font-medium">ফ্রি</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold">
                <span>মোট:</span>
                <span className="text-indigo-600">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">পেমেন্ট স্ট্যাটাস:</span>{' '}
              <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                {order.payment_status === 'paid' ? 'পরিশোধিত' : 'অপেক্ষমান'}
              </span>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>আপনার ব্যবসার জন্য ধন্যবাদ!</p>
            <p className="mt-1">এই চালান সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}