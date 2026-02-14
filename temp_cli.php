<?php
require "vendor/autoload.php";
$app = require "bootstrap/app.php";
$app->make("Illuminate\\Contracts\\Console\\Kernel")->bootstrap();
$group = App\Models\Order::selectRaw('sync_locked_reason, COUNT(*) as c, SUM(final_amount) as sum')->groupBy('sync_locked_reason')->get();
foreach ($group as $g) {
    echo ($g->sync_locked_reason ?? 'NULL') . " | count:" . $g->c . " | sum:" . $g->sum . PHP_EOL;
}
?>
