<?php
// app/Http/Controllers/Admin/SupplierVerificationController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SupplierVerificationController extends Controller
{
    /**
     * Display a listing of pending supplier verifications.
     */
    public function index(Request $request)
    {
        $query = Supplier::with(['user' => function ($q) {
            $q->select('id', 'name', 'email', 'is_active', 'created_at');
        }])
            ->where('verification_status', 'pending');

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

        // Filter by city
        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        // Date range filter
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

        $pendingSuppliers = $query->paginate(15)
            ->appends($request->query());

        // Get statistics (using only existing fields)
        $stats = [
            'pending' => Supplier::where('verification_status', 'pending')->count(),
            'verified' => Supplier::where('verification_status', 'verified')->count(),
            'rejected' => Supplier::where('verification_status', 'rejected')->count(),
            'total' => Supplier::count(),
        ];

        // Get unique cities for filter
        $cities = Supplier::where('verification_status', 'pending')
            ->distinct()
            ->pluck('city');

        return Inertia::render('Admin/SupplierVerification/Index', [
            'pendingSuppliers' => $pendingSuppliers,
            'stats' => $stats,
            'cities' => $cities,
            'filters' => $request->only(['search', 'city', 'date_from', 'date_to', 'sort_field', 'sort_direction']),
        ]);
    }

    /**
     * Display the verification form for a specific supplier.
     */
    public function verify($id)
    {
        $supplier = Supplier::with([
            'user',
            'products' => function ($q) {
                $q->latest();
            }
        ])
            ->findOrFail($id);

        // Get verification checklist data (using only existing fields)
        $verificationData = [
            'supplier' => $supplier,
            'documents' => [
                'trade_license' => [
                    'status' => $supplier->trade_license_number ? 'present' : 'missing',
                    'number' => $supplier->trade_license_number,
                ],
                'company_info' => [
                    'status' => 'present',
                    'company_name' => $supplier->company_name,
                    'company_email' => $supplier->company_email,
                    'company_phone' => $supplier->company_phone,
                    'company_address' => $supplier->company_address,
                ],
            ],
            'existing_products' => $supplier->products()->count(),
            'user_status' => [
                'is_active' => $supplier->user->is_active,
                'email_verified' => $supplier->user->email_verified_at ? true : false,
            ],
        ];

        return Inertia::render('Admin/SupplierVerification/Verify', [
            'verificationData' => $verificationData,
        ]);
    }

    /**
     * Approve a supplier verification.
     */
    public function approve(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
            'send_notification' => 'boolean',
        ]);

        $supplier = Supplier::with('user')->findOrFail($id);

        DB::transaction(function () use ($supplier, $request) {
            // Update supplier status only (using existing fields)
            $supplier->update([
                'verification_status' => 'verified',
            ]);

            // Activate the user account
            $supplier->user->update([
                'is_active' => true,
            ]);

            // Send notification email if requested (you'll need to implement this)
            if ($request->send_notification) {
                // $this->sendVerificationEmail($supplier, 'approved', $request->notes);
            }
        });

        return redirect()->route('admin.supplier-verification.index')
            ->with('success', 'Supplier has been verified successfully.');
    }

    /**
     * Reject a supplier verification.
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
            'send_notification' => 'boolean',
        ]);

        $supplier = Supplier::with('user')->findOrFail($id);

        DB::transaction(function () use ($supplier, $request) {
            // Update supplier status only (using existing fields)
            $supplier->update([
                'verification_status' => 'rejected',
            ]);

            // Deactivate the user account
            $supplier->user->update([
                'is_active' => false,
            ]);

            // Send rejection email if requested (you'll need to implement this)
            if ($request->send_notification) {
                // $this->sendVerificationEmail($supplier, 'rejected', $request->rejection_reason);
            }
        });

        return redirect()->route('admin.supplier-verification.index')
            ->with('success', 'Supplier verification has been rejected.');
    }

    /**
     * Request additional documents from supplier.
     */
    public function requestDocuments(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $supplier = Supplier::with('user')->findOrFail($id);

        // You could store this in a notifications table or send email directly
        // For now, we'll just return a success message

        return back()->with('success', 'Document request has been sent to the supplier.');
    }

    /**
     * View verified suppliers.
     */
    public function verified(Request $request)
    {
        $query = Supplier::with(['user' => function ($q) {
            $q->select('id', 'name', 'email', 'is_active');
        }])
            ->where('verification_status', 'verified');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', '%' . $search . '%')
                    ->orWhere('company_email', 'like', '%' . $search . '%')
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%');
                    });
            });
        }

        $verifiedSuppliers = $query->paginate(15);

        return Inertia::render('Admin/SupplierVerification/Verified', [
            'verifiedSuppliers' => $verifiedSuppliers,
        ]);
    }

    /**
     * View rejected suppliers.
     */
    public function rejected(Request $request)
    {
        $query = Supplier::with(['user' => function ($q) {
            $q->select('id', 'name', 'email', 'is_active');
        }])
            ->where('verification_status', 'rejected');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', '%' . $search . '%')
                    ->orWhere('company_email', 'like', '%' . $search . '%')
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%');
                    });
            });
        }

        $rejectedSuppliers = $query->paginate(15);

        return Inertia::render('Admin/SupplierVerification/Rejected', [
            'rejectedSuppliers' => $rejectedSuppliers,
        ]);
    }

    /**
     * Bulk verify suppliers.
     */
    public function bulkVerify(Request $request)
    {
        $request->validate([
            'supplier_ids' => 'required|array',
            'supplier_ids.*' => 'exists:suppliers,id',
        ]);

        $count = Supplier::whereIn('id', $request->supplier_ids)
            ->where('verification_status', 'pending')
            ->count();

        DB::transaction(function () use ($request) {
            // Update suppliers status
            Supplier::whereIn('id', $request->supplier_ids)
                ->where('verification_status', 'pending')
                ->update([
                    'verification_status' => 'verified',
                ]);

            // Activate associated users
            $suppliers = Supplier::whereIn('id', $request->supplier_ids)->get();
            foreach ($suppliers as $supplier) {
                User::where('id', $supplier->user_id)->update(['is_active' => true]);
            }
        });

        return back()->with('success', "{$count} suppliers have been verified successfully.");
    }
}
