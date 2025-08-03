import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import Cookies from "js-cookie";
import {
  API_CONFIG,
  ApiResponse,
  ApiError,
  Campaign,
  CreateCampaignRequest,
  Creative,
  CreateCreativeRequest,
  CampaignAnalytics,
  MultiCampaignAnalytics,
  TopCreatives,
  PerformanceSummary,
  Subscription,
  UsageStatistics,
  PlanLimits,
  Invoice,
  HealthStatus,
  PaginatedRequest,
  PaginatedResponse,
  TenantContext,
} from "../types/api";

class ApiService {
  private api: AxiosInstance;
  private tenantContext: TenantContext | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
    this.loadTenantContext();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add authentication token
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add tenant context
        if (this.tenantContext) {
          config.headers["X-Tenant-ID"] = this.tenantContext.tenantId;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        // Handle common errors
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        } else if (error.response?.status === 403) {
          this.handleForbidden();
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    return (
      Cookies.get("authToken") ||
      localStorage.getItem("authToken") ||
      import.meta.env.VITE_AUTH_TOKEN ||
      "placeholder-token"
    );
  }

  private loadTenantContext() {
    const savedContext = localStorage.getItem("tenantContext");
    if (savedContext) {
      this.tenantContext = JSON.parse(savedContext);
    } else {
      // Default tenant for demo
      this.tenantContext = {
        tenantId: import.meta.env.VITE_DEFAULT_TENANT_ID || "acme-corp",
        tenantName: "Acme Corporation",
      };
    }
  }

  private handleUnauthorized() {
    // Clear auth token and redirect to login
    Cookies.remove("authToken");
    localStorage.removeItem("authToken");
    // In a real app, you'd redirect to login page
    console.warn("Authentication required");
  }

  private handleForbidden() {
    console.warn("Access forbidden - insufficient permissions");
  }

  private formatError(error: AxiosError): ApiError {
    if (error.response?.data) {
      return error.response.data as ApiError;
    }

    return {
      error: error.message || "An unexpected error occurred",
      code: error.code || "NETWORK_ERROR",
    };
  }

  // Tenant Management
  setTenantContext(context: TenantContext) {
    this.tenantContext = context;
    localStorage.setItem("tenantContext", JSON.stringify(context));
  }

  getTenantContext(): TenantContext | null {
    return this.tenantContext;
  }

  // Health Check
  async checkHealth(): Promise<HealthStatus> {
    const response = await this.api.get<HealthStatus>(
      API_CONFIG.ENDPOINTS.HEALTH
    );
    return response.data;
  }

  // Campaign Management
  async getCampaigns(
    params: PaginatedRequest = {}
  ): Promise<PaginatedResponse<Campaign>> {
    const response = await this.api.get<PaginatedResponse<Campaign>>(
      API_CONFIG.ENDPOINTS.CAMPAIGNS,
      { params }
    );
    return response.data;
  }

  async getCampaign(id: string): Promise<Campaign> {
    const response = await this.api.get<ApiResponse<Campaign>>(
      API_CONFIG.ENDPOINTS.CAMPAIGN_BY_ID(id)
    );
    return response.data.data!;
  }

  async createCampaign(campaign: CreateCampaignRequest): Promise<Campaign> {
    const response = await this.api.post<ApiResponse<Campaign>>(
      API_CONFIG.ENDPOINTS.CAMPAIGNS,
      campaign
    );
    return response.data.data!;
  }

  async updateCampaign(
    id: string,
    updates: Partial<CreateCampaignRequest>
  ): Promise<Campaign> {
    const response = await this.api.put<ApiResponse<Campaign>>(
      API_CONFIG.ENDPOINTS.CAMPAIGN_BY_ID(id),
      updates
    );
    return response.data.data!;
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.api.delete(API_CONFIG.ENDPOINTS.CAMPAIGN_BY_ID(id));
  }

  // Creative Management
  async getCreatives(
    campaignId?: string,
    params: PaginatedRequest = {}
  ): Promise<PaginatedResponse<Creative>> {
    const queryParams = campaignId ? { ...params, campaignId } : params;
    const response = await this.api.get<PaginatedResponse<Creative>>(
      API_CONFIG.ENDPOINTS.CREATIVES,
      { params: queryParams }
    );
    return response.data;
  }

  async getCreative(id: string): Promise<Creative> {
    const response = await this.api.get<ApiResponse<Creative>>(
      API_CONFIG.ENDPOINTS.CREATIVE_BY_ID(id)
    );
    return response.data.data!;
  }

