// Pages/Auth/Login.jsx

// React
import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// Icons
import { MdError } from 'react-icons/md';
import { BsShieldCheck } from 'react-icons/bs';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

export default function Login({ status, canResetPassword }) {

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);

    // Form data
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Clear password field on unmount
    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    // Handle form submission
    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title="লগ ইন" />

            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
                {/* Decorative elements - Background design */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-indigo-600 to-purple-600 transform -skew-y-3"></div>

                <div className="relative w-full sm:max-w-md mt-16 px-6 py-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20">
                    {/* Header with icon */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4 shadow-lg">
                            <FiLogIn className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">আবার স্বাগতম</h2>
                        <p className="text-gray-600 mt-2">আপনার অ্যাকাউন্টে সাইন ইন করুন</p>
                    </div>

                    {/* Status Message (like after registration) */}
                    {status && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                            <BsShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-green-700">{status}</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                            <MdError className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <span className="text-sm text-red-700">
                                {errors.email || errors.password || 'আপনার তথ্য যাচাই করুন'}
                            </span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                ইমেইল ঠিকানা <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition duration-200"
                                    placeholder="you@example.com"
                                    autoComplete="username"
                                    autoFocus
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="mr-1">•</span> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                পাসওয়ার্ড <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition duration-200"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? (
                                        <HiEyeOff className="h-5 w-5" />
                                    ) : (
                                        <HiEye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="mr-1">•</span> {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">আমাকে মনে রাখুন</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                                >
                                    পাসওয়ার্ড ভুলে গেছেন?
                                </Link>
                            )}
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    সাইন ইন হচ্ছে...
                                </span>
                            ) : (
                                'সাইন ইন'
                            )}
                        </button>

                        {/* Demo Credentials (Optional - Remove in production) */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white/90 text-gray-500">ডেমো ক্রেডেনশিয়াল</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-2 bg-indigo-50 rounded border border-indigo-100">
                                <p className="font-semibold text-indigo-800">অ্যাডমিন</p>
                                <p className="text-indigo-600">admin@example.com</p>
                                <p className="text-indigo-600">12345678</p>
                            </div>
                            <div className="p-2 bg-purple-50 rounded border border-purple-100">
                                <p className="font-semibold text-purple-800">সাপ্লায়ার</p>
                                <p className="text-purple-600">supplier@example.com</p>
                                <p className="text-purple-600">12345678</p>
                            </div>
                            <div className="p-2 bg-pink-50 rounded border border-pink-100 col-span-2">
                                <p className="font-semibold text-pink-800">ক্রেতা</p>
                                <p className="text-pink-600">buyer@example.com</p>
                                <p className="text-pink-600">12345678</p>
                            </div>
                        </div>

                        {/* Register Link */}
                        <div className="text-center mt-6 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                অ্যাকাউন্ট নেই?{' '}
                                <Link
                                    href={route('register')}
                                    className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    অ্যাকাউন্ট খুলুন
                                </Link>
                            </p>
                        </div>

                        {/* Account status notice */}
                        <div className="text-center text-xs text-gray-500">
                            <p>সম্পূর্ণ অ্যাক্সেসের জন্য অ্যাডমিন অ্যাক্টিভেশন প্রয়োজন</p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}