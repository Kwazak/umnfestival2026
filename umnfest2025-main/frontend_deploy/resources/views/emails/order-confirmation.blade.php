<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Order Confirmation - UNIFY 2025</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 3px solid #FFC22F;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8px 8px 0 0;
            margin: -20px -20px 30px -20px;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: bold;
        }
        .header .subtitle {
            margin: 5px 0 20px 0;
            font-size: 16px;
            opacity: 0.9;
            font-weight: 500;
        }
        .success-badge {
            background-color: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            font-weight: bold;
            margin-top: 15px;
        }
        .content {
            padding: 0 10px;
        }
        .order-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #FFC22F;
        }
        .order-details h3 {
            margin-top: 0;
            color: #333;
            font-size: 18px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .detail-label {
            font-weight: 600;
            color: #555;
        }
        .detail-value {
            color: #333;
            text-align: right;
        }
        .attachment-notice {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .attachment-notice h4 {
            margin-top: 0;
            color: #0c5460;
        }
        .attachment-notice p {
            margin-bottom: 0;
            color: #0c5460;
        }
        .instructions {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .instructions h4 {
            margin-top: 0;
            color: #856404;
        }
        .instructions ul {
            padding-left: 20px;
            margin-bottom: 0;
            color: #856404;
        }
        .instructions li {
            margin-bottom: 8px;
        }
        .footer {
            text-align: center;
            padding: 30px 0 20px 0;
            border-top: 2px solid #e9ecef;
            margin-top: 40px;
            color: #6c757d;
            font-size: 14px;
        }
        .footer p {
            margin: 5px 0;
        }
        .contact-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .contact-info h4 {
            margin-top: 0;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ UNIFY 2025 ✨</h1>
            <p class="subtitle">November 22, 2025</p>
            <div class="success-badge">✅ Order Confirmed</div>
        </div>
        
        <div class="content">
            <p>Hello <strong>{{ $userName }}</strong>,</p>
            
            <p>Congratulations! Your payment is successful and your tickets for UNIFY 2025, the spectacular peak event of UMN Festival 2025, are now confirmed!</p>
            
            <div class="order-details">
                <h3>📋 Order Summary</h3>
        
                <!-- Order Information -->
                <div class="detail-row">
                    <span class="detail-label">Order:&nbsp;</span>
                    <span class="detail-value"><strong>#{{ $order->order_number }}</strong></span>
                </div>
                
                <!-- Customer Information -->
                <div class="detail-row">
                    <span class="detail-label">Name:&nbsp;</span>
                    <span class="detail-value"><strong>{{ $userName }}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:&nbsp;</span>
                    <span class="detail-value">{{ $order->buyer_email }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone Number:&nbsp;</span>
                    <span class="detail-value">{{ $order->buyer_phone }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:&nbsp;</span>
                    <span class="detail-value">{{ $order->updated_at->format('F j, Y, g:i A') }}</span>
                </div>
                
                <!-- Ticket Information -->
                <div class="detail-row">
                    <span class="detail-label">Tickets:&nbsp;</span>
                    <span class="detail-value"><strong>{{ $tickets->count() }} ticket{{ $tickets->count() > 1 ? 's' : '' }}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Price per Ticket:&nbsp;</span>
                    <span class="detail-value">Rp {{ number_format($order->amount / $order->ticket_quantity, 0, ',', '.') }}</span>
                </div>
                
                <!-- Pricing Breakdown -->
                <div class="detail-row">
                    <span class="detail-label">Subtotal:&nbsp;</span>
                    <span class="detail-value">Rp {{ number_format($order->amount, 0, ',', '.') }}</span>
                </div>
                
                @if($order->discount_amount > 0)
                <div class="detail-row">
                    <span class="detail-label">Discount:&nbsp;</span>
                    <span class="detail-value" style="color: #28a745;"><strong>-Rp {{ number_format($order->discount_amount, 0, ',', '.') }}</strong></span>
                </div>
                @endif
                
                <!-- Final Total -->
                <div class="detail-row">
                    <span class="detail-label"><strong>✅ Total Paid:&nbsp;</strong></span>
                    <span class="detail-value"><strong style="color: #28a745; font-size: 18px;">Rp {{ number_format($order->final_amount, 0, ',', '.') }}</strong></span>
                </div>
                
                <!-- Codes Used -->
                @if($referralCode)
                <div class="detail-row">
                    <span class="detail-label">Referral Code Used:&nbsp;</span>
                    <span class="detail-value"><strong>{{ $referralCode }}</strong></span>
                </div>
                @endif
                @if($order->discountCode)
                <div class="detail-row">
                    <span class="detail-label">Discount Code Used:&nbsp;</span>
                    <span class="detail-value"><strong>{{ $order->discountCode->code }}</strong> ({{ $order->discountCode->discount_percentage }}% off)</span>
                </div>
                @endif
            </div>

            <div class="attachment-notice">
                <h4>📎 PDF Tickets Attached</h4>
                <p>Your individual ticket PDFs are attached. Each PDF contains a unique QR code for entry to UNIFY 2025.</p>
            </div>

            <div class="instructions">
                <h4>📝 Important Instructions for UNIFY 2025</h4>
                <ul>
                    <li><strong>Bring Your E-Tickets:</strong> Present the attached PDF tickets (printed or on your phone) at the event entrance.</li>
                    <li><strong>QR Code Scanning:</strong> Each ticket has a unique QR code that will be scanned for a one-time entry.</li>
                    <li><strong>Non-Refundable:</strong> Tickets are non-refundable and non-transferable.</li>
                </ul>
            </div>

            <div class="contact-info">
                <h4>📞 Need Help?</h4>
                <p>If you have questions about your tickets or the event, please contact our support team:</p>
                <p><strong>WhatsApp:</strong> +62 813-1598-3958 (Chealsea)</p>
                <p><strong>Instagram:</strong> @umnfestival</p>
                <p><strong>Response Time:</strong> Within 24 hours</p>
            </div>

            <p>We're thrilled to see you at UNIFY 2025! Get ready for a spectacular night of music, art, and unforgettable moments at the peak of UMN Festival 2025.</p>
        </div>
        
        <div class="footer">
            <p><strong>UNIFY 2025 - UMN Festival</strong></p>
            <p>Universitas Multimedia Nusantara</p>
            <p>&copy; {{ date('Y') }} UMN Festival. All rights reserved.</p>
            <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply directly to this message.</p>
        </div>
    </div>
</body>
</html>