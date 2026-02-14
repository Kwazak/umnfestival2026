<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // SECURITY: Only create admin user if none exists and in development
        if (app()->environment('local', 'development') && User::where('role', 'admin')->count() === 0) {
            // Support both direct env() and cached config values (config:cache)
            $adminPassword = env('ADMIN_DEFAULT_PASSWORD') ?: config('app.admin_default_password');

            // Trim surrounding quotes and whitespace (handles quoted values in .env)
            if (is_string($adminPassword)) {
                $adminPassword = trim($adminPassword);
                $adminPassword = trim($adminPassword, "\"'");
            }

            if (!$adminPassword) {
                throw new \Exception('ADMIN_DEFAULT_PASSWORD must be set in .env file or config for seeding admin user');
            }

            // Validate password strength
            if (!is_string($adminPassword) || strlen($adminPassword) < 16) {
                throw new \Exception('Admin password must be at least 16 characters long');
            }
            
            User::create([
                'name' => 'Admin UMN Festival',
                'email' => 'admin@umnfest.com',
                'password' => Hash::make($adminPassword),
                'role' => 'admin',
                'phone' => '+6287776803957',
                'email_verified_at' => now(),
            ]);
            
            \Log::warning('Admin user created via seeder', [
                'email' => 'admin@umnfest.com',
                'environment' => app()->environment(),
                'ip' => request()->ip() ?? 'CLI'
            ]);
        }

        // Seed ticket types and guest stars
        $this->call([
            TicketTypeSeeder::class,
            GuestStarSeeder::class,
            DivisionSeeder::class,
            EventUpcomingDetailSeeder::class,
            CountdownEventSeeder::class,
            ArchiveVideoSeeder::class,
            ClosingSectionSeeder::class,
            DiscountCodeSeeder::class,
            ChatbotKnowledgeSeeder::class,
        ]);
    }
}