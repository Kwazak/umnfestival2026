<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ForcePasswordChange extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:force-password-change {email} {new_password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Force change admin password (Emergency use only)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $newPassword = $this->argument('new_password');

        // Find admin user
        $user = User::where('email', $email)->where('role', 'admin')->first();

        if (!$user) {
            $this->error("Admin user with email {$email} not found!");
            return 1;
        }

        // Validate password strength
        if (!$this->isPasswordStrong($newPassword)) {
            $this->error('Password does not meet security requirements!');
            $this->info('Password must:');
            $this->info('- Be at least 12 characters long');
            $this->info('- Contain uppercase and lowercase letters');
            $this->info('- Contain numbers and symbols');
            $this->info('- Not contain common patterns');
            return 1;
        }

        // Confirm action
        if (!$this->confirm("Are you sure you want to change password for {$user->name} ({$email})?")) {
            $this->info('Password change cancelled.');
            return 0;
        }

        // Update password
        $user->update([
            'password' => Hash::make($newPassword),
            'updated_at' => now(),
        ]);

        // Log the action
        \Log::warning('Admin password force changed via command', [
            'user_id' => $user->id,
            'email' => $user->email,
            'changed_by' => 'console_command',
            'timestamp' => now()->toISOString()
        ]);

        $this->info("Password changed successfully for {$user->name}!");
        $this->warn('This action has been logged for security purposes.');

        return 0;
    }

    /**
     * Check if password meets security requirements
     */
    private function isPasswordStrong(string $password): bool
    {
        // Must be at least 12 characters
        if (strlen($password) < 12) {
            return false;
        }

        // Must contain uppercase letter
        if (!preg_match('/[A-Z]/', $password)) {
            return false;
        }

        // Must contain lowercase letter
        if (!preg_match('/[a-z]/', $password)) {
            return false;
        }

        // Must contain number
        if (!preg_match('/[0-9]/', $password)) {
            return false;
        }

        // Must contain special character
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            return false;
        }

        // Must not contain common patterns
        $commonPatterns = [
            '/123456/',
            '/password/i',
            '/admin/i',
            '/qwerty/i',
        ];

        foreach ($commonPatterns as $pattern) {
            if (preg_match($pattern, $password)) {
                return false;
            }
        }

        return true;
    }
}