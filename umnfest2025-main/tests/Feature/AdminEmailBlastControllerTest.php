<?php

use App\Mail\UnifyBlastMail;
use App\Models\EmailBlastLog;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
});

function adminSessionPayload(): array
{
    return [
        'admin_logged_in' => true,
        'admin_user' => [
            'role' => 'admin',
            'email' => 'testing@umnfestival.com',
            'name' => 'Testing Admin',
        ],
    ];
}

test('admin can fetch default template with trial recipients', function () {
    $response = $this->withSession(adminSessionPayload())
        ->getJson('/api/admin/email-blast/template');

    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'data' => ['subject', 'hero_title', 'agenda'],
            'trialRecipients',
            'allowProduction',
        ]);
});

test('production mode is locked when env flag is false', function () {
    $payload = array_merge(config('email_blast.default_template'), [
        'mode' => 'production',
    ]);

    $response = $this->withSession(adminSessionPayload())
        ->postJson('/api/admin/email-blast/send', $payload);

    $response->assertStatus(403)
        ->assertJson([
            'success' => false,
        ]);
});

test('trial blast only targets reviewer whitelist and logs the send', function () {
    Mail::fake();
    $payload = config('email_blast.default_template');

    $response = $this->withSession(adminSessionPayload())
        ->postJson('/api/admin/email-blast/send', $payload);

    $response->assertOk();

    $trialRecipients = collect(config('email_blast.trial_recipients'))->unique('email');
    Mail::assertSent(UnifyBlastMail::class, $trialRecipients->count());

    $log = EmailBlastLog::first();
    expect($log)->not->toBeNull()
        ->and($log->mode)->toBe('trial')
        ->and($log->sent_count)->toBe($trialRecipients->count());
});
