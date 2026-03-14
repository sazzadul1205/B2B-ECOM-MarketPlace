// Pages/Auth/ConfirmPassword.jsx

// React
import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// Icons
import { MdError } from 'react-icons/md';
import { BsShieldCheck } from 'react-icons/bs';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { FiLock, FiShield } from 'react-icons/fi';

export default function ConfirmPassword() {

    // Password visibility`
    const [showPassword, setShowPassword] = useState(false);

    // Form data
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    // Reset password field
    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    // Handle form submission
    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'));
    };

    return (
        <>
            <Head title="পাসওয়ার্ড নিশ্চিত করুন" />

            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
                {/* Decorative elements - Background design */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-indigo-600 to-purple-600 transform -skew-y-3"></div>

                <div className="relative w-full sm:max-w-md mt-16 px-6 py-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20">
                    {/* Header with icon */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4 shadow-lg">
                            <FiShield className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">পাসওয়ার্ড নিশ্চিত করুন</h2>
                        <p className="text-gray-600 mt-2">নিরাপদ এলাকা ভেরিফিকেশন</p>
                    </div>

                    {/* Error Message */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                            <MdError className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <span className="text-sm text-red-700">
                                {errors.password || 'আপনার পাসওয়ার্ড যাচাই করুন'}
                            </span>
                        </div>
                    )}

                    {/* Security Notice */}
                    <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-start space-x-3">
                        <BsShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-indigo-700">
                            <p className="font-medium mb-1">নিরাপদ এলাকা</p>
                            <p>এটি অ্যাপ্লিকেশনের একটি নিরাপদ এলাকা। চালিয়ে যাওয়ার আগে আপনার পাসওয়ার্ড নিশ্চিত করুন।</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
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
                                    placeholder="আপনার পাসওয়ার্ড দিন"
                                    autoComplete="current-password"
                                    autoFocus
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

                        {/* Confirm Button */}
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
                                    নিশ্চিত করা হচ্ছে...
                                </span>
                            ) : (
                                'পাসওয়ার্ড নিশ্চিত করুন'
                            )}
                        </button>

                        {/* Security Tips */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">নিরাপত্তা টিপস</h4>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li className="flex items-start">
                                    <span className="text-indigo-500 mr-2">•</span>
                                    আপনার পাসওয়ার্ড কারো সাথে শেয়ার করবেন না
                                </li>
                                <li className="flex items-start">
                                    <span className="text-indigo-500 mr-2">•</span>
                                    আপনি সঠিক ওয়েবসাইটে আছেন কিনা নিশ্চিত করুন
                                </li>
                                <li className="flex items-start">
                                    <span className="text-indigo-500 mr-2">•</span>
                                    আপনার ব্রাউজারে প্যাডলক আইকন দেখুন
                                </li>
                            </ul>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-center">
                            <Link
                                href={route('password.request')}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                            >
                                পাসওয়ার্ড ভুলে গেছেন?
                            </Link>
                        </div>

                        {/* Back to Login Link */}
                        <div className="text-center mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                মত পরিবর্তন করেছেন?{' '}
                                <Link
                                    href={route('login')}
                                    className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    লগইনে ফিরে যান
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}