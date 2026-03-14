// Pages/Supplier/Messages/Index.jsx

// React - Core React imports for component functionality
import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';

// Layout - Supplier dashboard layout wrapper
import DashboardLayout from '@/Layouts/DashboardLayout';

// Icons - Importing icon sets for UI elements
import {
  FiSend,
  FiPaperclip,
  FiX,
  FiSearch,
  FiMessageSquare,
  FiCheck,
  FiCheckCircle,
  FiFile,
  FiDownload,
} from 'react-icons/fi'

export default function MessagesIndex({
  otherUser,
  relatedRfqs,
  conversations,
  selectedConversation,
  messages: initialMessages,
}) {
  // State management for messages, attachments, and UI controls
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [messages, setMessages] = useState(initialMessages || []);
  const [selectedRfq, setSelectedRfq] = useState(selectedConversation?.rfq || null);
  const [filteredConversations, setFilteredConversations] = useState(conversations);

  // Ref for scrolling to bottom of messages
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter conversations based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = conversations.filter(conv =>
        conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.rfqs?.some(rfq =>
          rfq.rfq_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rfq.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchTerm, conversations]);

  // Format date for display in conversation list
  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'গতকাল';
    } else {
      return messageDate.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });
    }
  };

  // Format full date time for message timestamps
  const formatDateTime = (date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle file selection for attachments
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  // Remove attachment from list
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Handle sending new message with attachments
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && attachments.length === 0) return;

    const formData = new FormData();
    formData.append('receiver_id', otherUser.id);
    formData.append('message', newMessage);
    if (selectedRfq) {
      formData.append('rfq_id', selectedRfq.id);
    }
    attachments.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    router.post(route('supplier.messages.store'), formData, {
      onSuccess: () => {
        setNewMessage('');
        setAttachments([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      preserveScroll: true
    });
  };

  // Handle marking individual message as read
  const handleMarkAsRead = (senderId, rfqId = null) => {
    router.post(route('supplier.messages.mark-read'), {
      sender_id: senderId,
      rfq_id: rfqId
    }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Handle marking all messages as read
  const handleMarkAllAsRead = () => {
    router.post(route('supplier.messages.mark-read'), {
      all: true
    }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Handle conversation selection
  const selectConversation = (userId, rfqId = null) => {
    const url = rfqId
      ? route('supplier.messages.index', { rfq: rfqId })
      : route('supplier.messages.show', userId);
    router.get(url);
  };

  return (
    <DashboardLayout>
      <Head title="বার্তা" />

      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header - Page title and actions */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">বার্তা</h1>
              <p className="text-sm text-gray-600 mt-1">
                ক্রেতাদের সাথে যোগাযোগ করুন এবং কথোপকথন পরিচালনা করুন
              </p>
            </div>
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
            >
              <FiCheckCircle className="w-4 h-4" />
              সব পড়া হিসেবে চিহ্নিত
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Conversations Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="কথোপকথন অনুসন্ধান..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.user.id}
                    onClick={() => selectConversation(conversation.user.id)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${selectedConversation?.user?.id === conversation.user.id
                      ? 'bg-indigo-50'
                      : ''
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* User Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-medium text-indigo-600">
                            {conversation.user.name.charAt(0)}
                          </span>
                        </div>
                        {conversation.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">
                            {conversation.user.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(conversation.last_message_at)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.last_message?.message}
                        </p>

                        {/* RFQ Tags */}
                        {conversation.rfqs.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {conversation.rfqs.map((rfq) => (
                              <span
                                key={rfq.id}
                                className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full"
                              >
                                {rfq.rfq_number}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Empty State - No conversations
                <div className="p-8 text-center">
                  <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">কোনো কথোপকথন নেই</p>
                  <p className="text-sm text-gray-400 mt-1">
                    আপনি যখন চ্যাট শুরু করবেন তখন বার্তা এখানে দেখা যাবে
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col bg-gray-50">
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                      <span className="font-medium text-indigo-600">
                        {otherUser?.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{otherUser?.name}</h2>
                      <p className="text-sm text-gray-500">{otherUser?.email}</p>
                    </div>
                  </div>

                  {/* RFQ Selector - Filter messages by RFQ */}
                  {relatedRfqs && relatedRfqs.length > 0 && (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedRfq?.id || ''}
                        onChange={(e) => {
                          const rfq = relatedRfqs.find(r => r.id === parseInt(e.target.value));
                          setSelectedRfq(rfq || null);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm"
                      >
                        <option value="">সাধারণ কথোপকথন</option>
                        {relatedRfqs.map((rfq) => (
                          <option key={rfq.id} value={rfq.id}>
                            {rfq.rfq_number} - {rfq.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === otherUser?.id ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-lg ${message.sender_id === otherUser?.id ? 'pr-8' : 'pl-8'}`}>
                      <div
                        className={`rounded-lg p-4 ${message.sender_id === otherUser?.id
                          ? 'bg-white border border-gray-200'
                          : 'bg-indigo-600 text-white'
                          }`}
                      >
                        <p className="text-sm">{message.message}</p>

                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment, index) => (
                              <a
                                key={index}
                                href={`/storage/${attachment.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 p-2 rounded-lg ${message.sender_id === otherUser?.id
                                  ? 'bg-gray-50 hover:bg-gray-100'
                                  : 'bg-indigo-500 hover:bg-indigo-400'
                                  }`}
                              >
                                <FiFile className="w-4 h-4" />
                                <span className="text-sm flex-1 truncate">{attachment.name}</span>
                                <FiDownload className="w-4 h-4" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Message Footer */}
                        <div className="flex items-center justify-end gap-1 mt-2">
                          <span className={`text-xs ${message.sender_id === otherUser?.id
                            ? 'text-gray-400'
                            : 'text-indigo-200'
                            }`}>
                            {formatDateTime(message.created_at)}
                          </span>
                          {message.sender_id !== otherUser?.id && (
                            message.is_read ? (
                              <FiCheckCircle className="w-3 h-3 text-indigo-200" title="পড়া হয়েছে" />
                            ) : (
                              <FiCheck className="w-3 h-3 text-indigo-200" title="পাঠানো হয়েছে" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Area */}
              <div className="bg-white border-t border-gray-200 p-4">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2"
                      >
                        <FiFile className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 truncate max-w-[150px]">
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  {/* File Upload Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                    id="file-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                  >
                    <FiPaperclip className="w-5 h-5" />
                  </button>

                  {/* Message Input */}
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="আপনার বার্তা লিখুন..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && attachments.length === 0}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <FiSend className="w-4 h-4" />
                    <span>পাঠান</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            // Empty State - No conversation selected
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMessageSquare className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো কথোপকথন নির্বাচিত হয়নি</h3>
                <p className="text-gray-500">
                  বার্তা পাঠানো শুরু করতে সাইডবার থেকে একটি কথোপকথন নির্বাচন করুন
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}