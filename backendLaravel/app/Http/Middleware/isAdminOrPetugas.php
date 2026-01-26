<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class isAdminOrPetugas
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next)
{
    if (!in_array(auth()->user()->role, [1, 2])) {
        return response()->json([
            'success' => false,
            'message' => 'Akses ditolak'
        ], 403);
    }

    return $next($request);
}

}
