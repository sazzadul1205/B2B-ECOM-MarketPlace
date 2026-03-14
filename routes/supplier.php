<?php
// routes/supplier.php

use App\Http\Controllers\Supplier\DashboardController;
use App\Http\Controllers\Supplier\ProfileController;
use App\Http\Controllers\Supplier\ProductController;
use App\Http\Controllers\Supplier\OrderController;
use App\Http\Controllers\Supplier\RfqController;
use App\Http\Controllers\Supplier\QuoteController;
use App\Http\Controllers\Supplier\MessageController;
use App\Http\Controllers\Supplier\AnalyticsController;
use Illuminate\Support\Facades\Route;

// Supplier routes are wrapped by the group in routes/web.php (prefix + middleware)

/**
 * Dashboard Routes
 */
Route::controller(DashboardController::class)->group(function () {
  Route::get('/dashboard', 'index')->name('dashboard');
  Route::get('/quick-stats', 'quickStats')->name('quick-stats');
  Route::get('/export', 'export')->name('export');
});

/**
 * Profile Routes
 */
Route::prefix('profile')->name('profile.')->controller(ProfileController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/edit', 'edit')->name('edit');
  Route::put('/', 'update')->name('update');
  Route::post('/upload-documents', 'uploadDocuments')->name('upload-documents');
  Route::post('/update-bank-details', 'updateBankDetails')->name('update-bank-details');
  Route::get('/completion', 'getProfileCompletion')->name('completion');
});

/**
 * Public Profile Routes (view only)
 */
Route::prefix('public')->name('public.')->controller(ProfileController::class)->group(function () {
  Route::get('/{companyName}', 'show')->name('show');
  Route::get('/{companyName}/{supplierId}', 'show')->name('show-by-id');
});

/**
 * Product Management Routes
 */
Route::prefix('products')->name('products.')->controller(ProductController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/create', 'create')->name('create');
  Route::post('/', 'store')->name('store');
  Route::get('/export', 'export')->name('export');
  Route::post('/bulk-delete', 'bulkDelete')->name('bulk-delete');
  Route::get('/statistics', 'statistics')->name('statistics');
  Route::get('/low-stock', 'lowStock')->name('low-stock');

  Route::get('/{product}', 'show')->name('show');
  Route::get('/{product}/edit', 'edit')->name('edit');
  Route::put('/{product}', 'update')->name('update');
  Route::delete('/{product}', 'destroy')->name('destroy');
  Route::patch('/{product}/toggle-status', 'toggleStatus')->name('toggle-status');
  Route::post('/{product}/duplicate', 'duplicate')->name('duplicate');

  // Bulk pricing routes
  Route::get('/{product}/bulk-prices', 'bulkPrices')->name('bulk-prices');
  Route::post('/{product}/bulk-prices', 'updateBulkPrices')->name('update-bulk-prices');

  // Stock management
  Route::post('/{product}/update-stock', 'updateStock')->name('update-stock');
  Route::get('/{product}/stock-history', 'stockHistory')->name('stock-history');
});

/**
 * Order Management Routes
 */
Route::prefix('orders')->name('orders.')->controller(OrderController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/export', 'export')->name('export');
  Route::get('/statistics', 'statistics')->name('statistics');
  Route::get('/pending', 'pending')->name('pending');
  Route::get('/processing', 'processing')->name('processing');
  Route::get('/shipped', 'shipped')->name('shipped');
  Route::get('/delivered', 'delivered')->name('delivered');
  Route::get('/cancelled', 'cancelled')->name('cancelled');

  Route::get('/{order}', 'show')->name('show');
  Route::post('/{order}/confirm', 'confirmOrder')->name('confirm');
  Route::post('/{order}/update-status', 'updateStatus')->name('update-status');
  Route::post('/{order}/cancel', 'cancelOrder')->name('cancel');
  Route::post('/{order}/add-tracking', 'addTracking')->name('add-tracking');
  Route::get('/{order}/invoice', 'generateInvoice')->name('invoice');
  Route::get('/{order}/packing-slip', 'packingSlip')->name('packing-slip');
});

/**
 * RFQ Management Routes
 */
