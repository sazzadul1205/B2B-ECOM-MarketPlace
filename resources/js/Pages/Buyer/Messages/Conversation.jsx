// Pages/Buyer/Messages/Conversation.jsx

// React - Core React imports for component functionality
import { Link, usePage } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';

// Layout - Admin dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import { FiArrowLeft } from 'react-icons/fi';

export default function Conversation() {
  // Get data from Inertia page props
  const { messages, otherUser, rfq, auth } = usePage().props;

  // Initialize messages state with memoized initial messages
  const initialMessages = useMemo(() => (messages?.data || []), [messages]);
  const [messageList, setMessageList] = useState(initialMessages);

  // Update message list when initial messages change
  useEffect(() => {
    setMessageList(initialMessages);
  }, [initialMessages]);

  // Set up real-time Echo listener for private messages
  useEffect(() => {
    // Return early if Echo is not available or user is not authenticated
    if (!window.Echo || !auth?.user?.id) return;

    // Subscribe to private user channel and listen for MessageSent events
    const channel = window.Echo.private(`App.Models.User.${auth.user.id}`)
      .listen('.MessageSent', (payload) => {
        // Check if this message belongs to the current conversation
        const matchesRfq = rfq?.id
          ? payload.rfq_id === rfq.id
          : payload.rfq_id == null;
        const otherUserId = otherUser?.id;
        const isForConversation =
          matchesRfq &&
          (payload.sender_id === otherUserId || payload.receiver_id === otherUserId);

        // If message belongs to this conversation, add it to the list
        if (isForConversation) {
          setMessageList((prev) => {
            // Avoid duplicate messages
            if (prev.some((m) => m.id === payload.id)) return prev;
            return [...prev, payload];
          });
        }
      });

    // Cleanup listener on component unmount
    return () => {
      if (channel) {
        channel.stopListening('.MessageSent');
      }
    };
  }, [auth?.user?.id, otherUser?.id, rfq?.id]);

  return (
    <DashboardLayout>
      <Head title={`${otherUser?.name || 'বার্তা'} - কথোপকথন`} />

      <div className="space-y-4">
        {/* Header - Back button, conversation title and RFQ info */}
        <div className="flex items-center space-x-3">
          <Link
            href={route('buyer.messages.index')}
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
          >
            <FiArrowLeft className="mr-1" />
            বার্তায় ফিরে যান
          </Link>
          <h2 className="text-xl font-semibold text-gray-800">
            {otherUser?.name || 'কথোপকথন'}
          </h2>
          {rfq && (
            <span className="text-sm text-gray-500">
              RFQ: {rfq.title}
            </span>
          )}
        </div>

        {/* Messages Container */}
        <div className="bg-white rounded-xl border p-4 space-y-3">
          {messageList.length ? (
            // Display all messages in the conversation
            messageList.map((message) => (
              <div key={message.id} className="text-sm text-gray-700">
                <span className="font-medium">
                  {message.sender?.name || 'ব্যবহারকারী'}:
                </span>{' '}
                {message.message}
              </div>
            ))
          ) : (
            // Empty state - No messages yet
            <div className="text-gray-500 text-sm">কোনো বার্তা নেই।</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}