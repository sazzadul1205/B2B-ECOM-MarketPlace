<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the supplier's company profile.
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        $user = Auth::user();

        // Load supplier profile with related data
        $supplier = $user->supplier;

        // If supplier profile doesn't exist, create an empty instance for the form
        if (!$supplier) {
            $supplier = new Supplier(['user_id' => $user->id]);
        }

        // Get profile completion percentage
        $profileCompletion = $this->calculateProfileCompletion($supplier);

        // Get recent products
        $recentProducts = Product::where('supplier_id', $supplier->id ?? 0)
            ->latest()
            ->take(5)
            ->get();

        // Get recent orders
        $recentOrders = Order::where('supplier_id', $user->id)
            ->with('buyer')
            ->latest()
            ->take(5)
            ->get();

        // Get statistics for the dashboard view
        $stats = [
            'total_products' => $supplier->id ? $supplier->products()->count() : 0,
            'active_products' => $supplier->id ? $supplier->products()->where('status', 'active')->count() : 0,
            'total_quotes' => $supplier->id ? $supplier->quotes()->count() : 0,
            'pending_quotes' => $supplier->id ? $supplier->quotes()->where('status', 'pending')->count() : 0,
            'accepted_quotes' => $supplier->id ? $supplier->quotes()->where('status', 'accepted')->count() : 0,
            'total_orders' => $supplier->id ? $supplier->orders()->count() : 0,
            'pending_orders' => $supplier->id ? $supplier->orders()->where('order_status', Order::STATUS_PENDING_CONFIRMATION)->count() : 0,
            'completed_orders' => $supplier->id ? $supplier->orders()->where('order_status', Order::STATUS_DELIVERED)->count() : 0,
            'total_revenue' => $supplier->id ? $supplier->orders()->where('order_status', Order::STATUS_DELIVERED)->sum('total_amount') : 0,
        ];

        return Inertia::render('Supplier/Profile/Index', compact(
            'user',
            'supplier',
            'stats',
            'recentProducts',
            'recentOrders',
            'profileCompletion'
        ));
    }

    /**
     * Show the form for editing the company profile.
     *
     * @return \Illuminate\View\View
     */
    public function edit()
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        // If supplier profile doesn't exist, create an empty instance
        if (!$supplier) {
            $supplier = new Supplier(['user_id' => $user->id]);
        }

        // Get countries list (you can move this to a config file)
        $countries = [
            'United States',
            'Canada',
            'United Kingdom',
            'Australia',
            'Germany',
            'France',
            'Japan',
            'China',
            'India',
            'Brazil',
            'Mexico',
            'Singapore',
            'Malaysia',
            'Indonesia',
            'Thailand',
            'Vietnam',
            'Philippines',
            'South Korea'
        ];

        // Get business types
        $businessTypes = [
            'Sole Proprietorship',
            'Partnership',
            'Limited Liability Company (LLC)',
            'Corporation',
            'Non-Profit Organization',
            'Government Entity',
            'Other'
        ];

        return Inertia::render('Supplier/Profile/Edit', compact('user', 'supplier', 'countries', 'businessTypes'));
    }

    /**
     * Update the company information.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Validate the request
        $validated = $this->validateProfile($request, $user);

        // Begin transaction
        DB::beginTransaction();

        try {
            // Update user information
            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
            ];

            // Update password if provided
            if (!empty($validated['new_password'])) {
                $userData['password'] = Hash::make($validated['new_password']);
            }

            $user->update($userData);

            // Prepare supplier data
            $supplierData = [
                'company_name' => $validated['company_name'],
                'trade_license_number' => $validated['trade_license_number'],
                'company_phone' => $validated['company_phone'],
                'company_email' => $validated['company_email'],
                'company_address' => $validated['company_address'],
                'city' => $validated['city'],
                'state' => $validated['state'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
                'country' => $validated['country'] ?? null,
                'business_type' => $validated['business_type'] ?? null,
                'year_established' => $validated['year_established'] ?? null,
                'number_of_employees' => $validated['number_of_employees'] ?? null,
                'annual_revenue' => $validated['annual_revenue'] ?? null,
                'website' => $validated['website'] ?? null,
                'description' => $validated['description'] ?? null,
                'tax_id' => $validated['tax_id'] ?? null,
            ];

            // Handle logo upload
            if ($request->hasFile('logo')) {
                $supplierData['logo'] = $this->uploadLogo($request->file('logo'), $user->supplier);
            }

            // Handle company documents
            if ($request->hasFile('trade_license_document')) {
                $supplierData['trade_license_document'] = $this->uploadDocument(
                    $request->file('trade_license_document'),
                    'trade_licenses',
                    $user->supplier
                );
            }

            if ($request->hasFile('certificate_of_incorporation')) {
                $supplierData['certificate_of_incorporation'] = $this->uploadDocument(
                    $request->file('certificate_of_incorporation'),
                    'certificates',
                    $user->supplier
                );
            }

            // Update or create supplier profile
            if ($user->supplier) {
                $user->supplier->update($supplierData);
                $message = 'Profile updated successfully.';
            } else {
                $supplierData['user_id'] = $user->id;
                $supplierData['verification_status'] = 'pending'; // New suppliers start as pending
                Supplier::create($supplierData);
                $message = 'Profile created successfully. Please wait for verification.';
            }

            DB::commit();

            return redirect()
                ->route('supplier.profile.index')
                ->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update profile. Please try again. Error: ' . $e->getMessage());
        }
    }

    /**
     * Display the public supplier profile.
     *
     * @param  string  $companyName
     * @param  int|null  $supplierId
     * @return \Illuminate\View\View
     */
    public function show($companyName = null, $supplierId = null)
    {
        // Find supplier by ID or company name
        if ($supplierId) {
            $supplier = Supplier::with(['user', 'products' => function ($query) {
                $query->where('status', 'active')
                    ->with('bulkPrices');
            }])
                ->where('verification_status', 'verified')
                ->findOrFail($supplierId);
        } else {
            // Convert URL-friendly company name back to original format
            $companyName = str_replace('-', ' ', $companyName);

            $supplier = Supplier::with(['user', 'products' => function ($query) {
                $query->where('status', 'active')
                    ->with('bulkPrices');
            }])
                ->where('company_name', $companyName)
                ->where('verification_status', 'verified')
                ->firstOrFail();
        }

        // Check if supplier is verified
        if (!$supplier->isVerified()) {
            abort(404, 'Supplier profile not available.');
        }

        // Get additional supplier data
        $stats = [
            'total_products' => $supplier->products()->where('status', 'active')->count(),
            'total_orders' => $supplier->orders()->count(),
            'completed_orders' => $supplier->orders()
                ->where('order_status', Order::STATUS_DELIVERED)
                ->count(),
            'member_since' => $supplier->created_at->format('F Y'),
            'response_time' => $this->calculateAverageResponseTime($supplier),
            'verified_since' => $supplier->updated_at->format('F Y'), // When verification was completed
        ];

        // Get recent products
        $recentProducts = $supplier->products()
            ->where('status', 'active')
            ->latest()
            ->take(8)
            ->get();

        // Get product categories
        $categories = $supplier->products()
            ->where('status', 'active')
            ->distinct('category')
            ->pluck('category');

        // Get reviews/ratings (if you have a reviews table)
        $averageRating = $this->getAverageRating($supplier);
        $totalReviews = $this->getTotalReviews($supplier);

        return Inertia::render('Supplier/Profile/Show', compact(
            'supplier',
            'stats',
            'recentProducts',
            'categories',
            'averageRating',
            'totalReviews'
        ));
    }

    /**
     * Validate profile update request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return array
     */
    private function validateProfile(Request $request, $user)
    {
        $rules = [
            // User information
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'current_password' => 'nullable|required_with:new_password|current_password',
            'new_password' => 'nullable|min:8|confirmed',

            // Supplier information
            'company_name' => 'required|string|max:255',
            'trade_license_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('suppliers')->ignore($user->supplier?->id),
            ],
            'company_phone' => 'required|string|max:20',
            'company_email' => 'required|email|max:255',
            'company_address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'business_type' => 'nullable|string|max:100',
            'year_established' => 'nullable|integer|min:1800|max:' . date('Y'),
            'number_of_employees' => 'nullable|integer|min:1',
            'annual_revenue' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string|max:2000',
            'tax_id' => 'nullable|string|max:100',

            // File uploads
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'trade_license_document' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
            'certificate_of_incorporation' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
        ];

        return $request->validate($rules);
    }

    /**
     * Upload company logo.
     *
     * @param  \Illuminate\Http\UploadedFile  $file
     * @param  \App\Models\Supplier|null  $supplier
     * @return string
     */
    private function uploadLogo($file, $supplier = null)
    {
        // Delete old logo if exists
        if ($supplier && $supplier->logo) {
            Storage::disk('public')->delete($supplier->logo);
        }

        $fileName = 'logo_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        return $file->storeAs('supplier/logos', $fileName, 'public');
    }

    /**
     * Upload company document.
     *
     * @param  \Illuminate\Http\UploadedFile  $file
     * @param  string  $folder
     * @param  \App\Models\Supplier|null  $supplier
     * @return string
     */
    private function uploadDocument($file, $folder, $supplier = null)
    {
        // Map folder to supplier field
        $fieldMap = [
            'trade_licenses' => 'trade_license_document',
            'certificates' => 'certificate_of_incorporation',
        ];

        // Delete old document if exists
        if ($supplier && isset($fieldMap[$folder]) && $supplier->{$fieldMap[$folder]}) {
            Storage::disk('public')->delete($supplier->{$fieldMap[$folder]});
        }

        $fileName = $folder . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        return $file->storeAs('supplier/documents/' . $folder, $fileName, 'public');
    }

    /**
     * Calculate profile completion percentage.
     *
     * @param  \App\Models\Supplier  $supplier
     * @return int
     */
    private function calculateProfileCompletion($supplier)
    {
        if (!$supplier->id) {
            return 0;
        }

        $fields = [
            'company_name' => 10,
            'trade_license_number' => 15,
            'company_phone' => 5,
            'company_email' => 5,
            'company_address' => 10,
            'city' => 5,
            'state' => 5,
            'postal_code' => 5,
            'country' => 5,
            'business_type' => 5,
            'year_established' => 5,
            'number_of_employees' => 5,
            'description' => 10,
            'logo' => 5,
            'trade_license_document' => 5,
        ];

        $completion = 0;
        foreach ($fields as $field => $weight) {
            if (!empty($supplier->$field)) {
                $completion += $weight;
            }
        }

        // Add verification status weight
        if ($supplier->verification_status === 'verified') {
            $completion += 5;
        } elseif ($supplier->verification_status === 'pending') {
            $completion += 2;
        }

        return min($completion, 100);
    }

    /**
     * Calculate average response time for quotes.
     *
     * @param  \App\Models\Supplier  $supplier
     * @return string
     */
    private function calculateAverageResponseTime($supplier)
    {
        $quotes = $supplier->quotes()
            ->with('rfq')
            ->whereHas('rfq')
            ->get();

        if ($quotes->isEmpty()) {
            return 'N/A';
        }

        $totalHours = $quotes->sum(function ($quote) {
            return $quote->created_at->diffInHours($quote->rfq->created_at);
        });

        $avgHours = round($totalHours / $quotes->count());

        if ($avgHours < 24) {
            return $avgHours . ' hours';
        } elseif ($avgHours < 168) {
            return round($avgHours / 24) . ' days';
        } else {
            return round($avgHours / 168) . ' weeks';
        }
    }

    /**
     * Get average rating for supplier.
     *
     * @param  \App\Models\Supplier  $supplier
     * @return float
     */
    private function getAverageRating($supplier)
    {
        // If you have a reviews table, implement this
        // For now, return a default or random value
        return 4.5; // Placeholder
    }

    /**
     * Get total reviews for supplier.
     *
     * @param  \App\Models\Supplier  $supplier
     * @return int
     */
    private function getTotalReviews($supplier)
    {
        // If you have a reviews table, implement this
        // For now, return a default value
        return 42; // Placeholder
    }

    /**
     * Get profile completion percentage (API endpoint).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProfileCompletion()
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        $completion = $this->calculateProfileCompletion($supplier);

        return response()->json([
            'completion' => $completion,
            'is_verified' => $supplier ? $supplier->isVerified() : false,
            'verification_status' => $supplier ? $supplier->verification_status : 'not_started',
        ]);
    }

    /**
     * Update notification settings.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function notificationSettings(Request $request)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        if (!$supplier) {
            return redirect()->back()->with('error', 'Supplier profile not found.');
        }

        $validated = $request->validate([
            'email_notifications' => 'boolean',
            'order_notifications' => 'boolean',
            'quote_notifications' => 'boolean',
            'message_notifications' => 'boolean',
            'marketing_emails' => 'boolean',
        ]);

        // Assuming you have a notification_settings JSON column
        $supplier->notification_settings = $validated;
        $supplier->save();

        return redirect()
            ->back()
            ->with('success', 'Notification settings updated successfully.');
    }

    /**
     * Update shipping settings.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function shippingSettings(Request $request)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        if (!$supplier) {
            return redirect()->back()->with('error', 'Supplier profile not found.');
        }

        $validated = $request->validate([
            'default_shipping_method' => 'nullable|string|max:100',
            'shipping_zones' => 'nullable|array',
            'free_shipping_threshold' => 'nullable|numeric|min:0',
            'handling_time' => 'nullable|integer|min:1|max:30',
        ]);

        // Assuming you have a shipping_settings JSON column
        $supplier->shipping_settings = $validated;
        $supplier->save();

        return redirect()
            ->back()
            ->with('success', 'Shipping settings updated successfully.');
    }

    /**
     * Update payment settings.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function paymentSettings(Request $request)
    {
        $user = Auth::user();
        $supplier = $user->supplier;

        if (!$supplier) {
            return redirect()->back()->with('error', 'Supplier profile not found.');
        }

        $validated = $request->validate([
            'bank_name' => 'required|string|max:255',
            'account_holder_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'iban' => 'nullable|string|max:34',
            'swift_code' => 'nullable|string|max:11',
            'routing_number' => 'nullable|string|max:20',
            'payment_terms' => 'nullable|string|max:500',
        ]);

        // Store bank details (encrypt sensitive data)
        $supplier->bank_details = encrypt(json_encode([
            'bank_name' => $validated['bank_name'],
            'account_holder_name' => $validated['account_holder_name'],
            'account_number' => $validated['account_number'],
            'iban' => $validated['iban'] ?? null,
            'swift_code' => $validated['swift_code'] ?? null,
            'routing_number' => $validated['routing_number'] ?? null,
        ]));

        $supplier->payment_terms = $validated['payment_terms'] ?? null;
        $supplier->save();

        return redirect()
            ->back()
            ->with('success', 'Payment settings updated successfully.');
    }
}
