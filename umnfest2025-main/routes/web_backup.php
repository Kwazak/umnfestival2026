<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Home');
});

Route::get('/merchandise', function () {
    return inertia('Merchandise');
});

// Public Ticket Purchase Page
Route::get('/ticket', function () {
    return inertia('Ticket');
})->name('ticket.purchase');

// Under Construction Pages
Route::get('/event', function () {
    return inertia('Event');
})->name('event');

Route::get('/merchandise', function () {
    return inertia('Merchandise');
})->name('merchandise');

Route::get('/about', function () {
    return inertia('About');
})->name('about');


// Authentication Routes
Route::get('/login', [App\Http\Controllers\AdminController::class, 'showLogin'])->name('login');
Route::get('/admin/login', [App\Http\Controllers\AdminController::class, 'showLogin'])->name('admin.login');
Route::post('/admin/login', [App\Http\Controllers\AdminController::class, 'login'])->name('admin.login.post');
Route::post('/admin/logout', [App\Http\Controllers\AdminController::class, 'logout'])->name('admin.logout');

// Admin Routes (Protected)
Route::prefix('admin')->middleware('admin.auth')->group(function () {
    Route::get('/', [App\Http\Controllers\AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/orders', [App\Http\Controllers\AdminController::class, 'orders'])->name('admin.orders');
    Route::get('/orders/{orderId}', [App\Http\Controllers\AdminController::class, 'orderDetail'])->name('admin.orders.detail');
    Route::get('/tickets', [App\Http\Controllers\AdminController::class, 'tickets'])->name('admin.tickets');
    Route::get('/referral-codes', [App\Http\Controllers\AdminController::class, 'referralCodes'])->name('admin.referral-codes');
    Route::get('/guest-stars', [App\Http\Controllers\AdminController::class, 'guestStars'])->name('admin.guest-stars');
    Route::get('/ticket-types', [App\Http\Controllers\AdminController::class, 'ticketTypes'])->name('admin.ticket-types');
    Route::get('/scanner', [App\Http\Controllers\AdminController::class, 'scanner'])->name('admin.scanner');
    
    // Password Management
    Route::get('/change-password', [App\Http\Controllers\AdminPasswordController::class, 'showChangePassword'])->name('admin.change-password');
    Route::post('/change-password', [App\Http\Controllers\AdminPasswordController::class, 'changePassword'])->name('admin.change-password.post');
});

// Midtrans redirect handler - intercepts all finish/unfinish/error URLs
Route::get('/payment-status', [App\Http\Controllers\PaymentStatusController::class, 'handlePaymentStatus'])->name('payment.status.handler');

// Payment Redirect Routes
Route::get('/payment/success', function () {
    return inertia('Payment/Success');
})->name('payment.success');

Route::get('/payment/pending', function () {
    return inertia('Payment/Pending');
})->name('payment.pending');

// Redirect error and unfinish to pending page for better user experience
Route::get('/payment/error', function () {
    return redirect()->route('payment.pending');
})->name('payment.error');

Route::get('/payment/unfinish', function () {
    return redirect()->route('payment.pending');
})->name('payment.unfinish');

Route::get('/payment/finish', function () {
    return inertia('Payment/Success');
})->name('payment.finish');

// QR Code Routes
Route::get('/ticket/qr/{ticketCode}', [App\Http\Controllers\QrCodeController::class, 'generateTicketQr'])
    ->name('ticket.qr')
    ->where('ticketCode', '[A-Z0-9\-]+');

// Test routes for error pages (remove in production)
Route::get('/test/401', function () {
    abort(401);
})->name('test.401');

Route::get('/test/403', function () {
    abort(403);
})->name('test.403');

Route::get('/test/500', function () {
    abort(500);
})->name('test.500');

Route::get('/test/503', function () {
    abort(503);
})->name('test.503');

// Protected route to test authentication
Route::get('/test/protected', function () {
    return response()->json(['message' => 'This is a protected route']);
})->middleware('admin.auth');

// Fallback route for 404 errors - must be last
Route::fallback(function () {
    abort(404);
});