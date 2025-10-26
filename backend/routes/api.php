<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Models\Order;
use Modules\SSLEcommerz\Http\Controllers\SslCommerzPaymentController;
use Illuminate\Http\Request;
use Illuminate\Broadcasting\BroadcastController; 
use App\Http\Controllers\PixelTrackingController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (authentication required)
Route::prefix('/users')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [AuthController::class, 'index']);
    Route::get('/{id}', [AuthController::class, 'show']);
    Route::delete('/logout', [AuthController::class, 'destroy']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/{id}', [AuthController::class, 'update']);
});


//Products route
Route::prefix('/products')->group(function(){
    Route::get('/', [ProductController::class, 'index']);
    Route::post('/', [ProductController::class, 'store']);
    Route::get('/{id}', [ProductController::class, 'show']);
    Route::post('/{id}', [ProductController::class, 'update']);
    Route::delete('/{id}', [ProductController::class, 'destroy']);
});


//Orders route
Route::prefix('/orders')->group(function(){
    Route::get('/', [OrderController::class, 'index']);
    Route::post('/', [OrderController::class, 'store']);
    Route::get('/{id}', [OrderController::class, 'show']);
    Route::put('/{id}', [OrderController::class, 'update']);       
    Route::delete('/{id}', [OrderController::class, 'destroy']);
    // Route::post('/pay', [SslCommerzPaymentController::class, 'index']);
});

Route::post('/broadcasting/auth', [BroadcastController::class, 'authenticate'])
    ->middleware('auth:sanctum');



// Public Tracking Endpoint (Used by the client-side pixel)
// Matches your React endpoint: /api/v1/pixels/track
Route::post('/v1/pixels/track', [PixelTrackingController::class, 'track']);
