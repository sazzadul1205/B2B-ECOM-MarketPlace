<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Primary Meta Tags -->
    <title inertia>{{ config('app.name', 'Laravel') }} - B2B Procurement Platform</title>
    <meta name="title" content="{{ config('app.name', 'Laravel') }} - B2B Procurement Platform">
    <meta name="description"
        content="Enterprise B2B platform connecting buyers with verified suppliers. Streamline procurement with RFQ management, real-time messaging, and order processing.">
    <meta name="keywords"
        content="B2B, procurement, RFQ, supplier management, e-commerce, business platform, supply chain">
    <meta name="author" content="{{ config('app.name') }}">
    <meta name="robots" content="index, follow">
    <meta name="language" content="English">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="{{ config('app.name', 'Laravel') }} - B2B Procurement Platform">
    <meta property="og:description"
        content="Enterprise B2B platform connecting buyers with verified suppliers. Streamline procurement with RFQ management, real-time messaging, and order processing.">
    <meta property="og:image" content="{{ asset('images/og-image.jpg') }}">
    <meta property="og:site_name" content="{{ config('app.name') }}">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{{ url()->current() }}">
    <meta name="twitter:title" content="{{ config('app.name', 'Laravel') }} - B2B Procurement Platform">
    <meta name="twitter:description"
        content="Enterprise B2B platform connecting buyers with verified suppliers. Streamline procurement with RFQ management, real-time messaging, and order processing.">
    <meta name="twitter:image" content="{{ asset('images/twitter-image.jpg') }}">

    <!-- Security & Compatibility -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Mobile App Capabilities -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="{{ config('app.name') }}">
    <meta name="application-name" content="{{ config('app.name') }}">
    <meta name="theme-color" content="#4F46E5">
    <meta name="msapplication-TileColor" content="#4F46E5">
    <meta name="msapplication-TileImage" content="{{ asset('images/ms-icon-144x144.png') }}">

    <!-- Favicon & App Icons -->
    <link rel="apple-touch-icon" sizes="57x57" href="{{ asset('b2b.png') }}">
    <link rel="apple-touch-icon" sizes="60x60" href="{{ asset('b2b.png') }}">
    <link rel="apple-touch-icon" sizes="72x72" href="{{ asset('b2b.png') }}">
    <link rel="apple-touch-icon" sizes="76x76" href="{{ asset('b2b.png') }}">
    <link rel="apple-touch-icon" sizes="114x114" href="{{ asset('b2b.png') }}">
    <link rel="apple-touch-icon" sizes="120x120" href="{{ asset('b2b.png') }}">
    <link rel="apple-touch-icon" sizes="144x144" href="{{ asset('b2b.png') }}">
    <link rel="apple-touch-icon" sizes="152x152" href="{{ asset('b2b.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('b2b.png') }}">
    <link rel="icon" type="image/png" sizes="192x192" href="{{ asset('b2b.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('b2b.png') }}">
    <link rel="icon" type="image/png" sizes="96x96" href="{{ asset('b2b.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('b2b.png') }}">
    <link rel="manifest" href="{{ asset('manifest.json') }}">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Canonical URL -->
    <link rel="canonical" href="{{ url()->current() }}">

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead

    <!-- Additional Meta Tags (Optional - can be conditionally added) -->
    @hasSection('meta')
        @yield('meta')
    @endif
</head>

<body class="font-sans antialiased">
    @inertia

    <!-- Browser Compatibility Check (Optional) -->
    <script>
        // Check for older browsers and show warning if needed
        if (!window.Promise || !window.fetch || !window.Symbol) {
            console.warn('This browser may not fully support all features. Please consider updating your browser.');
        }
    </script>
</body>

</html>
