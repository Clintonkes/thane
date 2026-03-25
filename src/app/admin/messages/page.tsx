"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Search, Loader2, MessageSquare, Mail, Phone, 
  Calendar, Check, X, Trash2, Send, AlertCircle,
  CheckCircle, Clock, ChevronLeft, ChevronRight
} from "lucide-react";
import { getAdminToken, getMessagesAdmin, markMessageAsRead } from "@/lib/api";

interface Message {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read?: boolean;
  is_replied?: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "replied">("all");
  const [error, setError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal states
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMessagesAdmin();
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Mark as read
  const handleMarkAsRead = async (messageId: number) => {
    try {
      await markMessageAsRead(messageId);
      setMessages(messages.map(m => 
        m.id === messageId ? { ...m, is_read: true } : m
      ));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Delete message
  const handleDelete = async (messageId: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    try {
      const token = getAdminToken();
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(
        `${apiUrl}/api/admin/messages/${messageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setMessages(messages.filter(m => m.id !== messageId));
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  // Handle view details
  const handleViewDetails = (message: Message) => {
    setSelectedMessage(message);
    setShowDetailsModal(true);
    if (!message.is_read) {
      handleMarkAsRead(message.id);
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const matchesFilter = 
      filter === "all" || 
      (filter === "unread" && !msg.is_read) ||
      (filter === "replied" && msg.is_replied);
    
    const matchesSearch = searchQuery === "" ||
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Pagination - reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  // Paginated messages
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMessages = filteredMessages.slice(startIndex, startIndex + itemsPerPage);

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Get counts
  const counts = {
    all: messages.length,
    unread: messages.filter(m => !m.is_read).length,
    replied: messages.filter(m => m.is_replied).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Service</h1>
          <p className="text-gray-500 mt-1">Manage customer messages and complaints</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setFilter("all")}
          className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md ${
            filter === "all" ? "border-primary ring-2 ring-primary/20" : "border-gray-100"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
              <p className="text-sm text-gray-500">Total Messages</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => setFilter("unread")}
          className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md ${
            filter === "unread" ? "border-primary ring-2 ring-primary/20" : "border-gray-100"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.unread}</p>
              <p className="text-sm text-gray-500">Unread</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => setFilter("replied")}
          className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md ${
            filter === "replied" ? "border-primary ring-2 ring-primary/20" : "border-gray-100"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.replied}</p>
              <p className="text-sm text-gray-500">Replied</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages by name, email, or content..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {paginatedMessages.length === 0 ? (
          <div className="p-16 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No messages found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery ? "Try a different search term" : "Customer messages will appear here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {paginatedMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => handleViewDetails(message)}
                className={`p-6 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                  !message.is_read ? "bg-yellow-50/30" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${!message.is_read ? "bg-yellow-100" : "bg-gray-100"}`}>
                      <MessageSquare className={`h-5 w-5 ${!message.is_read ? "text-yellow-600" : "text-gray-500"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{message.name}</h3>
                        {!message.is_read && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            New
                          </span>
                        )}
                        {message.is_replied && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <Check className="h-3 w-3" /> Replied
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{message.subject}</p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{message.message}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {message.email}
                        </span>
                        {message.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {message.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDate(message.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredMessages.length > itemsPerPage && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white rounded-xl border border-gray-100">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredMessages.length)}</span>{" "}
              of <span className="font-medium">{filteredMessages.length}</span> results
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && showDetailsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                <p className="text-sm text-gray-500 mt-1">From {selectedMessage.name}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Sender Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Email:</span>
                    <a href={`mailto:${selectedMessage.email}`} className="font-medium text-primary hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Phone:</span>
                      <a href={`tel:${selectedMessage.phone}`} className="font-medium text-primary hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium text-gray-900">{formatDate(selectedMessage.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Message</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                {!selectedMessage.is_read && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                    Unread
                  </span>
                )}
                {selectedMessage.is_replied && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Replied
                  </span>
                )}
              </div>

              {/* Reply Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reply to Customer
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleDelete(selectedMessage.id)}
                className="px-4 py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                Delete
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // In production, this would send the reply via API
                  alert("Reply feature would send email to customer!");
                  setReplyText("");
                }}
                disabled={!replyText.trim()}
                className="px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
