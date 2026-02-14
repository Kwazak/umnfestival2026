<?php

namespace App\Console\Commands;

use App\Models\ReferralCode;
use Illuminate\Console\Command;

class FixReferralCodeUses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'referral:fix-uses {--code= : Fix uses for specific referral code}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix the uses count for referral codes based on valid/used tickets';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to fix referral code uses count...');

        if ($this->option('code')) {
            // Fix specific referral code
            $referralCode = ReferralCode::where('code', $this->option('code'))->first();
            
            if (!$referralCode) {
                $this->error('Referral code not found: ' . $this->option('code'));
                return 1;
            }

            $oldUses = $referralCode->uses;
            $newUses = $referralCode->recalculateUses();
            
            $this->info("Fixed referral code '{$referralCode->code}': {$oldUses} → {$newUses} uses");
        } else {
            // Fix all referral codes
            $referralCodes = ReferralCode::all();
            $totalFixed = 0;

            foreach ($referralCodes as $referralCode) {
                $oldUses = $referralCode->uses;
                $newUses = $referralCode->recalculateUses();
                
                if ($oldUses !== $newUses) {
                    $this->line("Fixed '{$referralCode->code}': {$oldUses} → {$newUses} uses");
                    $totalFixed++;
                }
            }

            $this->info("Processed {$referralCodes->count()} referral codes, fixed {$totalFixed} codes.");
        }

        $this->info('Referral code uses count fix completed!');
        return 0;
    }
}