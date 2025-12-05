// Computer types
export interface Computer {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: 'desktop' | 'laptop' | 'all-in-one';
  price: number;
  originalPrice?: number;
  description: string;
  specs: ComputerSpecs;
  images: string[];
  inStock: boolean;
  featured: boolean;
  condition: 'excellent' | 'good' | 'fair';
  warranty: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComputerSpecs {
  processor: string;
  ram: string;
  storage: string;
  graphics?: string;
  display?: string;
  os: string;
  ports?: string[];
  wireless?: string;
  battery?: string;
}

// Service types
export interface Service {
  id: string;
  name: string;
  description: string;
  price?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: string;
  category: string;
}

// Contact form types
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Repair request types
export interface RepairRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

// Business hours types
export interface BusinessHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface WeeklyHours {
  monday: BusinessHours;
  tuesday: BusinessHours;
  wednesday: BusinessHours;
  thursday: BusinessHours;
  friday: BusinessHours;
  saturday: BusinessHours;
  sunday: BusinessHours;
}

// Re-export Google Business types
export * from './google-business';
