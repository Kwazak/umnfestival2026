<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\ReferralCode;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferralCodeUsesTest extends TestCase
{
    use RefreshDatabase;

    public function test_referral_code_uses_count_updates_when_tickets_become_valid()
    {
        // Create a referral code
        $referralCode = ReferralCode::create([
            'code' => 'TEST001',
            'panitia_name' => 'Test Panitia',
            'uses' => 0,
            'is_active' => true
        ]);

        // Create an order with the referral code
        $order = Order::create([
            'buyer_name' => 'Test Buyer',
            'buyer_email' => 'test@example.com',
            'buyer_phone' => '081234567890',
            'category' => 'external',
            'ticket_quantity' => 3,
            'amount' => 150000,
            'referral_code_id' => $referralCode->id,
            'order_number' => 'ORD-TEST001',
            'status' => 'paid'
        ]);

        // Create tickets with pending status initially
        $ticket1 = Ticket::create([
            'order_id' => $order->id,
            'ticket_code' => 'TKT001',
            'status' => 'pending'
        ]);

        $ticket2 = Ticket::create([
            'order_id' => $order->id,
            'ticket_code' => 'TKT002',
            'status' => 'pending'
        ]);

        $ticket3 = Ticket::create([
            'order_id' => $order->id,
            'ticket_code' => 'TKT003',
            'status' => 'pending'
        ]);

        // Refresh referral code to get updated uses count
        $referralCode->refresh();
        
        // Should be 0 because all tickets are pending
        $this->assertEquals(0, $referralCode->uses);

        // Update tickets to valid status
        $ticket1->update(['status' => 'valid']);
        $ticket2->update(['status' => 'valid']);

        // Refresh referral code
        $referralCode->refresh();
        
        // Should be 2 because 2 tickets are valid
        $this->assertEquals(2, $referralCode->uses);

        // Update one ticket to used status
        $ticket1->update(['status' => 'used']);

        // Refresh referral code
        $referralCode->refresh();
        
        // Should still be 2 because both valid and used tickets count
        $this->assertEquals(2, $referralCode->uses);

        // Update the third ticket to valid
        $ticket3->update(['status' => 'valid']);

        // Refresh referral code
        $referralCode->refresh();
        
        // Should be 3 because all tickets are now valid/used
        $this->assertEquals(3, $referralCode->uses);
    }

    public function test_referral_code_uses_count_with_multiple_orders()
    {
        // Create a referral code
        $referralCode = ReferralCode::create([
            'code' => 'TEST002',
            'panitia_name' => 'Test Panitia 2',
            'uses' => 0,
            'is_active' => true
        ]);

        // Create first order with 2 tickets
        $order1 = Order::create([
            'buyer_name' => 'Test Buyer 1',
            'buyer_email' => 'test1@example.com',
            'buyer_phone' => '081234567891',
            'category' => 'external',
            'ticket_quantity' => 2,
            'amount' => 100000,
            'referral_code_id' => $referralCode->id,
            'order_number' => 'ORD-TEST002-1',
            'status' => 'paid'
        ]);

        // Create second order with 3 tickets
        $order2 = Order::create([
            'buyer_name' => 'Test Buyer 2',
            'buyer_email' => 'test2@example.com',
            'buyer_phone' => '081234567892',
            'category' => 'external',
            'ticket_quantity' => 3,
            'amount' => 150000,
            'referral_code_id' => $referralCode->id,
            'order_number' => 'ORD-TEST002-2',
            'status' => 'paid'
        ]);

        // Create tickets for first order (all valid)
        Ticket::create(['order_id' => $order1->id, 'ticket_code' => 'TKT1-1', 'status' => 'valid']);
        Ticket::create(['order_id' => $order1->id, 'ticket_code' => 'TKT1-2', 'status' => 'valid']);

        // Create tickets for second order (2 valid, 1 pending)
        Ticket::create(['order_id' => $order2->id, 'ticket_code' => 'TKT2-1', 'status' => 'valid']);
        Ticket::create(['order_id' => $order2->id, 'ticket_code' => 'TKT2-2', 'status' => 'valid']);
        Ticket::create(['order_id' => $order2->id, 'ticket_code' => 'TKT2-3', 'status' => 'pending']);

        // Refresh referral code
        $referralCode->refresh();
        
        // Should be 4 (2 from order1 + 2 valid from order2)
        $this->assertEquals(4, $referralCode->uses);
    }

    public function test_recalculate_uses_method()
    {
        // Create a referral code with incorrect uses count
        $referralCode = ReferralCode::create([
            'code' => 'TEST003',
            'panitia_name' => 'Test Panitia 3',
            'uses' => 999, // Incorrect count
            'is_active' => true
        ]);

        // Create an order
        $order = Order::create([
            'buyer_name' => 'Test Buyer',
            'buyer_email' => 'test@example.com',
            'buyer_phone' => '081234567890',
            'category' => 'external',
            'ticket_quantity' => 2,
            'amount' => 100000,
            'referral_code_id' => $referralCode->id,
            'order_number' => 'ORD-TEST003',
            'status' => 'paid'
        ]);

        // Create tickets
        Ticket::create(['order_id' => $order->id, 'ticket_code' => 'TKT1', 'status' => 'valid']);
        Ticket::create(['order_id' => $order->id, 'ticket_code' => 'TKT2', 'status' => 'used']);

        // Manually recalculate uses
        $newUses = $referralCode->recalculateUses();

        // Should return 2 and update the model
        $this->assertEquals(2, $newUses);
        $this->assertEquals(2, $referralCode->fresh()->uses);
    }
}