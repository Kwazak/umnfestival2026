<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\URL;

class SitemapController extends Controller
{
    public function index(): Response
    {
        // Static list (can be extended to query DB later)
        $urls = [
            ['loc' => URL::to('/'), 'priority' => '1.0', 'changefreq' => 'daily'],
            ['loc' => URL::to('/ticket'), 'priority' => '0.9', 'changefreq' => 'daily'],
            ['loc' => URL::to('/event'), 'priority' => '0.9', 'changefreq' => 'daily'],
            ['loc' => URL::to('/event/unveiling'), 'priority' => '0.7', 'changefreq' => 'weekly'],
            ['loc' => URL::to('/event/eulympic'), 'priority' => '0.7', 'changefreq' => 'weekly'],
            ['loc' => URL::to('/event/ucare'), 'priority' => '0.7', 'changefreq' => 'weekly'],
            ['loc' => URL::to('/event/ulympic'), 'priority' => '0.7', 'changefreq' => 'weekly'],
            ['loc' => URL::to('/event/unify'), 'priority' => '0.7', 'changefreq' => 'weekly'],
            ['loc' => URL::to('/merchandise'), 'priority' => '0.6', 'changefreq' => 'weekly'],
            ['loc' => URL::to('/about'), 'priority' => '0.5', 'changefreq' => 'monthly'],
        ];

        $lastmod = now()->toAtomString();

        $xml = view('sitemap.xml', [
            'urls' => $urls,
            'lastmod' => $lastmod,
        ])->render();

        return new Response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }
}
