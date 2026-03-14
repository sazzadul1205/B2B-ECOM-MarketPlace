// Pages/Auth/ResetPassword.jsx

// React
import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// Icons
import { MdError } from 'react-icons/md';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { BsShieldCheck, BsKey } from 'react-icons/bs';
import { FiMail, FiLock, FiRefreshCw } from 'react-icons/fi';

export default function ResetPassword({ token, email }) {

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form data
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    // Clear password fields on unmount
    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    // Handle form submission
    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'));
    };

    return (
        <>
            <Head title="পাসওয়ার্ড রিসেট" />

            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
                {/* Decorative elements - Background design */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-indigo-600 to-purple-600 transform -skew-y-3"></div>

                <div className="relative w-full sm:max-w-md mt-16 px-6 py-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20">
                    {/* Header with icon */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4 shadow-lg">
                            <FiRefreshCw className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">পাসওয়ার্ড রিসেট</h2>
                        <p className="text-gray-600 mt-2">নিচে আপনার নতুন পাসওয়ার্ড দিন</p>
                    </div>

                    {/* Error Message */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                            <MdError className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <span className="text-sm text-red-700">
                                {errors.email || errors.password || errors.password_confirmation || 'আপনার তথ্য যাচাই করুন'}
                            </span>
                        </div>
                    )}

                    {/* Password Requirements Notice */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
                        <BsKey className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                            <p className="font-medium mb-1">পাসওয়ার্ড প্রয়োজনীয়তা:</p>
                            <ul className="list-disc list-inside text-xs space-y-1">
                                <li>কমপক্ষে ৮ অক্ষর দীর্ঘ</li>
                                <li>কমপক্ষে একটি বড় হাতের অক্ষর থাকতে হবে</li>
                                <li>কমপক্ষে একটি সংখ্যা থাকতে হবে</li>
                                <li>কমপক্ষে একটি বিশেষ অক্ষর থাকতে হবে</li>
                            </ul>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field (read-only) */}
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
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                                    placeholder="you@example.com"
                                    autoComplete="username"
                                    readOnly
                                    disabled
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="mr-1">•</span> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* New Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                নতুন পাসওয়ার্ড <span className="text-red-500">*</span>
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
                                    autoComplete="new-password"
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

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                নতুন পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition duration-200"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <HiEyeOff className="h-5 w-5" />
                                    ) : (
                                        <HiEye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="mr-1">•</span> {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        {/* Password Strength Indicator */}
                        {data.password && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">পাসওয়ার্ড শক্তি:</span>
                                    <span className={
                                        data.password.length < 8 ? 'text-red-600' :
                                            data.password.length < 12 ? 'text-yellow-600' :
                                                'text-green-600'
                                    }>
                                        {data.password.length < 8 ? 'দুর্বল' :
                                            data.password.length < 12 ? 'মাঝারি' :
                                                'শক্তিশালী'}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${data.password.length < 8 ? 'w-1/3 bg-red-500' :
                                            data.password.length < 12 ? 'w-2/3 bg-yellow-500' :
                                                'w-full bg-green-500'
                                            }`}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Reset Password Button */}
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
                                    পাসওয়ার্ড রিসেট হচ্ছে...
                                </span>
                            ) : (
                                'পাসওয়ার্ড রিসেট'
                            )}
                        </button>

                        {/* Security Notice */}
                        <div className="bg-indigo-50 rounded-lg p-3 flex items-start space-x-3">
                            <BsShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-indigo-700">
                                আপনার নতুন পাসওয়ার্ড এনক্রিপ্ট করে নিরাপদে সংরক্ষণ করা হবে। একটি শক্তিশালী পাসওয়ার্ড নির্বাচন করুন যা আপনি অন্য কোথাও ব্যবহার করেননি।
                            </p>
                        </div>

                        {/* Back to Login Link */}
                        <div className="text-center mt-6 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                আপনার পাসওয়ার্ড মনে আছে?{' '}
                                <Link
                                    href={route('login')}
                                    className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    লগইনে ফিরে যান
                                </Link>
                            </p>
                        </div>

                        {/* Help text */}
                        <div className="text-center text-xs text-gray-500">
                            <p>সমস্যা হচ্ছে? সাহায্যের জন্য সাপোর্টে যোগাযোগ করুন</p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}