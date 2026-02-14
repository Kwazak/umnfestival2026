<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Processing Payment - UMN Festival 2025</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        h1 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        
        p {
            color: #666;
            margin-bottom: 1.5rem;
            line-height: 1.5;
        }
        
        .status-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            font-size: 0.9rem;
            color: #555;
        }
        
        .redirect-info {
            font-size: 0.8rem;
            color: #888;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h1>Processing Payment Status</h1>
        <p>{{ $message ?? 'Processing your payment status. Please wait...' }}</p>
        
        @if($order_id)
        <div class="status-info">
            <strong>Order ID:</strong> {{ $order_id }}<br>
            @if($transaction_status)
            <strong>Status:</strong> {{ ucfirst($transaction_status) }}
            @endif
        </div>
        @endif
        
        <div class="redirect-info">
            You will be redirected automatically in <span id="countdown">3</span> seconds...
        </div>
    </div>

    <script>
        // Auto-redirect after 2 seconds (faster to prevent users from seeing Midtrans pages)
        let countdown = 2;
        const countdownElement = document.getElementById('countdown');
        const redirectUrl = '{{ $redirect_url ?? "/payment/pending" }}';
        
        console.log('🔄 Payment status handler loaded, redirecting to:', redirectUrl);
        
        const timer = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(timer);
                console.log('🚀 Auto-redirecting to:', redirectUrl);
                window.location.href = redirectUrl;
            }
        }, 1000);
        
        // Also handle immediate redirect if user clicks anywhere
        document.addEventListener('click', () => {
            console.log('👆 User clicked, immediate redirect to:', redirectUrl);
            clearInterval(timer);
            window.location.href = redirectUrl;
        });
        
        // Prevent back button from going to Midtrans
        history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', function(event) {
            console.log('🚫 Preventing back navigation to Midtrans');
            history.pushState(null, null, window.location.href);
        });
        
        // Additional safety: If this page is loaded in an iframe (Midtrans sometimes does this), break out
        if (window.top !== window.self) {
            console.log('🚫 Breaking out of iframe');
            window.top.location.href = redirectUrl;
        }
        
        // Override any potential external redirects
        const originalLocation = window.location.href;
        const checkRedirectInterval = setInterval(() => {
            if (window.location.href !== originalLocation && 
                !window.location.href.includes(window.location.origin)) {
                console.log('🚫 Intercepted external redirect attempt');
                clearInterval(checkRedirectInterval);
                window.location.href = redirectUrl;
            }
        }, 100);
        
        // Clear the interval after 10 seconds
        setTimeout(() => {
            clearInterval(checkRedirectInterval);
        }, 10000);
        
        // Log order information if available
        @if($order_id)
        console.log('📋 Order ID:', '{{ $order_id }}');
        @endif
        @if($transaction_status)
        console.log('📊 Transaction Status:', '{{ $transaction_status }}');
        @endif
    </script>
</body>
</html>