import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Campaign,
  Creative,
  CampaignAnalytics,
  PerformanceSummary,
  Subscription,
  UsageStatistics,
  TenantContext,
  HealthStatus,
} from "../types/api";
import apiService from "../services/api";

// Application State Types
interface AppState {
  // Loading states
  loading: {
    campaigns: boolean;
    creatives: boolean;
    analytics: boolean;
    billing: boolean;
    health: boolean;
  };

  // Error states
  errors: {
    campaigns: string | null;
    creatives: string | null;
    analytics: string | null;
    billing: string | null;
    general: string | null;
  };

  // Data
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  creatives: Creative[];
  selectedCreative: Creative | null;
  analytics: CampaignAnalytics | null;
  performanceSummary: PerformanceSummary | null;
  subscription: Subscription | null;
  usage: UsageStatistics | null;
  tenantContext: TenantContext | null;
  healthStatus: HealthStatus | null;

  // UI state
  sidebarOpen: boolean;
  theme: "light" | "dark";

  // Actions
  setLoading: (key: keyof AppState["loading"], value: boolean) => void;
  setError: (key: keyof AppState["errors"], error: string | null) => void;
  clearErrors: () => void;

  // Campaign actions
  fetchCampaigns: () => Promise<void>;
  selectCampaign: (campaign: Campaign | null) => void;
  createCampaign: (campaign: any) => Promise<Campaign>;
  updateCampaign: (id: string, updates: any) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;

  // Creative actions
  fetchCreatives: (campaignId?: string) => Promise<void>;
  selectCreative: (creative: Creative | null) => void;
  createCreative: (creative: any) => Promise<Creative>;
  generateCreativeWithAI: (request: any) => Promise<Creative>;
  updateCreative: (id: string, updates: any) => Promise<Creative>;
  deleteCreative: (id: string) => Promise<void>;

  // Analytics actions
  fetchAnalytics: (campaignId: string, dateRange?: any) => Promise<void>;
  fetchPerformanceSummary: () => Promise<void>;

  // Billing actions
  fetchSubscription: () => Promise<void>;
  fetchUsage: () => Promise<void>;
  updateSubscription: (planId: string) => Promise<void>;

  // Tenant actions
  setTenantContext: (context: TenantContext) => void;

  // Health actions
  checkHealth: () => Promise<void>;

