
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

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
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

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
                setMessage({ type: 'success', text: 'Welcome! Check your email to verify your account.' });
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
                setMessage({ type: 'success', text: 'Security link sent! Check your inbox to reset your password.' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setAuthMode(authMode === 'signIn' ? 'signUp' : 'signIn');
        setMessage(null);
        setPassword('');
        setShowPassword(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20 dark:border-neutral-800/50 overflow-hidden">
                {/* Decorative background gradients */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all transform hover:rotate-90"
                >
                    <X className="w-5 h-5" />
                </button>

                {authMode === 'forgotPassword' && (
                    <button
                        onClick={() => setAuthMode('signIn')}
                        className="absolute top-6 left-6 p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all flex items-center gap-2 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                )}

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-4 mb-6 shadow-lg shadow-indigo-200 dark:shadow-none animate-in zoom-in duration-500">
                        <Lock className="w-full h-full text-white" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white mb-3">
                        {authMode === 'signIn' ? 'Welcome Back' : authMode === 'signUp' ? 'Get Started' : 'Lost Access?'}
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 text-base font-medium max-w-[280px] mx-auto leading-relaxed">
                        {authMode === 'signIn'
                            ? 'The ultimate AI document workflow awaits.'
                            : authMode === 'signUp'
                                ? 'Join the future of PDF automation today.'
                                : 'No worries, we will send you a secure link.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-2.5 ml-1">Email Identifier</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-4 w-5 h-5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 rounded-2xl py-4 pl-12 pr-4 text-neutral-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    {authMode !== 'forgotPassword' && (
                        <div>
                            <div className="flex justify-between items-center mb-2.5 ml-1">
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Security Key</label>
                                {authMode === 'signIn' && (
                                    <button
                                        type="button"
                                        onClick={() => setAuthMode('forgotPassword')}
                                        className="text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-500 transition-colors"
                                    >
                                        Forgot?
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-4 w-5 h-5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 rounded-2xl py-4 pl-12 pr-12 text-neutral-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-4 p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 relative group overflow-hidden bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-neutral-200 dark:shadow-none h-[60px]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {authMode === 'signIn' ? "Authorize" : authMode === 'signUp' ? "Create Account" : "Get Reset Link"}
                                </>
                            )}
                        </span>
                    </button>
                </form>

                {message && (
                    <div className={`mt-8 p-5 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <X className="w-5 h-5 shrink-0 mt-0.5" />}
                        <p className="text-sm font-semibold leading-snug">{message.text}</p>
                    </div>
                )}

                {authMode !== 'forgotPassword' && (
                    <div className="mt-10 text-center border-t border-neutral-100 dark:border-neutral-800/50 pt-8">
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            {authMode === 'signIn' ? "New to PDFauto.ai?" : "Already have an account?"}{' '}
                            <button
                                onClick={toggleMode}
                                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline underline-offset-4 decoration-2"
                            >
                                {authMode === 'signIn' ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
