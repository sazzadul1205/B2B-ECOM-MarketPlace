// Pages/Auth/VerifyEmail.jsx

// React
import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// Icons
import { FiMail, FiSend, FiLogOut } from 'react-icons/fi';
import { MdError, MdMarkEmailRead } from 'react-icons/md';
import { BsShieldCheck, BsEnvelopeCheck } from 'react-icons/bs';

export default function VerifyEmail({ status }) {

    // State
    const [resendSuccess, setResendSuccess] = useState(false);

    // Form
    const { post, processing, errors } = useForm({});

    // Handle form submission
    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'), {
            onSuccess: () => {
                setResendSuccess(true);
                // Reset success message after 5 seconds
                setTimeout(() => setResendSuccess(false), 5000);
            }
        });
    };

    return (
        <>
            <Head title="ইমেইল ভেরিফিকেশন" />

            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
                {/* Decorative elements - Background design */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-indigo-600 to-purple-600 transform -skew-y-3"></div>

                <div className="relative w-full sm:max-w-md mt-16 px-6 py-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20">
                    {/* Header with icon */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4 shadow-lg">
                            <MdMarkEmailRead className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">আপনার ইমেইল ভেরিফাই করুন</h2>
                        <p className="text-gray-600 mt-2">একদম শেষ! আপনার ইনবক্স চেক করুন</p>
                    </div>

                    {/* Success Message - New verification link sent */}
                    {status === 'verification-link-sent' && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                            <BsEnvelopeCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-green-700">
                                একটি নতুন ভেরিফিকেশন লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে।
                            </span>
                        </div>
                    )}

                    {/* Resend Success Message */}
                    {resendSuccess && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3 animate-pulse">
                            <FiSend className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-green-700">
                                ভেরিফিকেশন ইমেইল সফলভাবে পুনরায় পাঠানো হয়েছে!
                            </span>
                        </div>
                    )}

                    {/* Error Message */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                            <MdError className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <span className="text-sm text-red-700">
                                {errors.email || 'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।'}
                            </span>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* Welcome Message */}
                        <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
                            <div className="flex items-start space-x-3">
                                <BsShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-indigo-700 space-y-2">
                                    <p className="font-medium">নিবন্ধনের জন্য ধন্যবাদ! 🎉</p>
                                    <p>
                                        শুরু করার আগে, আপনার ইমেইল ঠিকানা ভেরিফাই করুন। আমরা আপনার ইনবক্সে যে লিঙ্ক
                                        পাঠিয়েছি সেটিতে ক্লিক করুন।
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Email Tips */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                                <FiMail className="mr-1" /> ইমেইল টিপস
                            </h4>
                            <ul className="text-xs text-gray-600 space-y-2">
                                <li className="flex items-start">
                                    <span className="text-indigo-500 mr-2">•</span>
                                    ইমেইল না পেলে আপনার স্পাম/জাঙ্ক ফোল্ডার চেক করুন
                                </li>
                                <li className="flex items-start">
                                    <span className="text-indigo-500 mr-2">•</span>
                                    noreply@yourdomain.com আপনার কন্টাক্টে যোগ করুন
                                </li>
                                <li className="flex items-start">
                                    <span className="text-indigo-500 mr-2">•</span>
                                    ভেরিফিকেশন লিঙ্ক ২৪ ঘন্টার মধ্যে মেয়াদ শেষ হয়
                                </li>
                                <li className="flex items-start">
                                    <span className="text-indigo-500 mr-2">•</span>
                                    আপনি সঠিক ইমেইল অ্যাকাউন্ট চেক করছেন কিনা নিশ্চিত করুন
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* Resend Button */}
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
                                        পাঠানো হচ্ছে...
                                    </span>
                                ) : (
                                    'ভেরিফিকেশন ইমেইল পুনরায় পাঠান'
                                )}
                            </button>

                            {/* Logout Button */}
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                            >
                                <FiLogOut className="mr-2 h-4 w-4" />
                                লগ আউট
                            </Link>
                        </form>

                        {/* Need Help Section */}
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                            <h4 className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mb-2">
                                এখনও সমস্যা হচ্ছে?
                            </h4>
                            <p className="text-xs text-yellow-700">
                                আপনি যদি আমাদের ইমেইল না পান, আপনার স্পাম ফোল্ডার চেক করুন অথবা{' '}
                                <Link
                                    href={route('contact')}
                                    className="font-medium underline hover:text-yellow-900 transition-colors"
                                >
                                    সাপোর্টে যোগাযোগ
                                </Link>
                                {' '}করুন।
                            </p>
                        </div>

                        {/* Email Not Received Counter (Optional) */}
                        <div className="text-center text-xs text-gray-500">
                            <p>ইমেইল পাননি? কয়েক মিনিট অপেক্ষা করে আবার চেষ্টা করুন</p>
                            <p className="mt-1">আপনি প্রতি ৬০ সেকেন্ড পর পর নতুন লিঙ্ক অনুরোধ করতে পারেন</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}