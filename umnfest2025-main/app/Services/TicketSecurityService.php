<?php

namespace App\Services;

use App\Models\Ticket;
use Illuminate\Support\Facades\Log;

/**
 * Centralized ticket security helper to avoid duplicated hash logic.
 */
class TicketSecurityService
{
    /**
     * Build the verification hash for a ticket using stable inputs.
     */
    public static function generateHash(Ticket $ticket): string
    {
        // Ensure order is available because order_number is part of the hash
        $ticket->loadMissing('order');

        $payload = $ticket->ticket_code .
            $ticket->order->order_number .
            $ticket->id .
            config('app.key');

        return hash('sha256', $payload);
    }

    /**
     * Compare a provided hash against the expected value.
     */
    public static function isValidHash(Ticket $ticket, ?string $providedHash): bool
    {
        if (!$providedHash) {
            return false;
        }

        $expectedHash = self::generateHash($ticket);

        $result = hash_equals($expectedHash, (string) $providedHash);

        if (!$result) {
            Log::warning('TicketSecurityService: Hash mismatch', [
                'ticket_code' => $ticket->ticket_code,
                'provided_prefix' => substr($providedHash, 0, 10),
            ]);
        }

        return $result;
    }

    /**
     * Build a validation URL that already includes the verify hash.
     */
    public static function buildValidationUrl(Ticket $ticket): string
    {
        $hash = self::generateHash($ticket);

        return url('/api/tickets/validate/' . $ticket->ticket_code . '?verify=' . $hash);
    }
}
