// Global type definitions for the AdGenius frontend application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  isEmailVerified: boolean;
  timezone: string;
  language: string;
  preferences: Record<string, any>;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  bio?: string;
  company?: string;
  jobTitle?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  onboardingCompleted: boolean;
  onboardingStep?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string;
  isActive: boolean;
  settings: Record<string, any>;
  subscriptionTier: 'free' | 'basic' | 'professional' | 'enterprise';
  maxUsers: number;
  maxMonthlyGenerations: number;
  monthlyGenerationsUsed: number;
  lastGenerationReset: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantUser {
  id: string;
  tenant: Tenant;
  user: User;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  isActive: boolean;
  joinedAt: string;
  permissions: Record<string, any>;
}

export interface TenantInvitation {
  id: string;
  tenant: Tenant;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invitedBy: User;
  token: string;
  isAccepted: boolean;
  expiresAt: string;
  acceptedAt?: string;
  acceptedBy?: User;
  createdAt: string;
}

export interface AdCreative {
  id: string;
  tenant: string;
  createdBy: User;
  title: string;
  description?: string;
  prompt: string;
  type: 'text' | 'image' | 'video';
  status: 'generating' | 'completed' | 'failed';
  content?: {
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
  };
  metadata: Record<string, any>;
  analytics?: AdAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface AdAnalytics {
  id: string;
  creative: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  conversionRate: number;
  cost: number;
  revenue: number;
  roi: number; // Return on investment
  lastUpdated: string;
}

export interface Campaign {
  id: string;
  tenant: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget: number;
  startDate: string;
  endDate?: string;
  creatives: AdCreative[];
  analytics?: CampaignAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignAnalytics {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCtr: number;
  averageConversionRate: number;
  totalCost: number;
  totalRevenue: number;
  totalRoi: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
  totalPages: number;
  currentPage: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  company?: string;
  acceptTerms: boolean;
}

export interface CreateTenantForm {
  name: string;
  slug: string;
  domain?: string;
  subscriptionTier: 'free' | 'basic' | 'professional' | 'enterprise';
}

export interface InviteUserForm {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  message?: string;
}

export interface AdGenerationForm {
  title: string;
  description?: string;
  prompt: string;
  type: 'text' | 'image' | 'video';
  parameters?: {
    style?: string;
    tone?: string;
    length?: string;
    format?: string;
    [key: string]: any;
  };
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  loading: boolean;
  error?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: string;
}

// Store Types
export interface AuthState {
  user?: User;
  token?: string;
  refreshToken?: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export interface TenantState {
  currentTenant?: Tenant;
  tenants: Tenant[];
  tenantUsers: TenantUser[];
  invitations: TenantInvitation[];
  isLoading: boolean;
  error?: string;
}

export interface CreativeState {
  creatives: AdCreative[];
  currentCreative?: AdCreative;
  campaigns: Campaign[];
  currentCampaign?: Campaign;
  isGenerating: boolean;
  isLoading: boolean;
  error?: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LayoutProps extends BaseComponentProps {
  title?: string;
  description?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
  }>;
  loading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    color?: 'primary' | 'secondary' | 'error';
  }>;
}
