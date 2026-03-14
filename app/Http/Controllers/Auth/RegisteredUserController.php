<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Supplier;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Base validation for all users
        $baseRules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:buyer,supplier',
        ];

        // Additional validation for suppliers
        $supplierRules = [];
        if ($request->role === 'supplier') {
            $supplierRules = [
                'company_name' => 'required|string|max:255',
                'trade_license_number' => 'required|string|max:255|unique:suppliers,trade_license_number',
                'company_phone' => 'required|string|max:20',
                'company_email' => 'required|string|email|max:255|unique:suppliers,company_email',
                'company_address' => 'required|string',
                'city' => 'required|string|max:100',
            ];
        }

        // Validate the request
        $validated = $request->validate(array_merge($baseRules, $supplierRules));

        // Use transaction to ensure both user and supplier are created or none
        try {
            DB::beginTransaction();

            // Create the user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'is_active' => false, // Default to inactive until approved
            ]);

            // If supplier, create supplier record
            if ($request->role === 'supplier') {
                Supplier::create([
                    'user_id' => $user->id,
                    'company_name' => $request->company_name,
                    'trade_license_number' => $request->trade_license_number,
                    'company_phone' => $request->company_phone,
                    'company_email' => $request->company_email,
                    'company_address' => $request->company_address,
                    'city' => $request->city,
                    'verification_status' => 'pending', // Default to pending
                ]);
            }

            DB::commit();

            event(new Registered($user));

            // Log the user in
            Auth::login($user);

            // Redirect all new users to the waiting page
            return redirect()->route('waiting.page');
        } catch (\Exception $e) {
            DB::rollBack();

            // Log the error for debugging
            Log::error('Registration failed: ' . $e->getMessage());

            // Redirect back with error message
            return back()->withErrors([
                'error' => 'Registration failed. Please try again or contact support.'
            ])->withInput();
        }
    }

    /**
     * Show the waiting page
     */
    public function waiting(): Response
    {
        return Inertia::render('Auth/WaitingPage', [
            'user' => Auth::user(),
            'supplier' => Auth::user()->role === 'supplier' ? Auth::user()->supplier : null
        ]);
    }

    /**
     * Handle mock email sending
     */
    public function sendMockEmail(Request $request): RedirectResponse
    {
        // This is a mock endpoint for the demo email functionality
        // In a real application, you would send an actual email here

        // You can store the message in session to display in the waiting page
        session()->flash('mock_email_sent', true);

        return back();
    }
}
