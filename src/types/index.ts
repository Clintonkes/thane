// Order types
export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  pickupLocation: string;
  deliveryLocation: string;
  goodsType: string;
  cargoWeight: string;
  cargoSize: string;
  preferredDate: string;
  additionalNotes: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  assignedTruck?: string;
  createdAt: string;
  updatedAt: string;
}

// Truck types
export interface Truck {
  id: string;
  truckNumber: string;
  type: string;
  capacity: string;
  image: string;
  status: 'available' | 'in_use' | 'maintenance';
  driver?: string;
  lastMaintenance?: string;
  nextService?: string;
  location?: string;
  fuelLevel?: string;
}

// Review types
export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'order_received' | 'truck_assigned' | 'order_completed' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Chat message types
export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  message: string;
  timestamp: string;
}
