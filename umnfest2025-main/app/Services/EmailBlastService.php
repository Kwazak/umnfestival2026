<?php

namespace App\Services;

use App\Mail\UnifyBlastMail;
use App\Models\EmailBlastLog;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class EmailBlastService
{
    protected string $templateStorage;

    public function __construct()
    {
        $this->templateStorage = config('email_blast.template_storage', 'email-blast/unify-2025.json');
    }

    public function getTemplate(): array
    {
        if (Storage::disk('local')->exists($this->templateStorage)) {
            $content = json_decode(Storage::disk('local')->get($this->templateStorage), true);
            if (is_array($content)) {
                return $this->mergeWithDefaults($content);
            }
        }

        return config('email_blast.default_template', []);
    }

    public function saveTemplate(array $payload): array
    {
        $this->ensureStorageDirectory();
        Storage::disk('local')->put(
            $this->templateStorage,
            json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );

        return $this->mergeWithDefaults($payload);
    }

    public function renderHtml(array $payload, string $recipientName = 'UNIFY Friend'): string
    {
        $data = $this->mergeWithDefaults($payload);

        return view('emails.campaigns.unify-blast', [
            'recipientName' => $recipientName,
            'payload' => $data,
        ])->render();
    }

    public function getTrialRecipients(): array
    {
        return collect(config('email_blast.trial_recipients', []))
            ->map(function ($recipient) {
                return [
                    'email' => strtolower($recipient['email']),
                    'name' => $recipient['name'] ?? 'UNIFY Friend',
                ];
            })
            ->unique('email')
            ->values()
            ->all();
    }

    public function getProductionRecipientCount(): int
    {
        return Order::query()
            ->whereNotNull('buyer_email')
            ->whereIn('status', ['capture', 'settlement', 'paid'])
            ->distinct('buyer_email')
            ->count('buyer_email');
    }

    public function getProductionRecipients(array $filters = []): array
    {
        $query = Order::query()->whereNotNull('buyer_email');

        if (!empty($filters['status'])) {
            $query->whereIn('status', (array) $filters['status']);
        } else {
            $query->whereIn('status', ['capture', 'settlement', 'paid']);
        }

        if (!empty($filters['only_with_paid_at'])) {
            $query->whereNotNull('paid_at');
        }

        $records = $query->select('buyer_email', 'buyer_name')
            ->orderBy('buyer_email')
            ->get();

        $unique = $records->unique(function ($item) {
            return strtolower($item->buyer_email);
        });

        return $unique->map(function ($order) {
            return [
                'email' => strtolower($order->buyer_email),
                'name' => $order->buyer_name ?: 'UNIFY Friend',
            ];
        })->values()->all();
    }

    public function sendBlast(string $mode, array $recipients, array $payload, string $sentBy): EmailBlastLog
    {
        $data = $this->mergeWithDefaults($payload);
        
        $recipientEmails = array_map(fn($r) => $r['email'], $recipients);

        $log = EmailBlastLog::create([
            'mode' => $mode,
            'subject' => $data['subject'] ?? 'UNIFY 2025 Blast',
            'intended_recipients' => $recipientEmails,
            'sent_count' => 0,
            'status' => 'processing',
            'sent_by' => $sentBy,
            'payload' => $data,
        ]);

        $sent = 0;
        $errors = [];

        foreach ($recipients as $recipient) {
            try {
                Mail::to($recipient['email'])->send(
                    new UnifyBlastMail($data, $recipient['name'] ?? 'UNIFY Friend')
                );
                $sent++;
            } catch (\Throwable $th) {
                $errors[] = [
                    'email' => $recipient['email'],
                    'message' => $th->getMessage(),
                ];

                Log::error('Email blast send failed', [
                    'mode' => $mode,
                    'email' => $recipient['email'],
                    'error' => $th->getMessage(),
                ]);
            }
        }

        $log->update([
            'sent_count' => $sent,
            'status' => empty($errors) ? 'sent' : ($sent === 0 ? 'failed' : 'partial'),
            'error_message' => empty($errors) ? null : json_encode($errors),
        ]);

        return $log->fresh();
    }

    protected function mergeWithDefaults(array $payload): array
    {
        $defaults = config('email_blast.default_template', []);

        $merged = array_merge($defaults, $payload);
        $merged['agenda'] = $payload['agenda'] ?? $defaults['agenda'] ?? [];
        $merged['custom_sections'] = $payload['custom_sections'] ?? $defaults['custom_sections'] ?? [];
        $merged['socials'] = $payload['socials'] ?? $defaults['socials'] ?? [];

        return $merged;
    }

    protected function ensureStorageDirectory(): void
    {
        $directory = dirname($this->templateStorage);
        if ($directory && $directory !== '.' && !Storage::disk('local')->exists($directory)) {
            Storage::disk('local')->makeDirectory($directory);
        }
    }
}
