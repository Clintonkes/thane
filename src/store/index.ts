import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, Truck, Review, Notification, ChatMessage } from '@/types';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Sample data
const sampleTrucks: Truck[] = [
  {
    id: '1',
    truckNumber: 'TG-001',
    type: 'Semi-Trailer',
    capacity: '40,000 lbs',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'available',
    driver: 'John Smith',
  },
  {
    id: '2',
    truckNumber: 'TG-002',
    type: 'Box Truck',
    capacity: '25,000 lbs',
    image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'available',
    driver: 'Mike Johnson',
  },
  {
    id: '3',
    truckNumber: 'TG-003',
    type: 'Flatbed',
    capacity: '50,000 lbs',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'in_use',
    driver: 'David Brown',
  },
  {
    id: 't4',
    truckNumber: 'TG-004',
    type: 'Refrigerated',
    capacity: '40,000 lbs',
    image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'maintenance',
    driver: '',
  },
  {
    id: 't5',
    truckNumber: 'TG-005',
    type: 'Box Truck',
    capacity: '26,000 lbs',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'maintenance',
  },
  {
    id: '6',
    truckNumber: 'TG-006',
    type: 'Semi-Trailer',
    capacity: '45,000 lbs',
    image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'available',
    driver: 'James Davis',
  },
];

const sampleReviews: Review[] = [
  {
    id: '1',
    customerName: 'Sarah Thompson',
    rating: 5,
    comment: 'Excellent service! The team was professional and delivered our goods on time. Highly recommend Thanesgaylerental for any logistics needs.',
    date: '2024-01-15',
  },
  {
    id: '2',
    customerName: 'Michael Chen',
    rating: 5,
    comment: 'We have been using their services for 3 years now. Always reliable and competitive pricing. The drivers are courteous and professional.',
    date: '2024-01-10',
  },
  {
    id: '3',
    customerName: 'Emily Rodriguez',
    rating: 4,
    comment: 'Great experience overall. The booking process was smooth and the tracking updates were very helpful. Will definitely use again.',
    date: '2024-01-05',
  },
  {
    id: '4',
    customerName: 'David Williams',
    rating: 5,
    comment: 'Outstanding service! They handled our fragile equipment with care and delivered safely. The customer support team was very responsive.',
    date: '2023-12-28',
  },
];

interface AppState {
  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (id: string, status: Order['status'], assignedTruck?: string) => void;
  
  // Trucks
  trucks: Truck[];
  updateTruckStatus: (id: string, status: Truck['status']) => void;
  
  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  
  // UI State
  isChatOpen: boolean;
  toggleChat: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Orders
      orders: [],
      addOrder: (orderData) => {
        const now = new Date().toISOString();
        const newOrder: Order = {
          ...orderData,
          id: generateId(),
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ orders: [newOrder, ...state.orders] }));
        
        // Add notification
        get().addNotification({
          type: 'order_received',
          title: 'New Order Received',
          message: `New order from ${orderData.customerName} - ${orderData.goodsType}`,
        });
      },
      updateOrderStatus: (id, status, assignedTruck) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id
              ? { ...order, status, assignedTruck, updatedAt: new Date().toISOString() }
              : order
          ),
        }));
        
        const order = get().orders.find((o) => o.id === id);
        if (order && status === 'assigned') {
          get().addNotification({
            type: 'truck_assigned',
            title: 'Truck Assigned',
            message: `Order #${id.slice(0, 6)} has been assigned a truck`,
          });
        } else if (order && status === 'completed') {
          get().addNotification({
            type: 'order_completed',
            title: 'Order Completed',
            message: `Order #${id.slice(0, 6)} has been completed`,
          });
        }
      },
      
      // Trucks
      trucks: sampleTrucks,
      updateTruckStatus: (id, status) => {
        set((state) => ({
          trucks: state.trucks.map((truck) =>
            truck.id === id ? { ...truck, status } : truck
          ),
        }));
      },
      
      // Reviews
      reviews: sampleReviews,
      addReview: (reviewData) => {
        const newReview: Review = {
          ...reviewData,
          id: generateId(),
          date: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ reviews: [newReview, ...state.reviews] }));
      },
      
      // Notifications
      notifications: [],
      addNotification: (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: generateId(),
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50),
        }));
      },
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },
      clearNotifications: () => set({ notifications: [] }),
      
      // Chat
      chatMessages: [
        {
          id: '1',
          sender: 'agent',
          message: 'Hello! Welcome to Thanesgaylerental Properties LLC. How can we help you today?',
          timestamp: new Date().toISOString(),
        },
      ],
      addChatMessage: (messageData) => {
        const newMessage: ChatMessage = {
          ...messageData,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ chatMessages: [...state.chatMessages, newMessage] }));
        
        // Simulate agent response
        setTimeout(() => {
          get().addChatMessage({
            sender: 'agent',
            message: 'Thank you for your message! One of our team members will be with you shortly. For immediate assistance, please call us at +1 (555) 123-4567.',
          });
        }, 2000);
      },
      
      // UI State
      isChatOpen: false,
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'thanesgaylerental-storage',
      partialize: (state) => ({
        orders: state.orders,
        notifications: state.notifications,
        reviews: state.reviews,
        chatMessages: state.chatMessages,
      }),
    }
  )
);
