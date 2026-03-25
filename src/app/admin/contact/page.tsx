"use client";

import { useState, useEffect } from "react";
import { 
  Phone, Mail, MapPin, Edit2, Save, X, 
  Plus, Trash2, Loader2, Building2, MessageCircle,
  User, Clock, CheckCircle, AlertCircle
} from "lucide-react";
import { getContactMessages } from "@/lib/api";

interface CustomerMessage {
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

interface ContactInfo {
  id: number;
  type: string;
  value: string;
  label: string;
  is_primary: boolean;
}

interface CustomerMessage {
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

const defaultContacts: ContactInfo[] = [
  { id: 1, type: "phone", value: "+1 (917)547-8788", label: "Main Office", is_primary: true },
  { id: 2, type: "email", value: "gayleobrien88@gmail.com", label: "Email", is_primary: true },
  { id: 3, type: "address", value: "123 Logistics Way, Houston, TX 77001", label: "Office Address", is_primary: true },
];

export default function ContactPage() {
  const [contacts, setContacts] = useState<ContactInfo[]>(defaultContacts);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactInfo | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({
    type: "phone",
    value: "",
    label: "",
    is_primary: false,
  });
  
  // Customer messages state
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "messages">("info");

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getContactMessages();
        setMessages(data as CustomerMessage[]);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setMessagesLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const unreadCount = messages.filter(m => !m.is_read).length;

  // Handle edit
  const handleEdit = (contact: ContactInfo) => {
    setEditingContact({ ...contact });
    setIsEditing(true);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingContact) return;
    
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setContacts(contacts.map(c => 
      c.id === editingContact.id ? editingContact : c
    ));
    setIsEditing(false);
    setEditingContact(null);
    setIsSaving(false);
  };

  // Add new contact
  const handleAddContact = async () => {
    if (!newContact.value || !newContact.label) return;
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const contact: ContactInfo = {
      id: Date.now(),
      ...newContact,
    };
    
    setContacts([...contacts, contact]);
    setShowAddModal(false);
    setNewContact({ type: "phone", value: "", label: "", is_primary: false });
    setIsSaving(false);
  };

  // Delete contact
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact info?")) return;
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setContacts(contacts.filter(c => c.id !== id));
    setIsSaving(false);
  };

  // Get icon for type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "phone": return Phone;
      case "email": return Mail;
      case "address": return MapPin;
      default: return Building2;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
          <p className="text-gray-500 mt-1">Manage company contact information and customer messages</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "info" 
                ? "bg-primary text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Company Info
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
              activeTab === "messages" 
                ? "bg-primary text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Messages
            </span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "info" ? (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary py-3 px-6 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Contact
            </button>
          </div>

          {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact) => {
          const Icon = getTypeIcon(contact.type);
          
          return (
            <div 
              key={contact.id} 
              className={`bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md ${
                contact.is_primary ? "border-primary ring-2 ring-primary/10" : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  contact.type === "phone" ? "bg-blue-100" :
                  contact.type === "email" ? "bg-green-100" : "bg-purple-100"
                }`}>
                  <Icon className={`h-6 w-6 ${
                    contact.type === "phone" ? "text-blue-600" :
                    contact.type === "email" ? "text-green-600" : "text-purple-600"
                  }`} />
                </div>
                <div className="flex items-center gap-2">
                  {contact.is_primary && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      Primary
                    </span>
                  )}
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500">{contact.label}</p>
                <p className="font-semibold text-gray-900 text-lg">{contact.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {isEditing && editingContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit Contact</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingContact(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Label
                </label>
                <input
                  type="text"
                  value={editingContact.label}
                  onChange={(e) => setEditingContact({ ...editingContact, label: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g., Main Office"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Value
                </label>
                <input
                  type="text"
                  value={editingContact.value}
                  onChange={(e) => setEditingContact({ ...editingContact, value: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder={editingContact.type === "phone" ? "+1 (555) 123-4567" : "Enter value"}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={editingContact.is_primary}
                  onChange={(e) => setEditingContact({ ...editingContact, is_primary: e.target.checked })}
                  className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="is_primary" className="text-sm text-gray-700">
                  Set as primary contact
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingContact(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Contact</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newContact.type}
                  onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="address">Address</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Label
                </label>
                <input
                  type="text"
                  value={newContact.label}
                  onChange={(e) => setNewContact({ ...newContact, label: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g., Main Office"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Value
                </label>
                <input
                  type="text"
                  value={newContact.value}
                  onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder={newContact.type === "phone" ? "+1 (555) 123-4567" : "Enter value"}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="new_is_primary"
                  checked={newContact.is_primary}
                  onChange={(e) => setNewContact({ ...newContact, is_primary: e.target.checked })}
                  className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="new_is_primary" className="text-sm text-gray-700">
                  Set as primary contact
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                disabled={isSaving || !newContact.value || !newContact.label}
                className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Add Contact
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        /* Messages Tab */
        <div className="space-y-6">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No customer messages yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md ${
                    message.is_read === false ? "border-primary ring-2 ring-primary/10" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-xl">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{message.name}</h3>
                        <p className="text-sm text-gray-500">{message.email}</p>
                        {message.phone && (
                          <p className="text-sm text-gray-500">{message.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {message.is_read === false && (
                        <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                          New
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Subject: {message.subject}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <a
                      href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                    >
                      <Mail className="h-4 w-4" />
                      Reply via Email
                    </a>
                    {message.is_replied === true ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Replied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        Pending Reply
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}