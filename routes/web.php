<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\RegisteredUserController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Home route
Route::get('/', [HomeController::class, 'index'])->name('home');

// Waiting page route (accessible to authenticated users with pending approval)
Route::middleware('auth')->group(function () {

    // Waiting page route
    Route::get('/waiting', [RegisteredUserController::class, 'waiting'])
        ->name('waiting.page');

    // Mock email route
    Route::post('/mock-email', [RegisteredUserController::class, 'sendMockEmail'])
        ->name('mock.email.send');
});

Route::middleware('auth')->group(function () {

    // Dashboard route
    Route::get('/dashboard', function () {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        // Check if user is active
        if (!$user->is_active) {
            return redirect()->route('waiting.page');
        }

        // If user is admin, redirect to admin dashboard
        if ($user && $user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        // If user is buyer, redirect to buyer dashboard
        if ($user && $user->isBuyer()) {
            return redirect()->route('buyer.dashboard');
        }

        // If user is supplier, redirect to supplier dashboard
        if ($user && $user->isSupplier()) {
            return redirect()->route('supplier.dashboard');
        }

        // If user is not admin, buyer, or supplier, redirect to dashboard
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile routes
    Route::get('/profile', function () {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        // Check if user is active
        if (!$user->is_active) {
            return redirect()->route('auth.waiting.page');
        }

        // If user is supplier, redirect to supplier profile
        if ($user && $user->isSupplier()) {
            return redirect()->route('supplier.profile.edit');
        }

        // Otherwise, redirect to buyer profile
        return app(ProfileController::class)->edit(request());
    })->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
});

Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(base_path('routes/admin.php'));

Route::middleware(['auth', 'buyer'])
    ->prefix('buyer')
    ->name('buyer.')
    ->group(base_path('routes/buyer.php'));

Route::middleware(['auth', 'supplier'])
    ->prefix('supplier')
    ->name('supplier.')
    ->group(base_path('routes/supplier.php'));

require __DIR__ . '/auth.php';
