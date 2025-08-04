import { useState, useEffect, useCallback } from "react";
import apiService from "../services/api";
import {
  Campaign,
  Creative,
  CampaignAnalytics,
  HealthStatus,
} from "../types/api";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  return { loading, error, clearError, setLoading, setError };
};

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { loading, error, clearError, setLoading, setError } = useApi();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    clearError();
    try {
      const response = await apiService.getCampaigns();
      setCampaigns(response.data || []);
    } catch (err: any) {
      console.error("Error fetching campaigns:", err);
      setError(err.message || "Failed to fetch campaigns");
      setCampaigns([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const createCampaign = async (campaignData: any) => {
    setLoading(true);
    clearError();
    try {
      const response = await apiService.createCampaign(campaignData);
      await fetchCampaigns(); // Refresh list
      return response;
    } catch (err: any) {
      console.error("Error creating campaign:", err);
      setError(err.message || "Failed to create campaign");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (id: string, campaignData: any) => {
    setLoading(true);
    clearError();
    try {
      const response = await apiService.updateCampaign(id, campaignData);
      await fetchCampaigns(); // Refresh list
      return response;
    } catch (err: any) {
      console.error("Error updating campaign:", err);
      setError(err.message || "Failed to update campaign");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    setLoading(true);
    clearError();
    try {
      await apiService.deleteCampaign(id);
      await fetchCampaigns(); // Refresh list
    } catch (err: any) {
      console.error("Error deleting campaign:", err);
      setError(err.message || "Failed to delete campaign");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    clearError,
  };
};

export const useCreatives = () => {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const { loading, error, clearError, setLoading, setError } = useApi();

  const fetchCreatives = useCallback(async () => {
    setLoading(true);
    clearError();
    try {
      const response = await apiService.getCreatives();
      setCreatives(response.data || []);
    } catch (err: any) {
      console.error("Error fetching creatives:", err);
      setError(err.message || "Failed to fetch creatives");
      setCreatives([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const createCreative = async (creativeData: any) => {
    setLoading(true);
    clearError();
    try {
      const response = await apiService.createCreative(creativeData);
      await fetchCreatives(); // Refresh list
      return response;
    } catch (err: any) {
      console.error("Error creating creative:", err);
      setError(err.message || "Failed to create creative");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatives();
  }, [fetchCreatives]);

  return {
    creatives,
    loading,
    error,
    fetchCreatives,
    createCreative,
    clearError,
  };
};

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const { loading, error, clearError, setLoading, setError } = useApi();

  const fetchCampaignAnalytics = async (campaignId: string) => {
    setLoading(true);
    clearError();
    try {
      const response = await apiService.getCampaignAnalytics(campaignId);
      setAnalytics(response || null);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Failed to fetch analytics");
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryAnalytics = async () => {
    setLoading(true);
    clearError();
    try {
      const response = await apiService.getPerformanceSummary();
      return response;
    } catch (err: any) {
      console.error("Error fetching summary analytics:", err);
      setError(err.message || "Failed to fetch summary analytics");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    error,
    fetchCampaignAnalytics,
    fetchSummaryAnalytics,
    clearError,
  };
};

export const useHealth = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const { loading, error, clearError, setLoading, setError } = useApi();

  const checkHealth = useCallback(async () => {
    setLoading(true);
    clearError();
    try {
      const response = await apiService.checkHealth();
      setHealthStatus(response || null);
    } catch (err: any) {
      console.error("Error checking health:", err);
      setError(err.message || "Failed to check health");
      setHealthStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    healthStatus,
    loading,
    error,
    checkHealth,
    clearError,
  };
};
