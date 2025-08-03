// API Configuration and Types
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  ENDPOINTS: {
    // Health
    HEALTH: "/health",

    // Campaigns
    CAMPAIGNS: "/api/v1/campaigns",
    CAMPAIGN_BY_ID: (id: string) => `/api/v1/campaigns/${id}`,

    // Creatives
    CREATIVES: "/api/v1/creatives",
    CREATIVE_BY_ID: (id: string) => `/api/v1/creatives/${id}`,
    CREATIVE_AI_GENERATE: "/api/v1/creatives/ai/generate",

    // Analytics
    ANALYTICS_CAMPAIGN: (id: string) => `/api/v1/analytics/campaigns/${id}`,
    ANALYTICS_MULTI_CAMPAIGN: "/api/v1/analytics/campaigns",
    ANALYTICS_TOP_CREATIVES: "/api/v1/analytics/creatives/top",
    ANALYTICS_SUMMARY: "/api/v1/analytics/summary",

    // Billing
    BILLING_SUBSCRIPTION: "/api/v1/billing/subscription",
    BILLING_USAGE: "/api/v1/billing/usage",
    BILLING_LIMITS: "/api/v1/billing/limits",
    BILLING_INVOICES: "/api/v1/billing/invoices",
  },
};

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

// Campaign Types
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "active" | "paused" | "completed";
  budget: number;
  dailyBudget?: number;
  targetAudience: {
    demographics: {
      ageRange: string;
      gender: string;
      location: string[];
    };
    interests: string[];
    behaviors: string[];
  };
  objectives: string[];
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  budget: number;
  dailyBudget?: number;
  targetAudience: Campaign["targetAudience"];
  objectives: string[];
  startDate: string;
  endDate?: string;
}

// Creative Types
export interface Creative {
  id: string;
  campaignId: string;
  type: "text" | "image" | "video" | "carousel";
  status: "draft" | "generated" | "approved" | "active" | "paused";
  content: {
    headline?: string;
    description?: string;
    callToAction?: string;
    imageUrl?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
  };
  aiMetadata?: {
    generatedBy: string;
    confidence: number;
    alternativeVersions?: Creative["content"][];
  };
  performance?: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    conversionRate: number;
    spend: number;
    roas: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreativeRequest {
  campaignId: string;
  type: Creative["type"];
  content: Creative["content"];
  useAI?: boolean;
  aiPrompt?: string;
}

// Analytics Types
export interface CampaignAnalytics {
  campaignId: string;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    conversionRate: number;
    spend: number;
    roas: number;
    cpm: number;
    cpc: number;
    cpa: number;
  };
  timeSeries: Array<{
    date: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  }>;
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    location: Record<string, number>;
  };
  topCreatives: Array<{
    creativeId: string;
    name: string;
    ctr: number;
    conversions: number;
  }>;
}

export interface MultiCampaignAnalytics {
  totalCampaigns: number;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  averageRoas: number;
  campaigns: Array<{
    campaignId: string;
    name: string;
    spend: number;
    roas: number;
    status: string;
  }>;
  trends: {
    spendTrend: number;
    performanceTrend: number;
    roasTrend: number;
  };
}

export interface TopCreatives {
  period: string;
  creatives: Array<{
    creativeId: string;
    campaignId: string;
    campaignName: string;
    type: string;
    ctr: number;
    conversions: number;
    roas: number;
    impressions: number;
  }>;
}

export interface PerformanceSummary {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalCreatives: number;
    totalSpend: number;
    totalRevenue: number;
    overallRoas: number;
  };
  thisMonth: {
    spend: number;
    revenue: number;
    roas: number;
    newCampaigns: number;
  };
  topPerformers: {
    campaigns: Array<{
      id: string;
      name: string;
      roas: number;
    }>;
    creatives: Array<{
      id: string;
      type: string;
      ctr: number;
    }>;
  };
}

// Billing Types
export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: "active" | "past_due" | "canceled" | "trialing";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  features: string[];
  limits: {
    campaignsPerMonth: number;
    creativesPerCampaign: number;
    apiCallsPerMonth: number;
    storageGB: number;
  };
}

export interface UsageStatistics {
  billingPeriod: {
    start: string;
    end: string;
  };
  usage: {
    campaignsCreated: number;
    creativesGenerated: number;
    apiCallsMade: number;
    storageUsedGB: number;
  };
  limits: {
    campaignsPerMonth: number;
    creativesPerCampaign: number;
    apiCallsPerMonth: number;
    storageGB: number;
  };
  overage: {
    campaigns: number;
    creatives: number;
    apiCalls: number;
    storageGB: number;
  };
}

export interface PlanLimits {
  planId: string;
  planName: string;
  limits: {
    campaignsPerMonth: number;
    creativesPerCampaign: number;
    apiCallsPerMonth: number;
    storageGB: number;
    teamMembers: number;
  };
  features: string[];
  price: {
    amount: number;
    currency: string;
    interval: "month" | "year";
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  amount: number;
  currency: string;
  billingPeriod: {
    start: string;
    end: string;
  };
  dueDate: string;
  paidAt?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  downloadUrl?: string;
}

// Health Check Types
export interface HealthStatus {
  status: string;
  timestamp: string;
  services: {
    database: {
      status: string;
      responseTime: number;
    };
    redis: {
      status: string;
      responseTime: number;
    };
    aiEngine: {
      status: string;
      responseTime: number;
    };
  };
}

// Error Types
export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, any>;
}

// Request/Response wrapper types
export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Multi-tenant context
export interface TenantContext {
  tenantId: string;
  tenantName: string;
}
