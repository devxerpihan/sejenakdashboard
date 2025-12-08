import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('Received Midtrans webhook:', JSON.stringify(payload, null, 2));

    // 1. Verify Midtrans Signature
    const signatureKey = payload.signature_key;
    const orderId = payload.order_id;
    const statusCode = payload.status_code;
    const grossAmount = payload.gross_amount;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      console.error('MIDTRANS_SERVER_KEY is not set');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    const shasum = crypto.createHash('sha512');
    shasum.update(`${orderId}${statusCode}${grossAmount}${serverKey}`);
    const expectedSignature = shasum.digest('hex');

    if (signatureKey !== expectedSignature) {
      console.error('Invalid signature');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    // 2. Process the notification
    const transactionStatus = payload.transaction_status;
    const fraudStatus = payload.fraud_status;

    let paymentStatus = 'pending';
    let bookingStatus = 'pending';

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept') {
        paymentStatus = 'paid';
        bookingStatus = 'confirmed';
      }
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      paymentStatus = 'failed';
      bookingStatus = 'cancelled';
    }

    // 3. Update booking in Supabase
    const { data: existingBooking, error: findError } = await supabase
      .from('bookings')
      .select('id, payment_status')
      .eq('order_id', orderId)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116: no rows found
      console.error('Error finding booking:', findError);
      return NextResponse.json({ message: 'Error finding booking' }, { status: 500 });
    }

    if (existingBooking && existingBooking.payment_status === 'paid') {
      console.log(`Order ${orderId} has already been marked as paid. Skipping update.`);
      return NextResponse.json({ message: 'Webhook processed successfully (already paid)' });
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ payment_status: paymentStatus, status: bookingStatus, updated_at: new Date().toISOString() })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return NextResponse.json({ message: 'Error updating booking' }, { status: 500 });
    }

    console.log(`Booking ${orderId} updated to ${paymentStatus}`);
    return NextResponse.json({ message: 'Webhook processed successfully' });

  } catch (e: any) {
    console.error('Error processing webhook:', e);
    return NextResponse.json({ message: `Webhook error: ${e.message}` }, { status: 400 });
  }
}
