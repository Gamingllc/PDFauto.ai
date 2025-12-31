import React, { useState } from 'react';
import { X, Check, Zap, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        if (!user) {
            alert('Please sign in to upgrade');
            return;
        }

        setLoading(true);
        try {
            // Create PayPal subscription
            const response = await fetch('/api/create-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });

            const data = await response.json();

            if (data.approvalUrl) {
                // Redirect to PayPal for approval
                window.location.href = data.approvalUrl;
            } else {
                throw new Error('Failed to create subscription');
            }
        } catch (err) {
            console.error('Payment error:', err);
            alert('Payment failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-neutral-500" />
                </button>

                <div className="p-8 sm:p-12">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white mb-3">
                            Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Pro</span>
                        </h2>
                        <p className="text-neutral-500 text-lg">Unlock unlimited AI-powered document processing</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {/* Free Tier */}
                        <div className="p-8 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-neutral-200 dark:bg-neutral-800">
                                    <Zap className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Free</h3>
                                    <p className="text-3xl font-black text-neutral-900 dark:text-white mt-1">$0</p>
                                </div>
                            </div>

                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">3 uses per day</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Basic features</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">5MB file limit</span>
                                </li>
                            </ul>
                        </div>

                        {/* Pro Tier */}
                        <div className="p-8 rounded-2xl border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 relative overflow-hidden">
                            <div className="absolute top-4 right-4">
                                <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">Popular</span>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-indigo-600">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Pro</h3>
                                    <p className="text-3xl font-black text-neutral-900 dark:text-white mt-1">
                                        $4.99<span className="text-base font-normal text-neutral-500">/mo</span>
                                    </p>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium text-neutral-900 dark:text-white">Unlimited uses</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium text-neutral-900 dark:text-white">All premium features</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium text-neutral-900 dark:text-white">Priority processing</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium text-neutral-900 dark:text-white">Cancel anytime</span>
                                </li>
                            </ul>

                            <button
                                onClick={handleUpgrade}
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/30"
                            >
                                {loading ? 'Processing...' : 'Upgrade Now'}
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-xs text-neutral-400 mt-8">
                        Secure payment powered by PayPal. Cancel your subscription at any time.
                    </p>
                </div>
            </div>
        </div>
    );
};
