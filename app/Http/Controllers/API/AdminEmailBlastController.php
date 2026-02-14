<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\EmailBlastLog;
use App\Services\EmailBlastService;
use Illuminate\Http\Request;

class AdminEmailBlastController extends Controller
{
    public function __construct(protected EmailBlastService $service)
    {
    }

    public function template(): array
    {
        return [
            'success' => true,
            'data' => $this->service->getTemplate(),
            'trialRecipients' => $this->service->getTrialRecipients(),
            'allowProduction' => config('email_blast.allow_production_send'),
            'productionCount' => $this->service->getProductionRecipientCount(),
        ];
    }

    public function productionRecipients(Request $request): array
    {
        $recipients = $this->service->getProductionRecipients($request->input('filters', []));
        
        return [
            'success' => true,
            'data' => array_map(fn($r) => $r['email'], $recipients),
            'count' => count($recipients),
        ];
    }

    public function saveTemplate(Request $request): array
    {
        $data = $this->validateTemplate($request);
        $template = $this->service->saveTemplate($data);

        return [
            'success' => true,
            'data' => $template,
            'message' => 'Template updated successfully.',
        ];
    }

    public function preview(Request $request)
    {
        $data = $this->validateTemplate($request);

        return [
            'success' => true,
            'html' => $this->service->renderHtml($data),
        ];
    }

    public function send(Request $request)
    {
        $payload = $this->validateTemplate($request);
        $mode = $request->input('mode', 'trial');

        if ($mode !== 'trial' && !config('email_blast.allow_production_send')) {
            return response()->json([
                'success' => false,
                'message' => 'Production blast is locked. Set EMAIL_BLAST_ALLOW_PRODUCTION=true only after explicit approval.',
            ], 403);
        }

        $recipients = $mode === 'trial'
            ? $this->service->getTrialRecipients()
            : $this->service->getProductionRecipients($request->input('filters', []));

        if (empty($recipients)) {
            return response()->json([
                'success' => false,
                'message' => 'No recipients found for the selected mode.',
            ], 422);
        }

        $sentBy = data_get(session('admin_user'), 'email', 'system');

        $log = $this->service->sendBlast($mode, $recipients, $payload, $sentBy);

        return [
            'success' => $log->status === 'sent',
            'message' => $mode === 'trial'
                ? 'Trial blast sent to ' . count($recipients) . ' recipients.'
                : 'Production blast sent to ' . count($recipients) . ' ticket buyers.',
            'log' => $log,
            'recipients' => array_map(fn($r) => $r['email'], $recipients),
            'total_sent' => count($recipients),
        ];
    }

    public function logs(): array
    {
        $logs = EmailBlastLog::orderByDesc('created_at')->limit(25)->get();

        return [
            'success' => true,
            'data' => $logs,
        ];
    }

    protected function validateTemplate(Request $request): array
    {
        return $request->validate([
            'subject' => 'required|string|max:150',
            'preheader' => 'nullable|string|max:180',
            'hero_title' => 'nullable|string|max:140',
            'hero_subtitle' => 'nullable|string|max:220',
            'intro_paragraph' => 'nullable|string',
            'event_date' => 'nullable|string|max:160',
            'event_venue' => 'nullable|string|max:160',
            'agenda' => 'nullable|array',
            'agenda.*.time' => 'nullable|string|max:60',
            'agenda.*.title' => 'required_with:agenda|string|max:120',
            'agenda.*.description' => 'nullable|string|max:350',
            'custom_sections' => 'nullable|array',
            'custom_sections.*.heading' => 'nullable|string|max:100',
            'custom_sections.*.content' => 'nullable|string',
            'closing_remark' => 'nullable|string',
            'contact_email' => 'nullable|email|max:120',
            'contact_phone' => 'nullable|string|max:60',
            'footer_note' => 'nullable|string|max:220',
            'hero_image_url' => 'nullable|url|max:255',
            'socials' => 'nullable|array',
            'socials.*.label' => 'required_with:socials|string|max:50',
            'socials.*.url' => 'required_with:socials|url|max:255',
        ]);
    }
}