  async createCreative(creative: CreateCreativeRequest): Promise<Creative> {
    const response = await this.api.post<ApiResponse<Creative>>(
      API_CONFIG.ENDPOINTS.CREATIVES,
      creative
    );
    return response.data.data!;
  }

  async generateCreativeWithAI(request: {
    campaignId: string;
    type: Creative["type"];
    prompt: string;
    targetAudience?: string;
    style?: string;
  }): Promise<Creative> {
    const response = await this.api.post<ApiResponse<Creative>>(
      API_CONFIG.ENDPOINTS.CREATIVE_AI_GENERATE,
      request
    );
    return response.data.data!;
  }

  async updateCreative(
    id: string,
    updates: Partial<CreateCreativeRequest>
  ): Promise<Creative> {
    const response = await this.api.put<ApiResponse<Creative>>(
      API_CONFIG.ENDPOINTS.CREATIVE_BY_ID(id),
      updates
    );
    return response.data.data!;
  }

  async deleteCreative(id: string): Promise<void> {
    await this.api.delete(API_CONFIG.ENDPOINTS.CREATIVE_BY_ID(id));
  }

  // Analytics
  async getCampaignAnalytics(
    campaignId: string,
    dateRange?: {
      start: string;
      end: string;
    }
  ): Promise<CampaignAnalytics> {
    const params = dateRange
      ? { start_date: dateRange.start, end_date: dateRange.end }
      : {};
    const response = await this.api.get<ApiResponse<CampaignAnalytics>>(
      API_CONFIG.ENDPOINTS.ANALYTICS_CAMPAIGN(campaignId),
      { params }
    );
    return response.data.data!;
  }

  async getMultiCampaignAnalytics(
    campaignIds?: string[],
    dateRange?: {
      start: string;
      end: string;
    }
  ): Promise<MultiCampaignAnalytics> {
    const params = {
      ...(campaignIds && { campaign_ids: campaignIds.join(",") }),
      ...(dateRange && {
        start_date: dateRange.start,
        end_date: dateRange.end,
      }),
    };
    const response = await this.api.get<ApiResponse<MultiCampaignAnalytics>>(
      API_CONFIG.ENDPOINTS.ANALYTICS_MULTI_CAMPAIGN,
      { params }
    );
    return response.data.data!;
  }

  async getTopCreatives(
    limit: number = 10,
    dateRange?: {
      start: string;
      end: string;
    }
  ): Promise<TopCreatives> {
    const params = {
      limit,
      ...(dateRange && {
        start_date: dateRange.start,
        end_date: dateRange.end,
      }),
    };
    const response = await this.api.get<ApiResponse<TopCreatives>>(
      API_CONFIG.ENDPOINTS.ANALYTICS_TOP_CREATIVES,
      { params }
    );
    return response.data.data!;
  }

  async getPerformanceSummary(): Promise<PerformanceSummary> {
    const response = await this.api.get<ApiResponse<PerformanceSummary>>(
      API_CONFIG.ENDPOINTS.ANALYTICS_SUMMARY
    );
    return response.data.data!;
  }

  // Billing
  async getSubscription(): Promise<Subscription> {
    const response = await this.api.get<ApiResponse<Subscription>>(
      API_CONFIG.ENDPOINTS.BILLING_SUBSCRIPTION
    );
    return response.data.data!;
  }

  async updateSubscription(planId: string): Promise<Subscription> {
    const response = await this.api.put<ApiResponse<Subscription>>(
      API_CONFIG.ENDPOINTS.BILLING_SUBSCRIPTION,
      { plan_id: planId }
    );
    return response.data.data!;
  }

  async getUsageStatistics(): Promise<UsageStatistics> {
    const response = await this.api.get<ApiResponse<UsageStatistics>>(
      API_CONFIG.ENDPOINTS.BILLING_USAGE
    );
    return response.data.data!;
  }

  async getPlanLimits(): Promise<PlanLimits> {
    const response = await this.api.get<ApiResponse<PlanLimits>>(
      API_CONFIG.ENDPOINTS.BILLING_LIMITS
    );
    return response.data.data!;
  }

  async getInvoices(
    params: PaginatedRequest = {}
  ): Promise<PaginatedResponse<Invoice>> {
    const response = await this.api.get<PaginatedResponse<Invoice>>(
      API_CONFIG.ENDPOINTS.BILLING_INVOICES,
      { params }
    );
    return response.data;
  }

  // File Upload (for creative assets)
  async uploadFile(
    file: File,
    type: "image" | "video" | "document"
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await this.api.post<ApiResponse<{ url: string }>>(
      "/api/v1/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data!;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