Route::prefix('rfqs')->name('rfqs.')->controller(RfqController::class)->group(function () {
  // Available RFQs
  Route::get('/', 'index')->name('index');
  Route::get('/available', 'available')->name('available');
  Route::get('/matched', 'matched')->name('matched');

  // My quotes
  Route::get('/my-quotes', 'myQuotes')->name('my-quotes');
  Route::get('/my-quotes/export', 'exportMyQuotes')->name('export-my-quotes');

  // Single RFQ
  Route::get('/{rfq}', 'show')->name('show');
  Route::get('/{rfq}/check-eligibility', 'checkEligibility')->name('check-eligibility');

  // Quote operations
  Route::get('/{rfq}/create-quote', 'createQuote')->name('create-quote');
  Route::post('/{rfq}/store-quote', 'storeQuote')->name('store-quote');
  Route::get('/quotes/{quote}/edit', 'editQuote')->name('edit-quote');
  Route::put('/quotes/{quote}', 'updateQuote')->name('update-quote');
  Route::delete('/quotes/{quote}', 'deleteQuote')->name('delete-quote');
});

/**
 * Quote Management Routes (separate controller for better organization)
 */
Route::prefix('quotes')->name('quotes.')->controller(QuoteController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/export', 'export')->name('export');
  Route::get('/statistics', 'statistics')->name('statistics');
  Route::get('/pending', 'pending')->name('pending');
  Route::get('/accepted', 'accepted')->name('accepted');
  Route::get('/rejected', 'rejected')->name('rejected');
  Route::get('/expired', 'expired')->name('expired');

  Route::get('/{quote}', 'show')->name('show');
  Route::get('/{quote}/edit', 'edit')->name('edit');
  Route::put('/{quote}', 'update')->name('update');
  Route::post('/{quote}/withdraw', 'withdraw')->name('withdraw');
  Route::post('/{quote}/duplicate', 'duplicate')->name('duplicate');
  Route::post('/{quote}/extend-validity', 'extendValidity')->name('extend-validity');
  Route::get('/{quote}/check-validity', 'checkValidity')->name('check-validity');
});

/**
 * Message Routes
 */
Route::prefix('messages')->name('messages.')->controller(MessageController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/conversations', 'conversations')->name('conversations');
  Route::post('/', 'store')->name('store');
  Route::post('/send', 'send')->name('send');

  // Conversation with specific user
  Route::get('/with/{user}', 'show')->name('show');
  Route::post('/with/{user}/send', 'sendToUser')->name('send-to-user');

  // RFQ specific messages
  Route::get('/rfq/{rfq}', 'rfqMessages')->name('rfq');
  Route::post('/rfq/{rfq}/send', 'sendRfqMessage')->name('send-rfq');

  // Message actions
  Route::post('/mark-read', 'markAsRead')->name('mark-read');
  Route::post('/mark-all-read', 'markAllAsRead')->name('mark-all-read');
  Route::get('/unread-count', 'unreadCount')->name('unread-count');
  Route::get('/search', 'search')->name('search');
  Route::delete('/{message}', 'destroy')->name('destroy');

  // API endpoints for real-time features
  Route::get('/poll', 'poll')->name('poll');
  Route::post('/{message}/reply', 'reply')->name('reply');
});

/**
 * Analytics Routes
 */
