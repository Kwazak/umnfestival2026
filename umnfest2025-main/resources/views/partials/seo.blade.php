@php
  // Base dynamic variables (these can be overridden per page via Inertia Head or section variables)
  $siteName = 'UMN Festival 2025';
  $brand = 'UMN Festival';
  $primaryKeywords = 'UMN Festival, UMN Festival 2025, Universitas Multimedia Nusantara, UMN, umnfestival, umnfestival.com, umnfestival2025, Festival tahunan terbesar di Universitas Multimedia Nusantara, festival kampus UMN, konser kampus UMN, tiket UMN Festival, jadwal UMN Festival, kompetisi UMN Festival, Forge The Bonds Light Up The Future, #ForgeTheBondsLightUpTheFuture, unify 2025, forgethebondslightupthefuture';
  $defaultDescription = 'UMN Festival 2025 (#ForgeTheBondsLightUpTheFuture) adalah festival tahunan terbesar di Universitas Multimedia Nusantara yang menghadirkan konser, kompetisi, exhibition, community showcase, dan experience interaktif. Bergabung dan rayakan kreativitas, inovasi, dan persatuan di UMN.';
  $defaultTitle = $siteName . ' | Festival Tahunan Terbesar di Universitas Multimedia Nusantara';
  $pageTitle = $pageTitle ?? $defaultTitle;
  $pageDescription = $pageDescription ?? $defaultDescription;
  $pageKeywords = $pageKeywords ?? $primaryKeywords;
  // Force canonical to production domain if in production
  $productionDomain = 'https://umnfestival.com';
  $currentUrl = url()->current();
  if (app()->environment('production')) {
    // Replace host with production domain (basic normalization)
    $parsed = parse_url($currentUrl);
    $path = $parsed['path'] ?? '/';
    $query = isset($parsed['query']) ? ('?'.$parsed['query']) : '';
    $canonical = $canonical ?? rtrim($productionDomain, '/').$path.$query;
  } else {
    $canonical = $canonical ?? $currentUrl;
  }
  $image = $image ?? asset('imgs/LogoUfest2.svg');
  $publishedTime = $publishedTime ?? '2025-01-01T09:00:00+07:00';
  $modifiedTime = $modifiedTime ?? now()->toIso8601String();
  $eventStart = '2025-05-01T09:00:00+07:00';
  $eventEnd = '2025-05-31T23:00:00+07:00';
  $orgLogo = asset('imgs/LogoUfest2.svg');
  $twitterHandle = '@umnfestival'; // adjust if actual
@endphp

<!-- Primary Meta Tags -->
<title>{{ $pageTitle }}</title>
<meta name="title" content="{{ $pageTitle }}" />
<meta name="description" content="{{ $pageDescription }}" />
<meta name="keywords" content="{{ $pageKeywords }}" />
<meta name="author" content="UMN Festival Team" />
<meta name="language" content="id" />
<meta name="geo.region" content="ID-BT" />
<meta name="geo.placename" content="Tangerang" />
<meta name="geo.position" content="-6.2576;106.6179" />
<meta name="ICBM" content="-6.2576, 106.6179" />
<link rel="canonical" href="{{ $canonical }}" />
<link rel="alternate" hreflang="id" href="{{ $canonical }}" />
<link rel="alternate" hreflang="en" href="{{ $canonical }}" />
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
<meta name="googlebot" content="index, follow" />
<meta name="bingbot" content="index, follow" />

<!-- Open Graph / Facebook -->
<meta property="og:locale" content="id_ID" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="{{ $brand }}" />
<meta property="og:title" content="{{ $pageTitle }}" />
<meta property="og:description" content="{{ $pageDescription }}" />
<meta property="og:url" content="{{ $canonical }}" />
<meta property="og:image" content="{{ $image }}" />
<meta property="og:image:alt" content="{{ $brand }}" />
<meta property="og:image:type" content="image/svg+xml" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:updated_time" content="{{ $modifiedTime }}" />
<meta property="og:see_also" content="https://instagram.com/umnfestival" />
<meta property="og:see_also" content="https://www.youtube.com/@umnfestival" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="{{ $twitterHandle }}" />
<meta name="twitter:creator" content="{{ $twitterHandle }}" />
<meta name="twitter:title" content="{{ $pageTitle }}" />
<meta name="twitter:description" content="{{ $pageDescription }}" />
<meta name="twitter:image" content="{{ $image }}" />
<meta name="twitter:image:alt" content="{{ $brand }}" />
<meta name="twitter:domain" content="umnfestival.com" />
<meta name="twitter:url" content="{{ $canonical }}" />

<!-- Preconnect & Performance Hints (adjust as needed) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Structured Data: Organization -->
<script type="application/ld+json">
{!! json_encode([
  '@context' => 'https://schema.org',
  '@type' => 'Organization',
  'name' => 'UMN Festival',
  'url' => url('/'),
  'logo' => $orgLogo,
  'url' => $productionDomain,
  'sameAs' => [
    'https://instagram.com/umnfestival',
    'https://www.youtube.com/@umnfestival',
  ],
  'description' => $defaultDescription
], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT) !!}
</script>

<!-- Structured Data: Event -->
<script type="application/ld+json">
{!! json_encode([
  '@context' => 'https://schema.org',
  '@type' => 'Festival',
  'name' => 'UMN Festival 2025',
  'startDate' => $eventStart,
  'endDate' => $eventEnd,
  'eventAttendanceMode' => 'https://schema.org/MixedEventAttendanceMode',
  'eventStatus' => 'https://schema.org/EventScheduled',
  'location' => [
    '@type' => 'Place',
    'name' => 'Universitas Multimedia Nusantara',
    'address' => [
      '@type' => 'PostalAddress',
      'streetAddress' => 'Jl. Scientia Boulevard, Gading Serpong',
      'addressLocality' => 'Tangerang',
      'postalCode' => '15811',
      'addressRegion' => 'Banten',
      'addressCountry' => 'ID'
    ]
  ],
  'image' => [$image],
  'description' => $defaultDescription,
  'organizer' => [
    '@type' => 'Organization',
    'name' => 'UMN Festival Committee',
    'url' => $productionDomain
  ],
  'offers' => [
    '@type' => 'Offer',
    'price' => '0',
    'priceCurrency' => 'IDR',
    'availability' => 'https://schema.org/InStock',
    'validFrom' => $publishedTime,
    'url' => $productionDomain
  ]
], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT) !!}
</script>

<!-- Additional SEO Enhancements -->
<meta name="theme-color" content="#B42129" />
<link rel="icon" type="image/svg+xml" href="{{ asset('imgs/LogoUfest2.svg') }}" />
<link rel="apple-touch-icon" href="{{ asset('imgs/LogoUfest2.svg') }}" />

<!-- Optional: Future dynamic injection point -->
@stack('structured-data')
