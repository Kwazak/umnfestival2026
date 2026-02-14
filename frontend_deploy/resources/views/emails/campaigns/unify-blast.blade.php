<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $payload['subject'] ?? 'UMN Festival 2025 Update' }}</title>
    <style>
        /* Base styles - neutral colors for universal compatibility */
        body {
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            color: #2c2c2c;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            line-height: 1.6;
        }
        
        /* Container */
        .wrapper {
            width: 100%;
            background-color: #f5f5f5;
            padding: 20px 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        
        /* Header - clean and professional */
        .header {
            background: #ffffff;
            padding: 28px 32px;
            border-bottom: 3px solid #FF6B35;
            text-align: center;
        }
        .header-logo {
            font-size: 22px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .header-logo span {
            color: #FF6B35;
        }
        
        /* Hero Section */
        .hero {
            padding: 32px 32px 24px 32px;
            background: #ffffff;
            text-align: center;
        }
        .hero img {
            width: 100%;
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 0 auto 24px auto;
            display: block;
        }
        .hero-title {
            margin: 0 auto 14px auto;
            font-size: 26px;
            line-height: 1.3;
            color: #1a1a1a;
            font-weight: 700;
            letter-spacing: -0.3px;
            text-align: center;
        }
        .hero-subtitle {
            margin: 0 auto;
            font-size: 16px;
            line-height: 1.6;
            color: #595959;
            font-weight: 400;
            text-align: center;
        }
        
        /* Content Sections */
        .section {
            padding: 28px 32px;
            background: #ffffff;
            border-top: 1px solid #e5e5e5;
        }
        .section-title {
            margin: 0 0 18px 0;
            font-size: 19px;
            font-weight: 700;
            color: #1a1a1a;
            letter-spacing: -0.2px;
        }
        .paragraph {
            line-height: 1.7;
            font-size: 15px;
            color: #3d3d3d;
            margin: 0 0 14px 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        /* Event Details Box */
        .event-details {
            background: #fafafa;
            border-left: 4px solid #FF6B35;
            padding: 18px 22px;
            margin: 24px 0;
            border-radius: 6px;
        }
        .event-details strong {
            display: block;
            font-size: 15px;
            color: #1a1a1a;
            margin-bottom: 8px;
            font-weight: 600;
        }
        .event-details span {
            display: block;
            font-size: 15px;
            color: #4a4a4a;
            margin-top: 6px;
        }
        
        /* Agenda/Schedule - Improved Structure */
        .agenda-list {
            margin: 20px 0 0 0;
            background: #ffffff;
        }
        .agenda-item {
            background: #fafafa;
            border: 1px solid #e8e8e8;
            border-radius: 8px;
            padding: 18px 20px;
            margin-bottom: 14px;
            transition: all 0.2s ease;
        }
        .agenda-item:last-child {
            margin-bottom: 0;
        }
        .agenda-time {
            display: inline-block;
            background: #FF6B35;
            color: #ffffff;
            font-weight: 700;
            font-size: 13px;
            padding: 6px 14px;
            border-radius: 6px;
            margin-bottom: 12px;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }
        .agenda-title {
            font-size: 17px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 8px 0;
            line-height: 1.4;
            letter-spacing: -0.2px;
        }
        .agenda-description {
            font-size: 14px;
            line-height: 1.7;
            color: #595959;
            margin: 0;
            padding-left: 0;
        }
        
        /* Custom Content Sections - Enhanced Design */
        .custom-section {
            background: #ffffff;
            border-left: 4px solid #FF6B35;
            padding: 20px 24px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        .custom-section-heading {
            font-size: 18px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 14px 0;
            letter-spacing: -0.3px;
            line-height: 1.3;
        }
        .custom-section-content {
            font-size: 15px;
            line-height: 1.75;
            color: #3d3d3d;
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        /* Bullet points in custom sections */
        .custom-section-content ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .custom-section-content li {
            margin: 6px 0;
            line-height: 1.7;
        }
        
        /* Contact Box */
        .contact-box {
            background: #fafafa;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 22px 24px;
            margin-top: 24px;
            text-align: center;
        }
        .contact-box strong {
            display: block;
            margin-bottom: 14px;
            font-size: 16px;
            color: #1a1a1a;
            font-weight: 600;
        }
        .contact-box a {
            color: #FF6B35;
            text-decoration: none;
            font-weight: 500;
            font-size: 15px;
        }
        .contact-box a:hover {
            text-decoration: underline;
        }
        .contact-box div {
            margin: 8px 0;
            color: #3d3d3d;
            font-size: 15px;
        }
        
        /* Footer */
        .footer {
            background: #fafafa;
            padding: 28px 32px;
            text-align: center;
            color: #6b6b6b;
            font-size: 13px;
            line-height: 1.7;
            border-top: 1px solid #e5e5e5;
        }
        .footer p {
            margin: 0 0 10px 0;
        }
        .footer a {
            color: #FF6B35;
            text-decoration: none;
            margin: 0 10px;
            font-weight: 500;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        
        /* Preheader (hidden) */
        .preheader {
            display: none !important;
            visibility: hidden;
            opacity: 0;
            color: transparent;
            height: 0;
            width: 0;
            max-height: 0;
            overflow: hidden;
        }
        
        /* Mobile Responsive */
        @media only screen and (max-width: 600px) {
            .wrapper {
                padding: 0;
            }
            .email-container {
                border-radius: 0;
                box-shadow: none;
            }
            .header {
                padding: 20px 18px;
            }
            .header-logo {
                font-size: 19px;
            }
            .hero {
                padding: 24px 18px 20px 18px;
            }
            .hero-title {
                font-size: 22px;
            }
            .hero-subtitle {
                font-size: 15px;
            }
            .section {
                padding: 24px 18px;
            }
            .section-title {
                font-size: 17px;
            }
            .paragraph {
                font-size: 15px;
                line-height: 1.65;
            }
            .event-details {
                padding: 16px 18px;
                margin: 20px 0;
            }
            .event-details strong,
            .event-details span {
                font-size: 14px;
            }
            .agenda-item {
                padding: 16px 16px;
                margin-bottom: 12px;
            }
            .agenda-time {
                font-size: 12px;
                padding: 5px 12px;
            }
            .agenda-title {
                font-size: 16px;
            }
            .agenda-description {
                font-size: 14px;
            }
            .custom-section {
                padding: 18px 20px;
                margin: 16px 0;
            }
            .custom-section-heading {
                font-size: 17px;
                margin-bottom: 12px;
            }
            .custom-section-content {
                font-size: 14px;
                line-height: 1.7;
            }
            .contact-box {
                padding: 18px 20px;
                margin-top: 20px;
            }
            .contact-box strong {
                font-size: 15px;
            }
            .contact-box a,
            .contact-box div {
                font-size: 14px;
            }
            .footer {
                padding: 24px 18px;
                font-size: 12px;
            }
        }
        
        /* Dark mode support - ensure readability */
        @media (prefers-color-scheme: dark) {
            .wrapper {
                background-color: #f5f5f5 !important;
            }
            .email-container {
                background: #ffffff !important;
            }
            .header,
            .hero,
            .section {
                background: #ffffff !important;
            }
        }
    </style>
</head>
<body>
    <div class="preheader">{{ $payload['preheader'] ?? '' }}</div>
    <div class="wrapper">
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <h1 class="header-logo">UMN <span>FESTIVAL</span> 2025</h1>
            </div>

            <!-- Hero Section -->
            @if(!empty($payload['hero_title']) || !empty($payload['hero_subtitle']) || !empty($payload['hero_image_url']))
            <div class="hero">
                @if(!empty($payload['hero_image_url']))
                    <img src="{{ $payload['hero_image_url'] }}" alt="{{ $payload['hero_title'] ?? 'UMN Festival 2025' }}" />
                @endif
                @if(!empty($payload['hero_title']))
                    <h2 class="hero-title">{{ $payload['hero_title'] }}</h2>
                @endif
                @if(!empty($payload['hero_subtitle']))
                    <p class="hero-subtitle">{{ $payload['hero_subtitle'] }}</p>
                @endif
            </div>
            @endif

            <!-- Intro Section -->
            @if(!empty($payload['intro_paragraph']) || !empty($payload['event_date']) || !empty($payload['event_venue']))
            <div class="section">
                @if(!empty($payload['intro_paragraph']))
                    <p class="paragraph">Hi {{ $recipientName }},</p>
                    <p class="paragraph">{{ $payload['intro_paragraph'] }}</p>
                @endif
                
                @if(!empty($payload['event_date']) || !empty($payload['event_venue']))
                <div class="event-details">
                    @if(!empty($payload['event_date']))
                        <strong>📅 {{ $payload['event_date'] }}</strong>
                    @endif
                    @if(!empty($payload['event_venue']))
                        <span>📍 {{ $payload['event_venue'] }}</span>
                    @endif
                </div>
                @endif
            </div>
            @endif

            <!-- Agenda Section -->
            @if(!empty($payload['agenda']) && is_array($payload['agenda']) && count($payload['agenda']) > 0)
            <div class="section">
                <h3 class="section-title">📅 Event Schedule</h3>
                <div class="agenda-list">
                    @foreach($payload['agenda'] as $slot)
                        @if(!empty($slot['title']))
                        <div class="agenda-item">
                            @if(!empty($slot['time']))
                                <div class="agenda-time">{{ $slot['time'] }}</div>
                            @endif
                            <div class="agenda-title">{{ $slot['title'] }}</div>
                            @if(!empty($slot['description']))
                                <div class="agenda-description">{{ $slot['description'] }}</div>
                            @endif
                        </div>
                        @endif
                    @endforeach
                </div>
            </div>
            @endif

            <!-- Custom Sections -->
            @if(!empty($payload['custom_sections']) && is_array($payload['custom_sections']))
                @foreach($payload['custom_sections'] as $section)
                    @if(!empty($section['heading']) || !empty($section['content']))
                    <div class="section">
                        <div class="custom-section">
                            @if(!empty($section['heading']))
                                <h3 class="custom-section-heading">{{ $section['heading'] }}</h3>
                            @endif
                            @if(!empty($section['content']))
                                <div class="custom-section-content">{{ $section['content'] }}</div>
                            @endif
                        </div>
                    </div>
                    @endif
                @endforeach
            @endif

            <!-- Closing Section -->
            @if(!empty($payload['closing_remark']))
            <div class="section">
                <p class="paragraph">{{ $payload['closing_remark'] }}</p>
                
                @if(!empty($payload['contact_email']) || !empty($payload['contact_phone']))
                <div class="contact-box">
                    <strong>Need Help?</strong>
                    @if(!empty($payload['contact_email']))
                        <div style="margin-bottom: 6px;">
                            📧 <a href="mailto:{{ $payload['contact_email'] }}">{{ $payload['contact_email'] }}</a>
                        </div>
                    @endif
                    @if(!empty($payload['contact_phone']))
                        <div>📞 {{ $payload['contact_phone'] }}</div>
                    @endif
                </div>
                @endif
            </div>
            @endif

            <!-- Footer -->
            <div class="footer">
                @if(!empty($payload['footer_note']))
                    <p style="margin: 0 0 12px 0;">{{ $payload['footer_note'] }}</p>
                @endif
                
                @if(!empty($payload['socials']) && is_array($payload['socials']))
                    <p style="margin: 0 0 12px 0;">
                        @foreach($payload['socials'] as $social)
                            @if(!empty($social['url']) && !empty($social['label']))
                                <a href="{{ $social['url'] }}" target="_blank" rel="noopener">{{ $social['label'] }}</a>
                                @if(!$loop->last) · @endif
                            @endif
                        @endforeach
                    </p>
                @endif
                
                <p style="margin: 0;">© {{ date('Y') }} UMN Festival. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>