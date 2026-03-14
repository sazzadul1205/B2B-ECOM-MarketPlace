import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { FiMail, FiSend } from 'react-icons/fi';
import { BsShieldCheck } from 'react-icons/bs';
import { MdError } from 'react-icons/md';

export default function ForgotPassword({ status }) {

    // Form state
    const [submitted, setSubmitted] = useState(false);

    // Form data
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    // Handle form submission
    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'), {
            onSuccess: () => setSubmitted(true)
        });
    };

    return (
        <>
            <Head title="পাসওয়ার্ড ভুলে গেছেন?" />

            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
                {/* Decorative elements - Background design */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-indigo-600 to-purple-600 transform -skew-y-3"></div>

                <div className="relative w-full sm:max-w-md mt-16 px-6 py-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20">
                    {/* Header with icon */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4 shadow-lg">
                            <FiMail className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">পাসওয়ার্ড ভুলে গেছেন?</h2>
                        <p className="text-gray-600 mt-2">কয়েক সেকেন্ডে আপনার পাসওয়ার্ড রিসেট করুন</p>
                    </div>

                    {/* Success Message */}
                    {status && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                            <BsShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-green-700">{status}</span>
                        </div>
                    )}

                    {/* Custom Success Message */}
                    {submitted && !errors.email && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                            <FiSend className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-green-700">
                                <p className="font-medium mb-1">রিসেট লিঙ্ক পাঠানো হয়েছে!</p>
                                <p>পাসওয়ার্ড রিসেট লিঙ্কের জন্য আপনার ইমেইল চেক করুন। আপনার স্প্যাম ফোল্ডারও চেক করতে ভুলবেন না।</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                            <MdError className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <span className="text-sm text-red-700">
                                {errors.email || 'আপনার তথ্য যাচাই করুন'}
                            </span>
                        </div>
                    )}

                    {/* Info Message */}
                    <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <p className="text-sm text-indigo-700">
                            আপনার পাসওয়ার্ড ভুলে গেছেন? কোনো সমস্যা নেই। শুধু আপনার ইমেইল ঠিকানা দিন এবং আমরা আপনাকে একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠাব।
                        </p>
                    </div>

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
                                    autoComplete="email"
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

                        {/* Send Reset Link Button */}
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
                                    লিঙ্ক পাঠানো হচ্ছে...
                                </span>
                            ) : (
                                'পাসওয়ার্ড রিসেট লিঙ্ক পাঠান'
                            )}
                        </button>

                        {/* Quick Tips */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">দ্রুত টিপস</h4>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li className="flex items-start">
                                    <span className="text-indigo-500 mr-2">•</span>
                                    ইমেইল না পেলে আপনার স্প্যাম/জাঙ্ক ফোল্ডার চেক করুন
                                </li>
                                <li className="flex items-start">
                                    <span className="text-indigo-500 mr-2">•</span>
                                    রিসেট লিঙ্ক ৬০ মিনিটের মধ্যে মেয়াদ শেষ হয়
                                </li>
                                <li className="flex items-start">
                                    <span className="text-indigo-500 mr-2">•</span>
                                    আপনার অ্যাকাউন্টের সাথে সংযুক্ত ইমেইল ব্যবহার করছেন কিনা নিশ্চিত করুন
                                </li>
                            </ul>
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