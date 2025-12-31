import { supabase } from './supabase';
import type { UserSubscription } from './database.types';

/**
 * Check if a user has an active Pro subscription
 */
export async function checkUserSubscription(userId: string): Promise<{
    isPro: boolean;
    subscription: UserSubscription | null;
}> {
    try {
        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            // No subscription found, user is free tier
            return { isPro: false, subscription: null };
        }

        // Check if subscription is active
        const isPro = data.subscription_status === 'pro' &&
            (!data.expires_at || new Date(data.expires_at) > new Date());

        return { isPro, subscription: data };
    } catch (err) {
        console.error('Error checking subscription:', err);
        return { isPro: false, subscription: null };
    }
}

/**
 * Create or update user subscription after payment
 */
export async function upsertSubscription(
    userId: string,
    paypalSubscriptionId: string,
    paypalPayerId: string
): Promise<UserSubscription | null> {
    try {
        // Set expiration to 30 days from now for monthly subscription
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const { data, error } = await supabase
            .from('user_subscriptions')
            .upsert({
                user_id: userId,
                subscription_status: 'pro',
                paypal_subscription_id: paypalSubscriptionId,
                paypal_payer_id: paypalPayerId,
                expires_at: expiresAt.toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error upserting subscription:', err);
        return null;
    }
}

/**
 * Check daily usage for free tier users
 */
export async function checkDailyUsage(
    userId: string,
    actionType: 'analyze' | 'describe' | 'refine' | 'convert' | 'compress'
): Promise<{ canUse: boolean; usedToday: number; limit: number }> {
    const FREE_TIER_LIMIT = 3; // 3 uses per day

    try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('usage_tracking')
            .select('count')
            .eq('user_id', userId)
            .eq('action_type', actionType)
            .eq('date', today)
            .single();

        const usedToday = data?.count || 0;
        return {
            canUse: usedToday < FREE_TIER_LIMIT,
            usedToday,
            limit: FREE_TIER_LIMIT
        };
    } catch (err) {
        // No usage found, user can proceed
        return { canUse: true, usedToday: 0, limit: FREE_TIER_LIMIT };
    }
}

/**
 * Increment usage count for free tier tracking
 */
export async function incrementUsage(
    userId: string,
    actionType: 'analyze' | 'describe' | 'refine' | 'convert' | 'compress'
): Promise<void> {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Try to increment existing record
        const { data: existing } = await supabase
            .from('usage_tracking')
            .select('id, count')
            .eq('user_id', userId)
            .eq('action_type', actionType)
            .eq('date', today)
            .single();

        if (existing) {
            // Update existing
            await supabase
                .from('usage_tracking')
                .update({ count: existing.count + 1 })
                .eq('id', existing.id);
        } else {
            // Insert new
            await supabase
                .from('usage_tracking')
                .insert({
                    user_id: userId,
                    action_type: actionType,
                    date: today,
                    count: 1
                });
        }
    } catch (err) {
        console.error('Error incrementing usage:', err);
    }
}
