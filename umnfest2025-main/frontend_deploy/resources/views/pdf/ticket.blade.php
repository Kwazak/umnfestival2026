<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket - {{ $ticketCode }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .ticket-container {
            background: white;
            margin: 20px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 18px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .ticket-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        .info-label {
            font-weight: bold;
            color: #555;
            text-transform: uppercase;
            font-size: 12px;
        }
        .info-value {
            color: #333;
            font-size: 14px;
            text-align: right;
        }
        .qr-section {
            text-align: center;
            margin: 40px 0;
        }
        .qr-code {
            display: inline-block;
            padding: 20px;
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
        }
        .ticket-code-large {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            text-align: center;
            margin: 20px 0;
            letter-spacing: 2px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="ticket-container">
        <!-- <div class="header">
            <h1>{{ $eventName }}</h1>
            <p>{{ $eventDate }} • {{ $eventLocation }}</p>
            <div class="category-badge">{{ $category }} TICKET</div>
        </div> -->
                    
        <div class="qr-code">
           <img src="{{ $qrCode }}" alt="QR Code for {{ $ticketCode }}" width="200" height="200">
        </div>
        <div class="ticket-code-large">{{ $ticketCode }}</div>
    </div>
</body>
</html>
