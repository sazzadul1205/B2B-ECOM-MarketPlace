// resources/js/Components/ConversationItem.jsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { FiPackage, FiCheck } from 'react-icons/fi';
import { BsCheck2All } from 'react-icons/bs';

export default function ConversationItem({ conversation, isActive }) {
  // Format time
  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Link
      href={conversation.rfq_id
        ? route('buyer.messages.with-rfq', [conversation.other_user_id, conversation.rfq_id])
        : route('buyer.messages.with', conversation.other_user_id)
      }
      className={`block p-4 border-b hover:bg-gray-50 transition-colors ${isActive ? 'bg-indigo-50' : ''
        } ${conversation.unread_count > 0 ? 'bg-indigo-50' : ''}`}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {conversation.other_user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-800 truncate">
              {conversation.other_user.name}
            </h3>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {formatTime(conversation.last_message_time)}
            </span>
          </div>

          {/* RFQ Context */}
          {conversation.rfq && (
            <div className="flex items-center text-xs text-indigo-600 mb-1">
              <FiPackage className="mr-1" />
              <span className="truncate">RFQ: {conversation.rfq.title}</span>
            </div>
          )}

          {/* Last Message */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 truncate flex-1">
              <span className="text-xs text-gray-400 mr-1">
                {conversation.last_message_sender}:
              </span>
              {conversation.last_message}
            </p>

            {/* Unread Badge */}
            {conversation.unread_count > 0 && (
              <span className="ml-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {conversation.unread_count}
              </span>
            )}
          </div>

          {/* Read Receipt */}
          {conversation.last_message_sender === 'You' && (
            <div className="flex items-center mt-1">
              <BsCheck2All className="text-blue-500 text-xs" />
              <span className="text-xs text-gray-400 ml-1">Sent</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
