<?php
// routes/admin.php 

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\SupplierManagementController;
use App\Http\Controllers\Admin\SupplierVerificationController;
use App\Http\Controllers\Admin\ProductManagementController;
use App\Http\Controllers\Admin\ProductApprovalController;
use App\Http\Controllers\Admin\OrderManagementController;
use App\Http\Controllers\Admin\RfqManagementController;
use App\Http\Controllers\Admin\ReportController;
use Illuminate\Support\Facades\Route;

// Admin routes are wrapped by the group in routes/web.php (prefix + middleware)

/**
 * Dashboard Routes
 */
Route::controller(DashboardController::class)->group(function () {
  Route::get('/dashboard', 'index')->name('dashboard');
  Route::get('/quick-stats', 'quickStats')->name('quick-stats');
  Route::get('/monthly-report', 'monthlyReport')->name('monthly-report');
});

/**
 * User Management Routes
 */
Route::prefix('users')->name('users.')->controller(UserManagementController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/create', 'create')->name('create');
  Route::post('/', 'store')->name('store');
  Route::get('/export', 'export')->name('export');
  Route::get('/{user}', 'show')->name('show');
  Route::get('/{user}/edit', 'edit')->name('edit');
  Route::put('/{user}', 'update')->name('update');
  Route::patch('/{user}/toggle-status', 'toggleStatus')->name('toggle-status');
  Route::post('/{user}/reset-password', 'resetPassword')->name('reset-password');
  Route::delete('/{user}', 'destroy')->name('destroy');

  // Supplier profile for users
  Route::get('/{user}/create-supplier', 'createSupplier')->name('create-supplier');
  Route::post('/{user}/store-supplier', 'storeSupplier')->name('store-supplier');
});

/**
 * Supplier Management Routes
 */
Route::prefix('suppliers')->name('suppliers.')->controller(SupplierManagementController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/export', 'export')->name('export');
  Route::get('/list', 'getSuppliersList')->name('list');
  Route::post('/bulk-update', 'bulkUpdate')->name('bulk-update');
  Route::get('/{supplier}', 'show')->name('show');
  Route::get('/{supplier}/edit', 'edit')->name('edit');
  Route::put('/{supplier}', 'update')->name('update');
  Route::patch('/{supplier}/toggle-status', 'toggleStatus')->name('toggle-status');
  Route::delete('/{supplier}', 'destroy')->name('destroy');
});

/**
 * Supplier Verification Routes
 */
Route::prefix('supplier-verification')->name('supplier-verification.')->controller(SupplierVerificationController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/verified', 'verified')->name('verified');
  Route::get('/rejected', 'rejected')->name('rejected');
  Route::post('/bulk-verify', 'bulkVerify')->name('bulk-verify');
  Route::get('/{supplier}/verify', 'verify')->name('verify');
  Route::post('/{supplier}/approve', 'approve')->name('approve');
  Route::post('/{supplier}/reject', 'reject')->name('reject');
  Route::post('/{supplier}/request-documents', 'requestDocuments')->name('request-documents');
});

/**
 * Product Management Routes
 */
Route::prefix('products')->name('products.')->controller(ProductManagementController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/export', 'export')->name('export');
  Route::get('/statistics', 'statistics')->name('statistics');
  Route::post('/bulk-update', 'bulkUpdate')->name('bulk-update');
  Route::get('/{product}', 'show')->name('show');
  Route::get('/{product}/edit', 'edit')->name('edit');
  Route::put('/{product}', 'update')->name('update');
  Route::patch('/{product}/toggle-featured', 'toggleFeatured')->name('toggle-featured');
  Route::post('/{product}/update-stock', 'updateStock')->name('update-stock');
  Route::delete('/{product}', 'destroy')->name('destroy');
});

/**
 * Product Approval Routes
 */
Route::prefix('product-approval')->name('product-approval.')->controller(ProductApprovalController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/statistics', 'statistics')->name('statistics');
  Route::post('/bulk-approve', 'bulkApprove')->name('bulk-approve');
  Route::get('/{product}', 'show')->name('show');
  Route::post('/{product}/approve', 'approve')->name('approve');
  Route::post('/{product}/reject', 'reject')->name('reject');
});

/**
 * Order Management Routes
 */
Route::prefix('orders')->name('orders.')->controller(OrderManagementController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/export', 'export')->name('export');
  Route::get('/statistics', 'statistics')->name('statistics');
  Route::get('/supplier/{supplier}', 'supplierOrders')->name('supplier-orders');
  Route::get('/buyer/{buyer}', 'buyerOrders')->name('buyer-orders');

  Route::get('/{order}', 'show')->name('show');
  Route::post('/{order}/update-status', 'updateStatus')->name('update-status');
  Route::post('/{order}/update-payment', 'updatePayment')->name('update-payment');
  Route::post('/{order}/cancel', 'cancel')->name('cancel');
});

/**
 * RFQ Management Routes
 */
Route::prefix('rfqs')->name('rfqs.')->controller(RfqManagementController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/export', 'export')->name('export');
  Route::get('/statistics', 'statistics')->name('statistics');
  Route::get('/{rfq}', 'show')->name('show');
  Route::get('/{rfq}/quotes', 'quotes')->name('quotes');
  Route::post('/{rfq}/close', 'close')->name('close');
  Route::post('/{rfq}/reopen', 'reopen')->name('reopen');
  Route::delete('/{rfq}', 'destroy')->name('destroy');
});

/**
 * Report Routes
 */
Route::prefix('reports')->name('reports.')->controller(ReportController::class)->group(function () {
  Route::get('/sales', 'sales')->name('sales');
  Route::get('/suppliers', 'suppliers')->name('suppliers');
  Route::get('/buyers', 'buyers')->name('buyers');
  Route::get('/products', 'products')->name('products');
  Route::get('/rfqs', 'rfqs')->name('rfqs');
  Route::get('/financial', 'financial')->name('financial');
  Route::get('/export', 'export')->name('export');
});

/**
 * Optional: Dashboard redirect
 */
Route::get('/', function () {
  return redirect()->route('admin.dashboard');
})->name('home');
