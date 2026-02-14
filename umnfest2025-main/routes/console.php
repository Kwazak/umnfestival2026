<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// The orders:cleanup-expired command is now defined as a proper command class
// in app/Console/Commands/CleanupExpiredOrders.php
