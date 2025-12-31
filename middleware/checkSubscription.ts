import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

/**
 * Middleware to check if user has access (Pro or within free tier limits)
 */
export async function checkSubscriptionAccess(
    userId: string,
    actionType: 'analyze' | 'describe' | 'refine' | 'convert' | 'compress'
): Promise<{ allowed: boolean; reason?: string; isPro: boolean }> {
    try {
        // Check if user has Pro subscription
        const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

        const isPro = subscription?.subscription_status === 'pro' &&
            (!subscription.expires_at || new Date(subscription.expires_at) > new Date());

        if (isPro) {
            return { allowed: true, isPro: true };
        }

        // Check free tier usage
        const today = new Date().toISOString().split('T')[0];
        const { data: usage } = await supabase
            .from('usage_tracking')
            .select('count')
            .eq('user_id', userId)
            .eq('action_type', actionType)
            .eq('date', today)
            .single();

        const usedToday = usage?.count || 0;

        const FREE_LIMIT = 3;

        if (usedToday >= FREE_LIMIT) {
            return {
                allowed: false,
                reason: `Free tier limit reached (${FREE_LIMIT} uses per day). Upgrade to Pro for unlimited access.`,
                isPro: false
            };
        }

        // Increment usage for free users
        await incrementUsage(userId, actionType);

        return { allowed: true, isPro: false };
    } catch (err) {
        console.error('Subscription check error:', err);
        return { allowed: false, reason: 'Failed to verify subscription', isPro: false };
    }
}

async function incrementUsage(userId: string, actionType: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
        .from('usage_tracking')
        .select('id, count')
        .eq('user_id', userId)
        .eq('action_type', actionType)
        .eq('date', today)
        .single();

    if (existing) {
        await supabase
            .from('usage_tracking')
            .update({ count: existing.count + 1 })
            .eq('id', existing.id);
    } else {
        await supabase
            .from('usage_tracking')
            .insert({
                user_id: userId,
                action_type: actionType,
                date: today,
                count: 1
            });
    }
}
