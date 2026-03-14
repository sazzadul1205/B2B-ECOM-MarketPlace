<?php
// routes/buyer.php

use App\Http\Controllers\Buyer\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Buyer\ProductController;
use App\Http\Controllers\Buyer\RfqController;
use App\Http\Controllers\Buyer\QuoteController;
use App\Http\Controllers\Buyer\OrderController;
use App\Http\Controllers\Buyer\MessageController;
use App\Http\Controllers\Buyer\SupplierController;
use App\Http\Controllers\Buyer\CartController;
use Illuminate\Support\Facades\Route;

// Buyer routes are wrapped by the group in routes/web.php (prefix + middleware)

/**
 * Dashboard Routes
 */
Route::controller(DashboardController::class)->group(function () {
  Route::get('/dashboard', 'index')->name('dashboard');
  Route::get('/summary', 'summary')->name('summary');
  Route::get('/quick-stats', 'quickStats')->name('quick-stats');
  Route::get('/recent-activity', 'recentActivity')->name('recent-activity');
});

/**
 * Profile Routes
 */
Route::prefix('profile')->name('profile.')->controller(ProfileController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/edit', 'edit')->name('edit');
  Route::put('/', 'update')->name('update');
  Route::post('/avatar', 'updateAvatar')->name('update-avatar');
  Route::post('/change-password', 'changePassword')->name('change-password');
  Route::get('/settings', 'settings')->name('settings');
  Route::post('/settings/notifications', 'updateNotificationSettings')->name('update-notifications');
  Route::post('/settings/shipping', 'updateShippingDefaults')->name('update-shipping');
  Route::get('/completion', 'getProfileCompletion')->name('completion');
});

/**
 * Product Browsing Routes (Public)
 */
Route::prefix('products')->name('products.')->controller(ProductController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/search', 'search')->name('search');
  Route::get('/featured', 'featured')->name('featured');
  Route::get('/category/{category}', 'byCategory')->name('by-category');
  Route::get('/supplier/{supplierId}', 'supplierProducts')->name('supplier-products');
  Route::get('/{slug}', 'show')->name('show');
  Route::post('/get-bulk-price', 'getBulkPrice')->name('get-bulk-price');
  Route::get('/quick-view/{id}', 'quickView')->name('quick-view');
});

/**
 * RFQ Management Routes
 */
Route::prefix('rfqs')->name('rfqs.')->controller(RfqController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/create', 'create')->name('create');
  Route::post('/', 'store')->name('store');
  Route::get('/statistics', 'statistics')->name('statistics');
  Route::get('/export', 'export')->name('export');

  // RFQ status filters
  Route::get('/open', 'open')->name('open');
  Route::get('/quoted', 'quoted')->name('quoted');
  Route::get('/closed', 'closed')->name('closed');
  Route::get('/cancelled', 'cancelled')->name('cancelled');

  // Single RFQ
  Route::get('/{rfq}', 'show')->name('show');
  Route::get('/{rfq}/edit', 'edit')->name('edit');
  Route::put('/{rfq}', 'update')->name('update');
  Route::delete('/{rfq}', 'destroy')->name('destroy');
  Route::post('/{rfq}/cancel', 'cancel')->name('cancel');
  Route::post('/{rfq}/reopen', 'reopen')->name('reopen');
  Route::get('/{rfq}/track-status', 'trackStatus')->name('track-status');

  // Quote actions within RFQ
  Route::post('/{rfq}/quotes/{quote}/accept', 'acceptQuote')->name('accept-quote');
  Route::post('/{rfq}/quotes/{quote}/reject', 'rejectQuote')->name('reject-quote');
  Route::post('/{rfq}/quotes/{quote}/ask-question', 'askQuestion')->name('ask-question');
});

/**
 * Quote Management Routes
 */
