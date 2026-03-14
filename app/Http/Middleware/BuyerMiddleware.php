<?php
// app/Http/Middleware/BuyerMiddleware.php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BuyerMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        /** @var User|null $user */
        $user = Auth::user();

        if (!$user || !$user->isBuyer()) {
            abort(403, 'Unauthorized access. Buyer privileges required.');
        }

        return $next($request);
    }
}
