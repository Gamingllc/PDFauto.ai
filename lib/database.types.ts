// Database types for Supabase tables
export interface UserSubscription {
    id: string;
    user_id: string;
    subscription_status: 'free' | 'pro';
    paypal_subscription_id: string | null;
    paypal_payer_id: string | null;
    started_at: string;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface UsageTracking {
    id: string;
    user_id: string;
    action_type: 'analyze' | 'describe' | 'refine' | 'convert' | 'compress';
    date: string;
    count: number;
    created_at: string;
}