Route::prefix('quotes')->name('quotes.')->controller(QuoteController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/statistics', 'statistics')->name('statistics');
  Route::get('/export', 'export')->name('export');
  Route::post('/compare', 'compare')->name('compare');

  // Quote status filters
  Route::get('/pending', 'pending')->name('pending');
  Route::get('/accepted', 'accepted')->name('accepted');
  Route::get('/rejected', 'rejected')->name('rejected');
  Route::get('/expired', 'expired')->name('expired');

  // Single quote
  Route::get('/{quote}', 'show')->name('show');
  Route::get('/{quote}/accept', 'acceptConfirm')->name('accept-confirm');
  Route::post('/{quote}/accept', 'accept')->name('accept');
  Route::get('/{quote}/reject', 'rejectConfirm')->name('reject-confirm');
  Route::post('/{quote}/reject', 'reject')->name('reject');
  Route::get('/{quote}/quick-view', 'quickView')->name('quick-view');
  Route::get('/{quote}/download-pdf', 'downloadPdf')->name('download-pdf');
  Route::post('/{quote}/ask-for-revision', 'askForRevision')->name('ask-for-revision');
});

/**
 * Order Management Routes
 */
Route::prefix('orders')->name('orders.')->controller(OrderController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/statistics', 'statistics')->name('statistics');
  Route::get('/export', 'export')->name('export');

  // Order status filters
  Route::get('/pending', 'pending')->name('pending');
  Route::get('/processing', 'processing')->name('processing');
  Route::get('/shipped', 'shipped')->name('shipped');
  Route::get('/delivered', 'delivered')->name('delivered');
  Route::get('/cancelled', 'cancelled')->name('cancelled');
  Route::post('/order-now', 'orderNow')->name('order-now');


  // Create order from RFQ/quote
  Route::get('/create-from-rfq/{rfq}/{quote}', 'createFromRfq')->name('create-from-rfq');
  Route::get('/confirm/{rfq}/{quote}', 'confirm')->name('confirm');
  Route::post('/store-from-quote', 'store')->name('store-from-quote');

  // Single order
  Route::get('/{order}', 'show')->name('show');
  Route::post('/{order}/pay', 'markAsPaid')->name('pay');
  Route::post('/{order}/cancel', 'cancel')->name('cancel');
  Route::post('/{order}/mark-received', 'markAsReceived')->name('mark-received');
  Route::get('/{order}/track', 'track')->name('track');
  Route::get('/{order}/invoice', 'invoice')->name('invoice');
  Route::get('/{order}/download-invoice', 'downloadInvoice')->name('download-invoice');
  Route::post('/{order}/request-cancellation', 'requestCancellation')->name('request-cancellation');
  Route::post('/{order}/request-return', 'requestReturn')->name('request-return');
});

/**
 * Shopping Cart Routes
 */
Route::prefix('cart')->name('cart.')->controller(CartController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::post('/add', 'add')->name('add');
  Route::post('/update/{item}', 'update')->name('update');
  Route::delete('/remove/{item}', 'remove')->name('remove');
  Route::post('/clear', 'clear')->name('clear');
  Route::post('/apply-coupon', 'applyCoupon')->name('apply-coupon');
  Route::post('/remove-coupon', 'removeCoupon')->name('remove-coupon');
  Route::post('/update-shipping', 'updateShipping')->name('update-shipping');
  Route::get('/count', 'getCount')->name('count');
  Route::get('/mini-cart', 'getMiniCart')->name('mini-cart');
  Route::post('/save-for-later/{item}', 'saveForLater')->name('save-for-later');
  Route::post('/move-to-cart/{item}', 'moveToCart')->name('move-to-cart');
});

/**
 * Supplier Management (Saved/Followed Suppliers)
 */
Route::prefix('suppliers')->name('suppliers.')->controller(SupplierController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/featured', 'featured')->name('featured');
  Route::get('/search', 'search')->name('search');
  Route::get('/by-category/{category}', 'byCategory')->name('by-category');
  Route::get('/statistics', 'statistics')->name('statistics');

  // Supplier profile
  Route::get('/{user}', 'show')->name('show');
  Route::get('/{user}/products', 'getProducts')->name('products');
  Route::get('/{user}/reviews', 'getReviews')->name('reviews');

  // Follow/Unfollow actions
  Route::post('/{supplier}/save', 'save')->name('save');
  Route::post('/{supplier}/unsave', 'unsave')->name('unsave');
  Route::post('/toggle-save', 'toggleSave')->name('toggle-save');

  // Saved suppliers list
  Route::get('/saved/list', 'savedList')->name('saved-list');
  Route::post('/saved/export', 'exportSaved')->name('export-saved');
});

