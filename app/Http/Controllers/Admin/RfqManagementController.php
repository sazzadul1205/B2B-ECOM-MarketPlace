<?php
// app/Http/Controllers/Admin/RfqManagementController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rfq;
use App\Models\RfqQuote;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class RfqManagementController extends Controller
{
    /**
     * Display a listing of all RFQs.
     */
    public function index(Request $request)
    {
        $query = Rfq::with([
            'buyer:id,name,email',
            'quotes' => function ($q) {
                $q->with('supplier:id,name');
            }
        ])
            ->withCount('quotes');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by buyer
        if ($request->filled('buyer_id')) {
            $query->where('buyer_id', $request->buyer_id);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('rfq_number', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('buyer', function ($buyerQuery) use ($search) {
                        $buyerQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Required by date range
        if ($request->filled('required_from')) {
            $query->whereDate('required_by_date', '>=', $request->required_from);
        }
        if ($request->filled('required_to')) {
            $query->whereDate('required_by_date', '<=', $request->required_to);
        }

        $rfqs = $query->paginate(15)
            ->appends($request->query());

        // Get statistics
        $stats = [
            'total' => Rfq::count(),
            'open' => Rfq::where('status', 'open')->count(),
            'quoted' => Rfq::where('status', 'quoted')->count(),
            'closed' => Rfq::where('status', 'closed')->count(),
            'converted_to_order' => Rfq::has('order')->count(),
        ];

        // Get buyers for filter
        $buyers = User::where('role', 'buyer')
            ->select('id', 'name')
            ->get();

        return Inertia::render('Admin/Rfqs/Index', [
            'rfqs' => $rfqs,
            'stats' => $stats,
            'buyers' => $buyers,
            'filters' => $request->only([
                'search',
                'status',
                'buyer_id',
                'date_from',
                'date_to',
                'required_from',
                'required_to'
            ]),
        ]);
    }

    /**
     * Display the specified RFQ.
     */
    public function show($id)
    {
        $rfq = Rfq::with([
            'buyer:id,name,email',
            'quotes' => function ($q) {
                $q->with('supplier:id,name,email')
                    ->with('supplierProfile');
            },
            'order',
            'messages' => function ($q) {
                $q->with(['sender:id,name', 'receiver:id,name'])
                    ->latest();
            }
        ])
            ->findOrFail($id);

        return Inertia::render('Admin/Rfqs/Show', [
            'rfq' => $rfq,
        ]);
    }

    /**
     * View quotes for a specific RFQ.
     */
    public function quotes($id)
    {
        $rfq = Rfq::findOrFail($id);

        $quotes = RfqQuote::with([
            'supplier:id,name,email',
            'supplierProfile'
        ])
            ->where('rfq_id', $id)
            ->latest()
            ->get();

        return Inertia::render('Admin/Rfqs/Quotes', [
            'rfq' => $rfq,
            'quotes' => $quotes,
        ]);
    }

    /**
     * Close an RFQ.
     */
    public function close(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
            'notify_buyer' => 'boolean',
        ]);

        $rfq = Rfq::findOrFail($id);

        DB::transaction(function () use ($rfq, $request) {
            $rfq->update([
                'status' => 'closed',
                'closed_at' => now(),
                'closed_by' => auth()->id(),
                'closure_reason' => $request->reason,
            ]);

            if ($request->notify_buyer) {
                $this->sendRfqClosureNotification($rfq, $request->reason);
            }
        });

        return back()->with('success', 'RFQ has been closed.');
    }

    /**
     * Re-open a closed RFQ.
     */
    public function reopen($id)
    {
        $rfq = Rfq::findOrFail($id);

        $rfq->update([
            'status' => 'open',
            'reopened_at' => now(),
            'reopened_by' => auth()->id(),
        ]);

        return back()->with('success', 'RFQ has been reopened.');
    }

    /**
     * Delete an RFQ.
     */
    public function destroy($id)
    {
        $rfq = Rfq::findOrFail($id);

        // Check if RFQ has quotes or orders
        if ($rfq->quotes()->count() > 0 || $rfq->order()->exists()) {
            return back()->withErrors([
                'error' => 'Cannot delete RFQ with existing quotes or orders.'
            ]);
        }

        DB::transaction(function () use ($rfq) {
            // Delete related messages
            $rfq->messages()->delete();
            // Delete the RFQ
            $rfq->delete();
        });

        return redirect()->route('admin.rfqs.index')
            ->with('success', 'RFQ deleted successfully.');
    }

    /**
     * Get RFQ statistics.
     */
    public function statistics()
    {
        $stats = [
            'by_status' => Rfq::select('status', DB::raw('COUNT(*) as total'))
                ->groupBy('status')
                ->get(),
            'by_buyer' => Rfq::select(
                'buyer_id',
                DB::raw('COUNT(*) as total_rfqs'),
                DB::raw('AVG(quantity) as avg_quantity')
            )
                ->with('buyer:id,name')
                ->groupBy('buyer_id')
                ->orderBy('total_rfqs', 'desc')
                ->limit(10)
                ->get(),
            'monthly_trend' => Rfq::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as total')
            )
                ->where('created_at', '>=', now()->subMonths(12))
                ->groupBy('month')
                ->orderBy('month')
                ->get(),
            'response_rate' => [
                'with_quotes' => Rfq::has('quotes')->count(),
                'without_quotes' => Rfq::doesntHave('quotes')->count(),
                'avg_quotes_per_rfq' => Rfq::withCount('quotes')->get()->avg('quotes_count'),
            ],
            'popular_products' => DB::table('rfqs')
                ->select(DB::raw('JSON_EXTRACT(products_requested, "$[*].product_name") as product_names'))
                ->get()
                ->flatMap(function ($item) {
                    $products = json_decode($item->product_names, true) ?? [];
                    return $products;
                })
                ->countBy()
                ->sortDesc()
                ->take(10)
                ->map(function ($count, $product) {
                    return ['product' => $product, 'count' => $count];
                })
                ->values(),
        ];

        return Inertia::render('Admin/Rfqs/Statistics', [
            'stats' => $stats,
        ]);
    }

    /**
     * Export RFQs.
     */
    public function export(Request $request)
    {
        $query = Rfq::with(['buyer', 'quotes']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('created_at', [$request->date_from, $request->date_to]);
        }

        $rfqs = $query->get();

        // Generate CSV
        $csvData = [];
        $csvData[] = [
            'RFQ Number',
            'Title',
            'Buyer',
            'Quantity',
            'Required By',
            'Status',
            'Quotes Count',
            'Created At'
        ];

        foreach ($rfqs as $rfq) {
            $csvData[] = [
                $rfq->rfq_number,
                $rfq->title,
                $rfq->buyer->name,
                $rfq->quantity,
                $rfq->required_by_date->format('Y-m-d'),
                ucfirst($rfq->status),
                $rfq->quotes->count(),
                $rfq->created_at->format('Y-m-d H:i:s'),
            ];
        }

        $filename = 'rfqs-' . date('Y-m-d') . '.csv';
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
    private function sendRfqClosureNotification($rfq, $reason)
    {
        // Mail::to($rfq->buyer->email)->send(new RfqClosedMail($rfq, $reason));
    }
}
