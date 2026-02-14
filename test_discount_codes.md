# Discount Code System Test Guide

## Overview
The discount code system has been successfully implemented for UMN Fest 2025. This guide provides testing instructions to verify all functionality.

## Features Implemented

### 1. **Discount Code Model & Database**
- ✅ `DiscountCode` model with relationships
- ✅ Database migrations for discount codes and order relationships
- ✅ Seeded with sample discount codes (SAVE15, EARLYBIRD, STUDENT10, FESTIVAL25)

### 2. **API Endpoints**
- ✅ `POST /api/discount-codes/validate` - Validate discount code
- ✅ `GET /api/discount-codes` - List all discount codes (admin)
- ✅ `POST /api/discount-codes` - Create new discount code (admin)
- ✅ `PUT /api/discount-codes/{id}` - Update discount code (admin)
- ✅ `DELETE /api/discount-codes/{id}` - Delete discount code (admin)
- ✅ `POST /api/discount-codes/recalculate-usage` - Recalculate usage counts

### 3. **Frontend Integration**
- ✅ Discount code input field on ticket purchase page
- ✅ Real-time validation with visual feedback
- ✅ Order summary shows discount amount
- ✅ Admin panel for managing discount codes
- ✅ Order details show discount information

### 4. **Order Processing**
- ✅ Discount validation during order creation
- ✅ Race condition prevention (re-check availability)
- ✅ Automatic usage count increment on payment success
- ✅ Email confirmation includes discount details

## Test Cases

### Test 1: Validate Discount Code (Frontend)
1. Go to `/ticket` page
2. Fill in customer details
3. Enter discount code: `SAVE15`
4. Click "Apply"
5. **Expected**: Shows "15% discount applied! Save Rp X"

### Test 2: Create Order with Discount
1. Complete ticket purchase with discount code
2. **Expected**: Order shows original amount, discount amount, and final amount

### Test 3: Admin Discount Management
1. Go to `/admin/discount-codes`
2. View existing discount codes
3. Create new discount code
4. Edit existing discount code
5. **Expected**: All CRUD operations work correctly

### Test 4: Usage Count Tracking
1. Complete a purchase with discount code
2. Check admin panel
3. **Expected**: Usage count increments after payment success

### Test 5: Quota Limits
1. Use a discount code until quota is reached
2. Try to use it again
3. **Expected**: "Kode diskon sudah mencapai batas penggunaan" error

## Sample Discount Codes (Seeded)
- `SAVE15` - 15% off, quota: 100
- `EARLYBIRD` - 20% off, quota: 50  
- `STUDENT10` - 10% off, quota: 200
- `FESTIVAL25` - 25% off, quota: 25
- `EXPIRED` - 30% off, quota: 10 (inactive)

## API Testing with cURL

### Validate Discount Code
```bash
curl -X POST http://localhost:8000/api/discount-codes/validate \
  -H "Content-Type: application/json" \
  -d '{"code": "SAVE15", "amount": 100000}'
```

### Create Order with Discount
```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_name": "Test User",
    "buyer_email": "test@example.com",
    "buyer_phone": "081234567890",
    "quantity": 1,
    "category": "external",
    "discount_code": "SAVE15"
  }'
```

## Security Features
- ✅ Discount codes are case-insensitive (converted to uppercase)
- ✅ Race condition prevention with atomic checks
- ✅ Quota enforcement at database level
- ✅ Usage count based on paid orders only
- ✅ Cannot delete codes that have been used

## Email Integration
- ✅ Order confirmation emails show discount details
- ✅ Subtotal, discount amount, and final total displayed
- ✅ Discount code name and percentage shown

## Admin Features
- ✅ Visual usage progress bars
- ✅ Bulk usage recalculation
- ✅ Cannot reduce quota below current usage
- ✅ Cannot delete used discount codes

## Next Steps (Optional Enhancements)
1. **Expiration Dates**: Add start/end dates for discount codes
2. **User Restrictions**: Limit codes to specific user categories
3. **Minimum Purchase**: Set minimum order amount for discount codes
4. **Analytics**: Track discount code performance metrics
5. **Bulk Import**: CSV import for multiple discount codes

## Troubleshooting
- If discount validation fails, check database connection
- If usage counts are incorrect, use the recalculate function
- Check Laravel logs for detailed error messages
- Ensure migrations have been run: `php artisan migrate`