Route::prefix('analytics')->name('analytics.')->controller(AnalyticsController::class)->group(function () {
  // Sales analytics
  Route::get('/sales', 'sales')->name('sales');
  Route::get('/sales/data', 'salesData')->name('sales.data');
  Route::get('/sales/export', 'exportSales')->name('export-sales');
  Route::get('/sales/comparison', 'salesComparison')->name('sales.comparison');
  Route::get('/sales/forecast', 'salesForecast')->name('sales.forecast');

  // Product analytics
  Route::get('/products', 'products')->name('products');
  Route::get('/products/data', 'productsData')->name('products.data');
  Route::get('/products/export', 'exportProducts')->name('export-products');
  Route::get('/products/performance', 'productPerformance')->name('products.performance');
  Route::get('/products/categories', 'categoryPerformance')->name('products.categories');

  // Quote analytics
  Route::get('/quotes', 'quotes')->name('quotes');
  Route::get('/quotes/data', 'quotesData')->name('quotes.data');
  Route::get('/quotes/export', 'exportQuotes')->name('export-quotes');
  Route::get('/quotes/conversion', 'quoteConversion')->name('quotes.conversion');
  Route::get('/quotes/response-time', 'responseTimeAnalysis')->name('quotes.response-time');

  // Customer analytics
  Route::get('/customers', 'customers')->name('customers');
  Route::get('/customers/top', 'topCustomers')->name('customers.top');
  Route::get('/customers/retention', 'customerRetention')->name('customers.retention');

  // Export all reports
  Route::post('/export', 'export')->name('export');
  Route::get('/export/{type}', 'exportReport')->name('export-report');

  // Dashboard widgets data
  Route::get('/widgets/sales-summary', 'salesSummary')->name('widgets.sales-summary');
  Route::get('/widgets/recent-activity', 'recentActivity')->name('widgets.recent-activity');
  Route::get('/widgets/performance-metrics', 'performanceMetrics')->name('widgets.performance-metrics');
});

/**
 * API-like routes for AJAX requests
 */
Route::prefix('api')->name('api.')->group(function () {
  // Quick actions
  Route::post('/products/{product}/quick-update', [ProductController::class, 'quickUpdate'])->name('products.quick-update');
  Route::post('/orders/{order}/quick-status', [OrderController::class, 'quickStatus'])->name('orders.quick-status');
  Route::post('/quotes/{quote}/quick-response', [QuoteController::class, 'quickResponse'])->name('quotes.quick-response');

  // Data tables
  Route::get('/datatable/products', [ProductController::class, 'datatable'])->name('datatable.products');
  Route::get('/datatable/orders', [OrderController::class, 'datatable'])->name('datatable.orders');
  Route::get('/datatable/quotes', [QuoteController::class, 'datatable'])->name('datatable.quotes');

  // Charts data
  Route::get('/charts/sales', [AnalyticsController::class, 'chartSales'])->name('charts.sales');
  Route::get('/charts/products', [AnalyticsController::class, 'chartProducts'])->name('charts.products');
  Route::get('/charts/quotes', [AnalyticsController::class, 'chartQuotes'])->name('charts.quotes');
});

/**
 * Optional: Dashboard redirect
 */
Route::get('/', function () {
  return redirect()->route('supplier.dashboard');
})->name('home');

/**
 * Settings Routes (if needed)
 */
Route::prefix('settings')->name('settings.')->group(function () {
  Route::get('/notifications', [ProfileController::class, 'notificationSettings'])->name('notifications');
  Route::post('/notifications', [ProfileController::class, 'updateNotificationSettings'])->name('update-notifications');
  Route::get('/shipping', [ProfileController::class, 'shippingSettings'])->name('shipping');
  Route::post('/shipping', [ProfileController::class, 'updateShippingSettings'])->name('update-shipping');
  Route::get('/payment', [ProfileController::class, 'paymentSettings'])->name('payment');
  Route::post('/payment', [ProfileController::class, 'updatePaymentSettings'])->name('update-payment');
});

/**
 * Bulk Operations Routes
 */
Route::prefix('bulk')->name('bulk.')->group(function () {
  Route::post('/products/status', [ProductController::class, 'bulkStatusUpdate'])->name('products.status');
  Route::post('/products/delete', [ProductController::class, 'bulkDelete'])->name('products.delete');
  Route::post('/orders/status', [OrderController::class, 'bulkStatusUpdate'])->name('orders.status');
  Route::post('/quotes/withdraw', [QuoteController::class, 'bulkWithdraw'])->name('quotes.withdraw');
});

/**
 * Import/Export Routes
 */
Route::prefix('import-export')->name('import-export.')->group(function () {
  Route::post('/products/import', [ProductController::class, 'import'])->name('products.import');
  Route::get('/products/template', [ProductController::class, 'downloadTemplate'])->name('products.template');
  Route::post('/bulk-prices/import', [ProductController::class, 'importBulkPrices'])->name('bulk-prices.import');
});