/**
 * Message Routes
 */
Route::prefix('messages')->name('messages.')->controller(MessageController::class)->group(function () {
  Route::get('/', 'index')->name('index');
  Route::get('/conversations', 'getConversations')->name('conversations');
  Route::post('/', 'store')->name('store');
  Route::post('/reply', 'reply')->name('reply');
  Route::post('/send', 'send')->name('send');

  // Conversation with specific user
  Route::get('/with/{user}', 'conversation')->name('with');
  Route::get('/with/{user}/{rfq}', 'conversation')->name('with-rfq');
  Route::post('/with/{user}/send', 'sendToUser')->name('send-to-user');

  // RFQ specific messages
  Route::get('/rfq/{rfq}', 'rfqMessages')->name('rfq');
  Route::post('/rfq/{rfq}/send', 'sendRfqMessage')->name('send-rfq');

  // Message actions
  Route::post('/mark-read', 'markAsRead')->name('mark-read');
  Route::post('/mark-conversation-read', 'markConversationAsRead')->name('mark-conversation-read');
  Route::post('/mark-all-read', 'markAllAsRead')->name('mark-all-read');
  Route::get('/unread-count', 'unreadCount')->name('unread-count');
  Route::get('/recent', 'recent')->name('recent');
  Route::get('/search', 'search')->name('search');
  Route::delete('/conversation', 'deleteConversation')->name('delete-conversation');
  Route::delete('/{message}', 'destroy')->name('destroy');

  // API endpoints for real-time features
  Route::get('/poll', 'poll')->name('poll');
});

/**
 * API-like routes for AJAX requests
 */
Route::prefix('api')->name('api.')->group(function () {
  // Quick actions
  Route::post('/quotes/{quote}/quick-response', [QuoteController::class, 'quickResponse'])->name('quotes.quick-response');
  Route::post('/orders/{order}/quick-action', [OrderController::class, 'quickAction'])->name('orders.quick-action');
  Route::post('/rfqs/{rfq}/quick-update', [RfqController::class, 'quickUpdate'])->name('rfqs.quick-update');

  // Data tables
  Route::get('/datatable/rfqs', [RfqController::class, 'datatable'])->name('datatable.rfqs');
  Route::get('/datatable/quotes', [QuoteController::class, 'datatable'])->name('datatable.quotes');
  Route::get('/datatable/orders', [OrderController::class, 'datatable'])->name('datatable.orders');
  Route::get('/datatable/suppliers', [SupplierController::class, 'datatable'])->name('datatable.suppliers');
  Route::get('/datatable/messages', [MessageController::class, 'datatable'])->name('datatable.messages');

  // Autocomplete
  Route::get('/autocomplete/products', [ProductController::class, 'autocomplete'])->name('autocomplete.products');
  Route::get('/autocomplete/suppliers', [SupplierController::class, 'autocomplete'])->name('autocomplete.suppliers');
});

/**
 * Dashboard redirect
 */
Route::get('/', function () {
  return redirect()->route('buyer.dashboard');
})->name('home');

/**
 * Settings Routes
 */
Route::prefix('settings')->name('settings.')->group(function () {
  Route::get('/notifications', [ProfileController::class, 'notificationSettings'])->name('notifications');
  Route::post('/notifications', [ProfileController::class, 'updateNotificationSettings'])->name('update-notifications');
  Route::get('/shipping', [ProfileController::class, 'shippingAddresses'])->name('shipping');
  Route::post('/shipping', [ProfileController::class, 'addShippingAddress'])->name('add-shipping');
  Route::put('/shipping/{address}', [ProfileController::class, 'updateShippingAddress'])->name('update-shipping');
  Route::delete('/shipping/{address}', [ProfileController::class, 'deleteShippingAddress'])->name('delete-shipping');
  Route::patch('/shipping/{address}/default', [ProfileController::class, 'setDefaultAddress'])->name('default-shipping');
  Route::get('/payment', [ProfileController::class, 'paymentMethods'])->name('payment');
  Route::post('/payment', [ProfileController::class, 'addPaymentMethod'])->name('add-payment');
  Route::delete('/payment/{method}', [ProfileController::class, 'deletePaymentMethod'])->name('delete-payment');
  Route::get('/privacy', [ProfileController::class, 'privacySettings'])->name('privacy');
  Route::post('/privacy', [ProfileController::class, 'updatePrivacySettings'])->name('update-privacy');
});

