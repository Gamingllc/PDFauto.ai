import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const PaymentSuccess: React.FC = () => {
    const { user } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const verifyPayment = async () => {
            const params = new URLSearchParams(window.location.search);
            const orderId = params.get('token'); // PayPal returns token as order ID

            if (!orderId || !user) {
                setStatus('error');
                return;
            }

            try {
                const response = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId, userId: user.id })
                });

                if (response.ok) {
                    setStatus('success');
                    // Redirect to home after 3 seconds
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 3000);
                } else {
                    setStatus('error');
                }
            } catch (err) {
                console.error('Verification error:', err);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [user]);

    return (
        <div className="min-h-screen bg-white dark:bg-[#080808] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-spin" />
                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">Verifying Payment...</h2>
                        <p className="text-neutral-500">Please wait while we confirm your subscription.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">Payment Successful!</h2>
                        <p className="text-neutral-500 mb-4">Your Pro subscription is now active. You'll be redirected shortly...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">Payment Failed</h2>
                        <p className="text-neutral-500 mb-4">Something went wrong. Please contact support.</p>
                        <a href="/" className="text-indigo-600 hover:underline font-bold">Return Home</a>
                    </>
                )}
            </div>
        </div>
    );
};
