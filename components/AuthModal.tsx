
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = 'signIn' | 'signUp' | 'forgotPassword';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [authMode, setAuthMode] = useState<AuthMode>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            if (authMode === 'signUp') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin,
                    },
                });
                if (error) throw error;
                setStatus({ type: 'success', message: 'Verification link sent. Please check your inbox.' });
            } else if (authMode === 'signIn') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onClose();
            } else if (authMode === 'forgotPassword') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) throw error;
                setStatus({ type: 'success', message: 'Reset link sent. Check your email to continue.' });
            }
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setAuthMode(authMode === 'signIn' ? 'signUp' : 'signIn');
        setStatus(null);
        setPassword('');
        setShowPassword(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-none border border-neutral-200 dark:border-neutral-800 p-8 sm:p-12 shadow-sm">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {authMode === 'forgotPassword' && (
                    <button
                        onClick={() => setAuthMode('signIn')}
                        className="absolute top-6 left-6 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}

                <div className="mb-10 text-left">
                    <h2 className="text-xl font-medium text-neutral-900 dark:text-white mb-1">
                        {authMode === 'signIn' ? 'Sign in' : authMode === 'signUp' ? 'Create account' : 'Reset password'}
                    </h2>
                    <p className="text-sm text-neutral-500">
                        {authMode === 'signIn'
                            ? 'Welcome back to PDFauto.ai'
                            : authMode === 'signUp'
                                ? 'Start automating your documents'
                                : 'Receive a secure recovery link'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Email address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2 text-sm text-neutral-900 dark:text-white focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none"
                            placeholder="mail@example.com"
                        />
                    </div>

                    {authMode !== 'forgotPassword' && (
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Password</label>
                                {authMode === 'signIn' && (
                                    <button
                                        type="button"
                                        onClick={() => setAuthMode('forgotPassword')}
                                        className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                    >
                                        Forgot?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2 pr-8 text-sm text-neutral-900 dark:text-white focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 flex items-center justify-center bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                authMode === 'signIn' ? "Sign In" : authMode === 'signUp' ? "Continue" : "Send Link"
                            )}
                        </button>
                    </div>
                </form>

                {status && (
                    <div className={`mt-6 text-[11px] font-medium ${status.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                        }`}>
                        {status.message}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <button
                        onClick={toggleMode}
                        className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                        {authMode === 'signIn' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>

                <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800">
                    <p className="text-[9px] text-neutral-400 leading-relaxed text-center uppercase tracking-tighter">
                        By continuing, you agree to the PDFauto.ai Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
};
