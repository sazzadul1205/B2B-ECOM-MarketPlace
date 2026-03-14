<?php
// app/Http/Controllers/Admin/SupplierManagementController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SupplierManagementController extends Controller
{
    /**
     * Display a listing of all suppliers.
     */
    public function index(Request $request)
    {
        $query = Supplier::with(['user' => function ($q) {
            $q->select('id', 'name', 'email', 'is_active');
        }])
            ->withCount(['products' => function ($q) {
                $q->where('status', 'approved');
            }]);

        // Filter by verification status
        if ($request->filled('verification_status')) {
            $query->where('verification_status', $request->verification_status);
        }

        // Filter by city
        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        // Search by company name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('company_email', 'like', "%{$search}%")
                    ->orWhere('trade_license_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Sort
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $suppliers = $query->paginate(15)
            ->appends($request->query());

        // Get statistics for the header
        $stats = [
            'total' => Supplier::count(),
            'pending' => Supplier::where('verification_status', 'pending')->count(),
            'verified' => Supplier::where('verification_status', 'verified')->count(),
            'rejected' => Supplier::where('verification_status', 'rejected')->count(),
        ];

        // Get unique cities for filter
        $cities = Supplier::distinct()->pluck('city');

        return Inertia::render('Admin/Suppliers/Index', [
            'suppliers' => $suppliers,
            'stats' => $stats,
            'cities' => $cities,
            'filters' => $request->only(['search', 'verification_status', 'city', 'sort_field', 'sort_direction']),
        ]);
    }

    /**
     * Display the specified supplier.
     */
    public function show($id)
    {
        $supplier = Supplier::with([
            'user',
            'products' => function ($q) {
                $q->latest()->take(10);
            }
        ])
            ->withCount(['products', 'quotes', 'orders'])
            ->findOrFail($id);

        // Get additional stats
        $stats = [
            'total_products' => Product::where('supplier_id', $supplier->id)->count(),
            'approved_products' => Product::where('supplier_id', $supplier->id)->where('status', 'approved')->count(),
            'pending_products' => Product::where('supplier_id', $supplier->id)->where('status', 'pending')->count(),
            'total_orders' => Order::where('supplier_id', $supplier->user_id)->count(),
            'completed_orders' => Order::where('supplier_id', $supplier->user_id)->where('order_status', 'delivered')->count(),
            'total_revenue' => Order::where('supplier_id', $supplier->user_id)
                ->where('payment_status', 'paid')
                ->sum('total_amount'),
        ];

        // Get recent orders
        $recentOrders = Order::where('supplier_id', $supplier->user_id)
            ->with('buyer:id,name,email')
            ->latest()
            ->take(5)
            ->get();

        // Get recent products
        $recentProducts = Product::where('supplier_id', $supplier->id)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Suppliers/Show', [
            'supplier' => $supplier,
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'recentProducts' => $recentProducts,
        ]);
    }

    /**
     * Show the form for editing the specified supplier.
     */
    public function edit($id)
    {
        $supplier = Supplier::with('user')->findOrFail($id);

        return Inertia::render('Admin/Suppliers/Edit', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Update the specified supplier.
     */
    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'trade_license_number' => 'required|string|max:255|unique:suppliers,trade_license_number,' . $id,
            'company_phone' => 'required|string|max:20',
            'company_email' => 'required|email|max:255|unique:suppliers,company_email,' . $id,
            'company_address' => 'required|string',
            'city' => 'required|string|max:100',
            'verification_status' => 'sometimes|in:pending,verified,rejected',
        ]);

        // Update user account status if verification status changes to verified
        if ($request->has('verification_status') && $request->verification_status === 'verified') {
            User::where('id', $supplier->user_id)->update(['is_active' => true]);
        }

        $supplier->update($validated);

        return redirect()->route('admin.suppliers.show', $supplier->id)
            ->with('success', 'Supplier updated successfully.');
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);

        // Check if supplier has products or orders
        $productsCount = Product::where('supplier_id', $id)->count();
        $ordersCount = Order::where('supplier_id', $supplier->user_id)->count();

        if ($productsCount > 0 || $ordersCount > 0) {
            return back()->withErrors([
                'error' => 'Cannot delete supplier with existing products or orders. Consider deactivating instead.'
            ]);
        }

        DB::transaction(function () use ($supplier) {
            // Delete the supplier record
            $supplier->delete();

            // Update user role to buyer or deactivate
            User::where('id', $supplier->user_id)->update([
                'role' => 'buyer',
                'is_active' => false
            ]);
        });

        return redirect()->route('admin.suppliers.index')
            ->with('success', 'Supplier deleted successfully.');
    }

    /**
     * Toggle supplier active status.
     */
    public function toggleStatus($id)
    {
        $supplier = Supplier::with('user')->findOrFail($id);
        $user = $supplier->user;

        $newStatus = !$user->is_active;
        $user->update(['is_active' => $newStatus]);

        $message = $newStatus ? 'Supplier activated successfully.' : 'Supplier deactivated successfully.';

        return back()->with('success', $message);
    }

    /**
     * Export suppliers list.
     */
    public function export(Request $request)
    {
        $query = Supplier::with('user');

        // Apply filters
        if ($request->filled('verification_status')) {
            $query->where('verification_status', $request->verification_status);
        }

        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        $suppliers = $query->get();

        // Prepare CSV data
        $csvData = [];
        $csvData[] = ['ID', 'Company Name', 'Contact Person', 'Email', 'Phone', 'City', 'Verification Status', 'Products Count', 'Joined Date'];

        foreach ($suppliers as $supplier) {
            $csvData[] = [
                $supplier->id,
                $supplier->company_name,
                $supplier->user->name,
                $supplier->company_email,
                $supplier->company_phone,
                $supplier->city,
                ucfirst($supplier->verification_status),
                $supplier->products()->count(),
                $supplier->created_at->format('Y-m-d'),
            ];
        }

        // Create CSV response
        $filename = 'suppliers-' . date('Y-m-d') . '.csv';
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
     * Get suppliers for dropdown.
     */
    public function getSuppliersList(Request $request)
    {
        $search = $request->get('search');

        $suppliers = Supplier::with('user')
            ->when($search, function ($query, $search) {
                $query->where('company_name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->where('verification_status', 'verified')
            ->limit(20)
            ->get(['id', 'company_name', 'user_id']);

        return response()->json($suppliers);
    }

    /**
     * Bulk update supplier status.
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'supplier_ids' => 'required|array',
            'supplier_ids.*' => 'exists:suppliers,id',
            'action' => 'required|in:verify,reject,activate,deactivate',
        ]);

        $suppliers = Supplier::whereIn('id', $request->supplier_ids)->with('user')->get();

        DB::transaction(function () use ($suppliers, $request) {
            foreach ($suppliers as $supplier) {
                switch ($request->action) {
                    case 'verify':
                        $supplier->update(['verification_status' => 'verified']);
                        $supplier->user->update(['is_active' => true]);
                        break;
                    case 'reject':
                        $supplier->update(['verification_status' => 'rejected']);
                        $supplier->user->update(['is_active' => false]);
                        break;
                    case 'activate':
                        $supplier->user->update(['is_active' => true]);
                        break;
                    case 'deactivate':
                        $supplier->user->update(['is_active' => false]);
                        break;
                }
            }
        });

        $count = count($suppliers);
        return back()->with('success', "{$count} suppliers updated successfully.");
    }
}
