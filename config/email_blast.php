<?php

return [
    'trial_recipients' => [
        [
            'name' => 'David Garcia Saragih',
            'email' => 'davidgarciasaragih7@gmail.com',
        ],
        [
            'name' => 'David Garcia (Student)',
            'email' => 'david.garcia@student.umn.ac.id',
        ],
        [
            'name' => 'Chealsea Verencia',
            'email' => 'chealseaverencia17@gmail.com',
        ],
        [
            'name' => 'David GS 986',
            'email' => 'davidgs986@gmail.com',
        ],
    ],

    'allow_production_send' => (bool) env('EMAIL_BLAST_ALLOW_PRODUCTION', false),

    'template_storage' => 'email-blast/unify-2025.json',

    'default_template' => [
        'subject' => 'UNIFY 2025: Final Countdown to November 22!',
        'preheader' => 'Your all-access guide to the biggest night of UMN Festival 2025 – see you at UNIFY.',
        'hero_title' => 'UNIFY 2025 • 22 November 2025',
        'hero_subtitle' => 'One night. One heartbeat. Experience the boldest stage we have ever built at UMN.',
        'intro_paragraph' => "Thank you for securing your ticket to UNIFY 2025! We're officially on the final countdown, and this email packs everything you need so you can arrive ready for the night we've all been waiting for.",
        'event_date' => 'Saturday, 22 November 2025 — Gates open 16:00 WIB',
        'event_venue' => 'Summarecon Serpong • Live Outdoor Festival Arena',
        'agenda' => [
            [
                'time' => '16:00 WIB',
                'title' => 'Early Entry & Experience Zone',
                'description' => 'Beat the queue, activate your wristband, explore interactive booths, and secure limited merch drops.'
            ],
            [
                'time' => '18:00 WIB',
                'title' => 'Grand Opening Moment',
                'description' => 'Immersive light show plus a surprise collaborative act to kick-start the night.'
            ],
            [
                'time' => '19:00 – 23:00 WIB',
                'title' => 'UNIFY Main Stage',
                'description' => 'Headliners, live visuals, mid-set giveaways, and a finale designed exclusively for UMN Festival 2025.'
            ],
        ],
        'custom_sections' => [
            [
                'heading' => 'Quick Highlights',
                'content' => "• Full cashless experience – top up before you arrive.\n• Professional photo zones and media team covering every moment.\n• Emergency & help desk on-site for a smooth experience."
            ],
        ],
        'closing_remark' => 'We cannot wait to celebrate this milestone moment with you. Charge your devices, wear something bold, and let\'s make UNIFY 2025 the loudest chapter yet.',
        'contact_email' => 'hello@umnfestival.com',
        'contact_phone' => '+62 812-3900-0000',
        'footer_note' => 'You received this email because you purchased a UMN Festival 2025 ticket. Need help? Contact us anytime.',
        'hero_image_url' => 'https://cdn.umnfestival.com/emails/unify-2025/hero-banner.jpg',
        'socials' => [
            ['label' => 'Instagram', 'url' => 'https://instagram.com/umnfestival'],
            ['label' => 'TikTok', 'url' => 'https://tiktok.com/@umnfestival'],
            ['label' => 'Website', 'url' => 'https://umnfestival.com'],
        ],
    ],
];