/**
 * Bulk Operations Routes
 */
Route::prefix('bulk')->name('bulk.')->group(function () {
  Route::post('/rfqs/delete', [RfqController::class, 'bulkDelete'])->name('rfqs.delete');
  Route::post('/rfqs/close', [RfqController::class, 'bulkClose'])->name('rfqs.close');
  Route::post('/quotes/compare-selected', [QuoteController::class, 'bulkCompare'])->name('quotes.compare-selected');
  Route::post('/quotes/export-selected', [QuoteController::class, 'bulkExport'])->name('quotes.export-selected');
  Route::post('/messages/mark-read', [MessageController::class, 'bulkMarkRead'])->name('messages.mark-read');
  Route::post('/messages/delete', [MessageController::class, 'bulkDelete'])->name('messages.delete');
  Route::post('/suppliers/follow', [SupplierController::class, 'bulkFollow'])->name('suppliers.follow');
  Route::post('/suppliers/unfollow', [SupplierController::class, 'bulkUnfollow'])->name('suppliers.unfollow');
});

/**
 * Import/Export Routes
 */
Route::prefix('import-export')->name('import-export.')->group(function () {
  // Export functionality is already covered in individual controllers
  // Import for specific features
  Route::post('/rfqs/import', [RfqController::class, 'import'])->name('rfqs.import');
  Route::get('/rfqs/template', [RfqController::class, 'downloadTemplate'])->name('rfqs.template');
  Route::post('/saved-suppliers/import', [SupplierController::class, 'importSaved'])->name('saved-suppliers.import');
  Route::get('/saved-suppliers/template', [SupplierController::class, 'downloadTemplate'])->name('saved-suppliers.template');
});

/**
 * Notification Routes
 */
Route::prefix('notifications')->name('notifications.')->group(function () {
  Route::get('/', [DashboardController::class, 'notifications'])->name('index');
  Route::post('/{id}/read', [DashboardController::class, 'markNotificationRead'])->name('read');
  Route::post('/read-all', [DashboardController::class, 'markAllNotificationsRead'])->name('read-all');
  Route::delete('/{id}', [DashboardController::class, 'deleteNotification'])->name('delete');
  Route::get('/unread-count', [DashboardController::class, 'unreadNotificationCount'])->name('unread-count');
});

/**
 * Search Routes
 */
Route::prefix('search')->name('search.')->group(function () {
  Route::get('/advanced', [ProductController::class, 'advancedSearch'])->name('advanced');
  Route::get('/saved-searches', [ProfileController::class, 'savedSearches'])->name('saved');
  Route::post('/save-search', [ProfileController::class, 'saveSearch'])->name('save');
  Route::delete('/saved-search/{search}', [ProfileController::class, 'deleteSavedSearch'])->name('delete-saved');
});

/**
 * Support & Help Routes
 */
Route::prefix('support')->name('support.')->group(function () {
  Route::get('/faq', function () {
    return view('buyer.support.faq');
  })->name('faq');
  Route::get('/contact', function () {
    return view('buyer.support.contact');
  })->name('contact');
  Route::post('/contact', [ProfileController::class, 'submitSupportTicket'])->name('submit-ticket');
  Route::get('/tickets', [ProfileController::class, 'supportTickets'])->name('tickets');
  Route::get('/tickets/{ticket}', [ProfileController::class, 'viewTicket'])->name('view-ticket');
  Route::post('/tickets/{ticket}/reply', [ProfileController::class, 'replyTicket'])->name('reply-ticket');
});
