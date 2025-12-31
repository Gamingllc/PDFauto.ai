import paypal from '@paypal/checkout-server-sdk';
import { createClient } from '@supabase/supabase-js';

const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID!,
    process.env.PAYPAL_SECRET!
);

const client = new paypal.core.PayPalHttpClient(environment);

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { orderId, userId } = req.body;

        if (!orderId || !userId) {
            return res.status(400).json({ error: 'Order ID and User ID required' });
        }

        // Capture the payment
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        const capture = await client.execute(request);

        if (capture.result.status === 'COMPLETED') {
            // Payment successful, update subscription in Supabase
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

            const { error } = await supabase
                .from('user_subscriptions')
                .upsert({
                    user_id: userId,
                    subscription_status: 'pro',
                    paypal_subscription_id: orderId,
                    paypal_payer_id: capture.result.payer.payer_id,
                    expires_at: expiresAt.toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            return res.status(200).json({
                success: true,
                message: 'Payment verified and subscription activated'
            });
        } else {
            return res.status(400).json({ error: 'Payment not completed' });
        }

    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ error: 'Failed to verify payment' });
    }
}
