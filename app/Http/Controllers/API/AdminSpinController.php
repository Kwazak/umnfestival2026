<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SpinAttempt;
use App\Models\SpinPrize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminSpinController extends Controller
{
    public function dashboard()
    {
        $prizes = SpinPrize::withCount(['attempts as total_spins'])
            ->withCount(['attempts as total_wins' => function ($query) {
                $query->where('prize_type', '!=', 'nothing');
            }])
            ->orderBy('probability', 'desc')
            ->orderBy('name')
            ->get();

        $totalSpins = SpinAttempt::count();
        $winnerCount = SpinAttempt::where('prize_type', '!=', 'nothing')->count();
        $uniqueOrders = SpinAttempt::distinct('order_id')->count('order_id');
        $last24h = SpinAttempt::where('spun_at', '>=', now()->subHours(24))->count();
        $totalWeight = $prizes->sum('probability');

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_spins' => $totalSpins,
                    'winner_count' => $winnerCount,
                    'unique_orders' => $uniqueOrders,
                    'spins_last_24h' => $last24h,
                    'total_weight' => $totalWeight,
                    'win_rate' => $totalSpins > 0 ? round(($winnerCount / $totalSpins) * 100, 2) : 0,
                ],
                'prizes' => $prizes->map(function (SpinPrize $prize) {
                    return [
                        'id' => $prize->id,
                        'name' => $prize->name,
                        'type' => $prize->type,
                        'probability' => $prize->probability,
                        'value' => $prize->value,
                        'display_text' => $prize->display_text,
                        'is_active' => $prize->is_active,
                        'stock' => $prize->stock,
                        'total_spins' => $prize->total_spins,
                        'total_wins' => $prize->total_wins,
                        'updated_at' => optional($prize->updated_at)->toIso8601String(),
                    ];
                }),
            ],
        ]);
    }

    public function updatePrize(Request $request, SpinPrize $spinPrize)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'type' => 'required|in:cashback,merchandise,discount,nothing',
            'probability' => 'required|integer|min:0|max:10000',
            'value' => 'nullable|string|max:120',
            'display_text' => 'nullable|string|max:160',
            'stock' => 'nullable|integer|min:0',
            'is_active' => 'required|boolean',
        ]);

        if ($data['type'] === 'nothing') {
            $data['value'] = null;
        }

        if ($request->filled('stock') === false) {
            $data['stock'] = null;
        }

        $spinPrize->update($data);

        $adminUser = session('admin_user');

        Log::info('Spin prize updated by admin', [
            'prize_id' => $spinPrize->id,
            'admin_id' => $adminUser['id'] ?? null,
            'admin_email' => $adminUser['email'] ?? null,
            'changes' => $data,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Prize updated',
            'data' => $spinPrize->fresh(),
        ]);
    }

    public function attempts(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(1, min(100, $perPage));

        $search = trim((string) $request->input('search', ''));

        $query = SpinAttempt::with(['prize:id,name,type', 'order:id,order_number,buyer_name,buyer_email'])
            ->orderByDesc('spun_at');

        if ($search !== '') {
            $numericSearch = is_numeric($search) ? (int) $search : null;
            $query->where(function ($attemptQuery) use ($search) {
                $attemptQuery
                    ->where('prize_name', 'like', "%{$search}%")
                    ->orWhere('prize_type', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('prize_value', 'like', "%{$search}%")
                    ->orWhereHas('order', function ($orderQuery) use ($search) {
                        $orderQuery
                            ->where('order_number', 'like', "%{$search}%")
                            ->orWhere('buyer_name', 'like', "%{$search}%")
                            ->orWhere('buyer_email', 'like', "%{$search}%");
                    });
            });
            if ($numericSearch !== null) {
                $query->orWhere('id', $numericSearch);
            }
        }

        $paginator = $query->paginate($perPage)->withQueryString();

        $attempts = $paginator->getCollection()->map(function (SpinAttempt $attempt) {
            return [
                'id' => $attempt->id,
                'order_number' => $attempt->order?->order_number,
                'buyer_name' => $attempt->order?->buyer_name,
                'buyer_email' => $attempt->order?->buyer_email,
                'email_used' => $attempt->email,
                'prize_name' => $attempt->prize_name,
                'prize_type' => $attempt->prize_type,
                'prize_value' => $attempt->prize_value,
                'prize_id' => $attempt->prize_id,
                'spun_at' => optional($attempt->spun_at)->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $attempts,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
            'links' => [
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ]);
    }

    public function destroy(SpinAttempt $spinAttempt)
    {
        $attemptData = $spinAttempt->only([
            'id',
            'order_id',
            'email',
            'prize_id',
            'prize_name',
            'prize_type',
            'prize_value',
            'spun_at',
        ]);

        $spinAttempt->delete();

        $adminUser = session('admin_user');

        Log::warning('Spin attempt deleted by admin', [
            'attempt' => $attemptData,
            'admin_id' => $adminUser['id'] ?? null,
            'admin_email' => $adminUser['email'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Spin attempt deleted',
        ]);
    }
}
