export interface FoodItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  vegetarian: boolean;
  rating: number;
  preparation_time: string;
  available: boolean;
  spicy?: boolean;
  popular?: boolean;
  tags?: string[];
}

export interface CartItem {
  item: FoodItem;
  quantity: number;
}

export type CheckoutStep = 'idle' | 'name' | 'address' | 'payment' | 'confirm';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
  recommendedItems?: FoodItem[];
  quickReplies?: Array<{ label: string; actionText: string; icon?: string }>;
  isTyping?: boolean;
  cartUpdateInfo?: {
    itemNames: string[];
    subtotal: number;
  };
  checkoutStep?: CheckoutStep;
  orderConfirmation?: Order;
  intent?: string;
  showMenu?: boolean;
  menuCategory?: string;
  filterVeg?: boolean;
  maxPrice?: number;
  language?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  deliveryAddress: string;
  paymentMethod: 'Cash on Delivery' | 'UPI' | 'Card';
  status: 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered';
  estimatedDelivery: string;
  createdAt: number;
}

export type ActiveTab = 'chat' | 'cart' | 'orders' | 'favorites' | 'settings';
