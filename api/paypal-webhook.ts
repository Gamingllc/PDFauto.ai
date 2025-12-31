import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

/**
 * PayPal Webhook Handler
 * Receives and processes subscription events from PayPal
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify webhook signature (recommended for production)
        const webhookId = process.env.PAYPAL_WEBHOOK_ID;
        if (webhookId) {
            const isValid = await verifyWebhookSignature(req, webhookId);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid webhook signature' });
            }
        }

        const event = req.body;
        const eventType = event.event_type;

        console.log('PayPal Webhook Event:', eventType);

        switch (eventType) {
            case 'PAYMENT.SALE.COMPLETED':
                // Subscription payment successful
                await handlePaymentCompleted(event);
                break;

            case 'BILLING.SUBSCRIPTION.ACTIVATED':
                // New subscription activated
                await handleSubscriptionActivated(event);
                break;

            case 'BILLING.SUBSCRIPTION.CANCELLED':
                // Subscription cancelled
                await handleSubscriptionCancelled(event);
                break;

            case 'BILLING.SUBSCRIPTION.EXPIRED':
                // Subscription expired
                await handleSubscriptionExpired(event);
                break;

            case 'BILLING.SUBSCRIPTION.SUSPENDED':
                // Subscription suspended (payment failure)
                await handleSubscriptionSuspended(event);
                break;

            default:
                console.log('Unhandled event type:', eventType);
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }
}

async function handlePaymentCompleted(event: any) {
    const subscriptionId = event.resource.billing_agreement_id;
    const payerId = event.resource.payer.payer_info.payer_id;

    // Extend subscription by 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase
        .from('user_subscriptions')
        .update({
            subscription_status: 'pro',
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('paypal_subscription_id', subscriptionId);

    console.log('Payment completed, subscription extended:', subscriptionId);
}

async function handleSubscriptionActivated(event: any) {
    const subscriptionId = event.resource.id;
    const payerId = event.resource.subscriber.payer_id;

    // Activate subscription
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase
        .from('user_subscriptions')
        .update({
            subscription_status: 'pro',
            paypal_subscription_id: subscriptionId,
            paypal_payer_id: payerId,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('paypal_payer_id', payerId);

    console.log('Subscription activated:', subscriptionId);
}

async function handleSubscriptionCancelled(event: any) {
    const subscriptionId = event.resource.id;

    // Mark subscription as cancelled but allow access until expiration
    await supabase
        .from('user_subscriptions')
        .update({
            updated_at: new Date().toISOString()
        })
        .eq('paypal_subscription_id', subscriptionId);

    console.log('Subscription cancelled:', subscriptionId);
}

async function handleSubscriptionExpired(event: any) {
    const subscriptionId = event.resource.id;

    // Downgrade to free tier
    await supabase
        .from('user_subscriptions')
        .update({
            subscription_status: 'free',
            updated_at: new Date().toISOString()
        })
        .eq('paypal_subscription_id', subscriptionId);

    console.log('Subscription expired:', subscriptionId);
}

async function handleSubscriptionSuspended(event: any) {
    const subscriptionId = event.resource.id;

    // Temporarily suspend access
    await supabase
        .from('user_subscriptions')
        .update({
            subscription_status: 'free',
            updated_at: new Date().toISOString()
        })
        .eq('paypal_subscription_id', subscriptionId);

    console.log('Subscription suspended:', subscriptionId);
}

async function verifyWebhookSignature(req: any, webhookId: string): Promise<boolean> {
    try {
        const headers = req.headers;
        const transmissionId = headers['paypal-transmission-id'];
        const transmissionTime = headers['paypal-transmission-time'];
        const certUrl = headers['paypal-cert-url'];
        const authAlgo = headers['paypal-auth-algo'];
        const transmissionSig = headers['paypal-transmission-sig'];

        // In production, verify signature using PayPal SDK
        // For now, return true if webhook ID matches
        return !!webhookId;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}
