<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use App\Models\Order;
use App\Observers\OrderObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind working QR code service - using BaconQrCodeService with API fallback
        $this->app->bind(\App\Services\QrCodeService::class, function ($app) {
            // Use BaconQrCodeService which has reliable API fallback
            if (class_exists(\App\Services\BaconQrCodeService::class)) {
                return new \App\Services\BaconQrCodeService();
            }
            // Fallback to original service
            return new \App\Services\QrCodeService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(291);
        
        // Fix UrlGenerator issue by ensuring proper URL configuration
        if ($this->app->runningInConsole()) {
            URL::forceRootUrl(config('app.url'));
        }
        
        // Register Order Observer for automatic expired order deletion
        Order::observe(OrderObserver::class);
    }
}