  // UI actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      loading: {
        campaigns: false,
        creatives: false,
        analytics: false,
        billing: false,
        health: false,
      },

      errors: {
        campaigns: null,
        creatives: null,
        analytics: null,
        billing: null,
        general: null,
      },

      campaigns: [],
      selectedCampaign: null,
      creatives: [],
      selectedCreative: null,
      analytics: null,
      performanceSummary: null,
      subscription: null,
      usage: null,
      tenantContext: null,
      healthStatus: null,

      sidebarOpen: true,
      theme: "light",

      // Helper actions
      setLoading: (key, value) => {
        set((state) => ({
          loading: { ...state.loading, [key]: value },
        }));
      },

      setError: (key, error) => {
        set((state) => ({
          errors: { ...state.errors, [key]: error },
        }));
      },

      clearErrors: () => {
        set({
          errors: {
            campaigns: null,
            creatives: null,
            analytics: null,
            billing: null,
            general: null,
          },
        });
      },

      // Campaign actions
      fetchCampaigns: async () => {
        const { setLoading, setError } = get();
        setLoading("campaigns", true);
        setError("campaigns", null);

        try {
          const response = await apiService.getCampaigns();
          set({ campaigns: response.data });
        } catch (error: any) {
          setError("campaigns", error.error || "Failed to fetch campaigns");
        } finally {
          setLoading("campaigns", false);
        }
      },

      selectCampaign: (campaign) => {
        set({ selectedCampaign: campaign });
      },

      createCampaign: async (campaignData) => {
        const { setLoading, setError, fetchCampaigns } = get();
        setLoading("campaigns", true);
        setError("campaigns", null);

        try {
          const campaign = await apiService.createCampaign(campaignData);
          await fetchCampaigns(); // Refresh the list
          return campaign;
        } catch (error: any) {
          setError("campaigns", error.error || "Failed to create campaign");
          throw error;
        } finally {
          setLoading("campaigns", false);
        }
      },

      updateCampaign: async (id, updates) => {
        const { setLoading, setError, fetchCampaigns } = get();
        setLoading("campaigns", true);
        setError("campaigns", null);

        try {
          const campaign = await apiService.updateCampaign(id, updates);
          await fetchCampaigns(); // Refresh the list
          return campaign;
        } catch (error: any) {
          setError("campaigns", error.error || "Failed to update campaign");
          throw error;
        } finally {
          setLoading("campaigns", false);
        }
      },

      deleteCampaign: async (id) => {
        const { setLoading, setError, fetchCampaigns } = get();
        setLoading("campaigns", true);
        setError("campaigns", null);

        try {
          await apiService.deleteCampaign(id);
          await fetchCampaigns(); // Refresh the list

          // Clear selected campaign if it was deleted
          const { selectedCampaign } = get();
          if (selectedCampaign?.id === id) {
            set({ selectedCampaign: null });
          }
        } catch (error: any) {
          setError("campaigns", error.error || "Failed to delete campaign");
          throw error;
        } finally {
          setLoading("campaigns", false);
        }
      },

      // Creative actions
      fetchCreatives: async (campaignId) => {
        const { setLoading, setError } = get();
        setLoading("creatives", true);
        setError("creatives", null);

        try {
          const response = await apiService.getCreatives(campaignId);
          set({ creatives: response.data });
        } catch (error: any) {
          setError("creatives", error.error || "Failed to fetch creatives");
        } finally {
          setLoading("creatives", false);
        }
      },

      selectCreative: (creative) => {
        set({ selectedCreative: creative });
      },

      createCreative: async (creativeData) => {
        const { setLoading, setError, fetchCreatives } = get();
        setLoading("creatives", true);
        setError("creatives", null);

        try {
          const creative = await apiService.createCreative(creativeData);
          await fetchCreatives(creativeData.campaignId); // Refresh the list
          return creative;
        } catch (error: any) {
          setError("creatives", error.error || "Failed to create creative");
          throw error;
        } finally {
          setLoading("creatives", false);
        }
      },

      generateCreativeWithAI: async (request) => {
        const { setLoading, setError, fetchCreatives } = get();
        setLoading("creatives", true);
        setError("creatives", null);

        try {
          const creative = await apiService.generateCreativeWithAI(request);
          await fetchCreatives(request.campaignId); // Refresh the list
          return creative;
        } catch (error: any) {
          setError(
            "creatives",
            error.error || "Failed to generate creative with AI"
          );
          throw error;
        } finally {
          setLoading("creatives", false);
        }
      },

      updateCreative: async (id, updates) => {
        const { setLoading, setError, fetchCreatives, selectedCreative } =
          get();
        setLoading("creatives", true);
        setError("creatives", null);

        try {
          const creative = await apiService.updateCreative(id, updates);
          if (selectedCreative) {
            await fetchCreatives(selectedCreative.campaignId); // Refresh the list
          }
          return creative;
        } catch (error: any) {
          setError("creatives", error.error || "Failed to update creative");
          throw error;
        } finally {
          setLoading("creatives", false);
        }
      },

      deleteCreative: async (id) => {
        const {
          setLoading,
          setError,
          fetchCreatives,
          selectedCreative,
          creatives,
        } = get();
        setLoading("creatives", true);
        setError("creatives", null);

        try {
          await apiService.deleteCreative(id);

          // Find the campaign ID to refresh the list
          const creative = creatives.find((c) => c.id === id);
          if (creative) {
            await fetchCreatives(creative.campaignId);
          }

          // Clear selected creative if it was deleted
          if (selectedCreative?.id === id) {
            set({ selectedCreative: null });
          }
        } catch (error: any) {
          setError("creatives", error.error || "Failed to delete creative");
          throw error;
        } finally {
          setLoading("creatives", false);
        }
      },

      // Analytics actions
      fetchAnalytics: async (campaignId, dateRange) => {
        const { setLoading, setError } = get();
        setLoading("analytics", true);
        setError("analytics", null);

        try {
          const analytics = await apiService.getCampaignAnalytics(
            campaignId,
            dateRange
          );
          set({ analytics });
        } catch (error: any) {
          setError("analytics", error.error || "Failed to fetch analytics");
        } finally {
          setLoading("analytics", false);
        }
      },

      fetchPerformanceSummary: async () => {
        const { setLoading, setError } = get();
        setLoading("analytics", true);
        setError("analytics", null);

        try {
          const performanceSummary = await apiService.getPerformanceSummary();
          set({ performanceSummary });
        } catch (error: any) {
          setError(
            "analytics",
            error.error || "Failed to fetch performance summary"
          );
        } finally {
          setLoading("analytics", false);
        }
      },

      // Billing actions
      fetchSubscription: async () => {
        const { setLoading, setError } = get();
        setLoading("billing", true);
        setError("billing", null);

        try {
          const subscription = await apiService.getSubscription();
          set({ subscription });
        } catch (error: any) {
          setError("billing", error.error || "Failed to fetch subscription");
        } finally {
          setLoading("billing", false);
        }
      },

      fetchUsage: async () => {
        const { setLoading, setError } = get();
        setLoading("billing", true);
        setError("billing", null);

        try {
          const usage = await apiService.getUsageStatistics();
          set({ usage });
        } catch (error: any) {
          setError(
            "billing",
            error.error || "Failed to fetch usage statistics"
          );
        } finally {
          setLoading("billing", false);
        }
      },

      updateSubscription: async (planId) => {
        const { setLoading, setError, fetchSubscription } = get();
        setLoading("billing", true);
        setError("billing", null);

        try {
          await apiService.updateSubscription(planId);
          await fetchSubscription(); // Refresh subscription data
        } catch (error: any) {
          setError("billing", error.error || "Failed to update subscription");
          throw error;
        } finally {
          setLoading("billing", false);
        }
      },

      // Tenant actions
      setTenantContext: (context) => {
        apiService.setTenantContext(context);
        set({ tenantContext: context });
      },

      // Health actions
      checkHealth: async () => {
        const { setLoading, setError } = get();
        setLoading("health", true);
        setError("general", null);

        try {
          const healthStatus = await apiService.checkHealth();
          set({ healthStatus });
        } catch (error: any) {
          setError("general", error.error || "Failed to check health");
        } finally {
          setLoading("health", false);
        }
      },

      // UI actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: "adgenius-app-store",
      partialize: (state) => ({
        tenantContext: state.tenantContext,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
