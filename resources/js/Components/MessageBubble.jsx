// resources/js/Components/MessageBubble.jsx
import React from 'react';
import { FiCheck, FiImage, FiFile } from 'react-icons/fi';
import { BsCheck2All } from 'react-icons/bs';

export default function MessageBubble({ message, isMe, showSender, senderName, timestamp, read, attachments }) {
  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
        {/* Sender Name */}
        {showSender && !isMe && (
          <p className="text-xs text-gray-500 mb-1 ml-2">{senderName}</p>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-lg p-3 ${isMe
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-white text-gray-800 rounded-bl-none border'
            }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message}</p>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((att, idx) => (
                <div key={idx} className="flex items-center text-xs">
                  {att.type === 'image' ? (
                    <FiImage className="mr-1" />
                  ) : (
                    <FiFile className="mr-1" />
                  )}
                  <span className="underline">{att.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Time & Status */}
        <div className={`flex items-center mt-1 text-xs text-gray-500 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span>{formatTime(timestamp)}</span>
          {isMe && (
            <span className="ml-1">
              {read ? (
                <BsCheck2All className="text-blue-500" />
              ) : (
                <FiCheck className="text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Avatar for other user */}
      {!isMe && (
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm order-1 mr-2">
          {senderName?.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}