<?php
// app/Http/Controllers/Admin/UserManagementController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserManagementController extends Controller
{
    /**
     * Display a listing of all users.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter by active status
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active === 'true');
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sort
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $users = $query->paginate(15)
            ->appends($request->query());

        // Get statistics
        $stats = [
            'total' => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'suppliers' => User::where('role', 'supplier')->count(),
            'buyers' => User::where('role', 'buyer')->count(),
            'active' => User::where('is_active', true)->count(),
            'inactive' => User::where('is_active', false)->count(),
            'new_today' => User::whereDate('created_at', today())->count(),
            'new_this_week' => User::where('created_at', '>=', now()->startOfWeek())->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => $request->only([
                'search',
                'role',
                'is_active',
                'date_from',
                'date_to',
                'sort_field',
                'sort_direction'
            ]),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:admin,supplier,buyer',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'is_active' => $request->is_active ?? true,
            ]);

            // If role is supplier, redirect to create supplier profile
            if ($request->role === 'supplier') {
                return redirect()->route('admin.users.create-supplier', $user->id)
                    ->with('info', 'User created. Please complete supplier profile.');
            }
        });

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $user = User::with(['supplier', 'rfqs', 'quotes', 'ordersAsBuyer', 'ordersAsSupplier'])
            ->findOrFail($id);

        $activity = [
            'rfqs_count' => $user->rfqs()->count(),
            'quotes_count' => $user->quotes()->count(),
            'orders_as_buyer' => $user->ordersAsBuyer()->count(),
            'orders_as_supplier' => $user->ordersAsSupplier()->count(),
            'total_spent' => $user->ordersAsBuyer()->where('payment_status', 'paid')->sum('total_amount'),
            'total_earned' => $user->ordersAsSupplier()->where('payment_status', 'paid')->sum('total_amount'),
            'last_login' => $user->last_login_at,
            'joined_at' => $user->created_at->format('Y-m-d H:i:s'),
        ];

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'activity' => $activity,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit($id)
    {
        $user = User::findOrFail($id);

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'role' => 'required|in:admin,supplier,buyer',
            'is_active' => 'boolean',
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'is_active' => $request->is_active,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        // If role changed to/from supplier, handle supplier profile
        if ($user->wasChanged('role')) {
            $this->handleRoleChange($user, $request->role);
        }

        return redirect()->route('admin.users.show', $user->id)
            ->with('success', 'User updated successfully.');
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);

        $user->update([
            'is_active' => !$user->is_active
        ]);

        $status = $user->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "User {$status} successfully.");
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::findOrFail($id);

        $user->update([
            'password' => Hash::make($request->password),
            'password_reset_at' => now(),
            'password_reset_by' => auth()->id(),
        ]);

        // Send password reset notification
        // Mail::to($user->email)->send(new PasswordResetByAdminMail($user, $request->password));

        return back()->with('success', 'Password has been reset successfully.');
    }

    /**
     * Delete user.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Check for related data
        $hasRelations = false;
        $relationMessage = '';

        if ($user->supplier()->exists()) {
            $hasRelations = true;
            $relationMessage = 'supplier profile';
        } elseif ($user->rfqs()->exists()) {
            $hasRelations = true;
            $relationMessage = 'RFQs';
        } elseif ($user->ordersAsBuyer()->exists() || $user->ordersAsSupplier()->exists()) {
            $hasRelations = true;
            $relationMessage = 'orders';
        }

        if ($hasRelations) {
            return back()->withErrors([
                'error' => "Cannot delete user with existing {$relationMessage}. Consider deactivating instead."
            ]);
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Show form to create supplier profile.
     */
    public function createSupplier($userId)
    {
        $user = User::findOrFail($userId);

        return Inertia::render('Admin/Users/CreateSupplier', [
            'user' => $user,
        ]);
    }

    /**
     * Store supplier profile.
     */
    public function storeSupplier(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        $request->validate([
            'company_name' => 'required|string|max:255',
            'trade_license_number' => 'required|string|max:255|unique:suppliers',
            'company_phone' => 'required|string|max:20',
            'company_email' => 'required|email|max:255|unique:suppliers',
            'company_address' => 'required|string',
            'city' => 'required|string|max:100',
        ]);

        Supplier::create([
            'user_id' => $user->id,
            'company_name' => $request->company_name,
            'trade_license_number' => $request->trade_license_number,
            'company_phone' => $request->company_phone,
            'company_email' => $request->company_email,
            'company_address' => $request->company_address,
            'city' => $request->city,
            'verification_status' => 'verified', // Auto-verify when created by admin
        ]);

        return redirect()->route('admin.users.show', $user->id)
            ->with('success', 'Supplier profile created successfully.');
    }

    /**
     * Export users.
     */
    public function export(Request $request)
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->get();

        $csvData = [];
        $csvData[] = ['ID', 'Name', 'Email', 'Role', 'Status', 'Created At'];

        foreach ($users as $user) {
            $csvData[] = [
                $user->id,
                $user->name,
                $user->email,
                ucfirst($user->role),
                $user->is_active ? 'Active' : 'Inactive',
                $user->created_at->format('Y-m-d H:i:s'),
            ];
        }

        $filename = 'users-' . date('Y-m-d') . '.csv';
        $handle = fopen('php://temp', 'w');

        foreach ($csvData as $row) {
            fputcsv($handle, $row);
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Private helper methods
     */
    private function handleRoleChange($user, $newRole)
    {
        if ($newRole === 'supplier' && !$user->supplier) {
            // Redirect to create supplier profile
            session()->flash('info', 'Please complete the supplier profile.');
        } elseif ($newRole !== 'supplier' && $user->supplier) {
            // Delete supplier profile if role changed from supplier
            $user->supplier()->delete();
        }
    }
}
