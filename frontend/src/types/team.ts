// Enhanced Role-Based Access Control (RBAC) Types for Multi-Tenant SaaS Platform

// Global Platform Roles
export type GlobalRole = "superadmin";

// Tenant-Specific Roles
export type TenantRole = "tenant_admin" | "tenant_marketer" | "tenant_analyst";

// Combined Role Type
export type UserRole = GlobalRole | TenantRole | "user";

// Permission Categories
export type PermissionCategory =
  | "platform_management" // Super admin permissions
  | "tenant_management" // Tenant admin permissions
  | "campaign_management" // Marketer permissions
  | "creative_management" // Marketer permissions
  | "budget_management" // Marketer permissions
  | "analytics_access" // Analyst permissions
  | "reporting_access" // Analyst permissions
  | "billing_access" // Analyst permissions
  | "user_management"; // Tenant admin permissions

// Specific Permissions
export type Permission =
  // Platform Management (Super Admin Only)
  | "platform:read_all_tenants"
  | "platform:create_tenant"
  | "platform:delete_tenant"
  | "platform:manage_global_settings"
  | "platform:view_global_analytics"
  | "platform:manage_global_billing"

  // Tenant Management (Tenant Admin)
  | "tenant:read_users"
  | "tenant:create_users"
  | "tenant:update_users"
  | "tenant:delete_users"
  | "tenant:manage_roles"
  | "tenant:view_tenant_settings"
  | "tenant:update_tenant_settings"

  // Campaign Management (Marketer)
  | "campaigns:read"
  | "campaigns:create"
  | "campaigns:update"
  | "campaigns:delete"
  | "campaigns:launch"
  | "campaigns:pause"

  // Creative Management (Marketer)
  | "creatives:read"
  | "creatives:create"
  | "creatives:update"
  | "creatives:delete"
  | "creatives:generate_ai"

  // Budget Management (Marketer)
  | "budgets:read"
  | "budgets:update"
  | "budgets:allocate"

  // Analytics & Reporting (Analyst)
  | "analytics:read_campaign_data"
  | "analytics:read_performance_data"
  | "analytics:export_reports"
  | "analytics:create_custom_reports"

  // Billing Access (Analyst)
  | "billing:read_invoices"
  | "billing:export_invoices"
  | "billing:view_usage_data"
  | "billing:generate_billing_reports";

// Role Permission Mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Super Admin - Global platform access
  superadmin: [
    "platform:read_all_tenants",
    "platform:create_tenant",
    "platform:delete_tenant",
    "platform:manage_global_settings",
    "platform:view_global_analytics",
    "platform:manage_global_billing",
  ],

  // Tenant Admin - Full tenant management
  tenant_admin: [
    "tenant:read_users",
    "tenant:create_users",
    "tenant:update_users",
    "tenant:delete_users",
    "tenant:manage_roles",
    "tenant:view_tenant_settings",
    "tenant:update_tenant_settings",
    "campaigns:read",
    "campaigns:create",
    "campaigns:update",
    "campaigns:delete",
    "campaigns:launch",
    "campaigns:pause",
    "creatives:read",
    "creatives:create",
    "creatives:update",
    "creatives:delete",
    "creatives:generate_ai",
    "budgets:read",
    "budgets:update",
    "budgets:allocate",
    "analytics:read_campaign_data",
    "analytics:read_performance_data",
    "analytics:export_reports",
    "analytics:create_custom_reports",
    "billing:read_invoices",
    "billing:export_invoices",
    "billing:view_usage_data",
    "billing:generate_billing_reports",
  ],

  // Tenant Marketer - Campaign and creative management
  tenant_marketer: [
    "campaigns:read",
    "campaigns:create",
    "campaigns:update",
    "campaigns:delete",
    "campaigns:launch",
    "campaigns:pause",
    "creatives:read",
    "creatives:create",
    "creatives:update",
    "creatives:delete",
    "creatives:generate_ai",
    "budgets:read",
    "budgets:update",
    "budgets:allocate",
    "analytics:read_campaign_data",
    "analytics:read_performance_data",
  ],

  // Tenant Analyst - Analytics, reporting, and billing
  tenant_analyst: [
    "campaigns:read",
    "creatives:read",
    "analytics:read_campaign_data",
    "analytics:read_performance_data",
    "analytics:export_reports",
    "analytics:create_custom_reports",
    "billing:read_invoices",
    "billing:export_invoices",
    "billing:view_usage_data",
    "billing:generate_billing_reports",
  ],

  // Regular User - Basic access
  user: [],
};

// Enhanced User Profile Interface
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  role: UserRole;
  tenantId?: string; // null for super admin, required for tenant roles
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  metadata?: {
    department?: string;
    jobTitle?: string;
    phoneNumber?: string;
    timezone?: string;
  };
}

// Team Member Interface
export interface TeamMember {
  id: string;
  userId: string;
  tenantId: string;
  role: TenantRole;
  email: string;
  displayName?: string;
  isActive: boolean;
  invitedBy: string;
  invitedAt: string;
  joinedAt?: string;
  permissions: Permission[];
  metadata?: {
    department?: string;
    jobTitle?: string;
    phoneNumber?: string;
  };
}

// Team Invitation Interface
export interface TeamInvitation {
  id: string;
  tenantId: string;
  email: string;
  role: TenantRole;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "declined" | "expired" | "revoked";
  token: string;
  message?: string; // Optional personal message from inviter
}

// Enhanced Tenant Interface
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: "trial" | "starter" | "pro" | "enterprise";
  status: "active" | "suspended" | "trial" | "cancelled";
  settings: {
    maxUsers: number;
    features: string[];
    customBranding?: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
  };
  billing: {
    subscription: {
      plan: string;
      status: string;
      currentPeriodStart: string;
      currentPeriodEnd: string;
    };
    usage: {
      users: number;
      campaigns: number;
      creatives: number;
      apiCalls: number;
    };
    limits: {
      maxUsers: number;
      maxCampaigns: number;
      maxCreatives: number;
      maxApiCalls: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// Permission Check Utility Types
export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
}

// API Endpoints for Team Management
export const TEAM_MANAGEMENT_ENDPOINTS = {
  // Team Members
  TEAM_MEMBERS: (tenantId: string) => `/api/v1/tenants/${tenantId}/team`,
  TEAM_MEMBER_BY_ID: (tenantId: string, memberId: string) =>
    `/api/v1/tenants/${tenantId}/team/${memberId}`,

  // Invitations
  TEAM_INVITATIONS: (tenantId: string) =>
    `/api/v1/tenants/${tenantId}/invitations`,
  TEAM_INVITATION_BY_ID: (tenantId: string, invitationId: string) =>
    `/api/v1/tenants/${tenantId}/invitations/${invitationId}`,
  ACCEPT_INVITATION: (token: string) => `/api/v1/invitations/${token}/accept`,

  // Role Management
  UPDATE_MEMBER_ROLE: (tenantId: string, memberId: string) =>
    `/api/v1/tenants/${tenantId}/team/${memberId}/role`,

  // Permissions
  CHECK_PERMISSION: `/api/v1/permissions/check`,
  USER_PERMISSIONS: `/api/v1/permissions/user`,
};

// Request/Response Types for Team Management
export interface CreateTeamMemberRequest {
  email: string;
  role: TenantRole;
  displayName?: string;
  metadata?: {
    department?: string;
    jobTitle?: string;
    phoneNumber?: string;
  };
}

export interface UpdateTeamMemberRequest {
  role?: TenantRole;
  isActive?: boolean;
  metadata?: {
    department?: string;
    jobTitle?: string;
    phoneNumber?: string;
  };
}

export interface InviteTeamMemberRequest {
  email: string;
  role: TenantRole;
  message?: string;
}

export interface AcceptInvitationRequest {
  token: string;
  displayName?: string;
  password?: string;
}

export interface CheckPermissionRequest {
  permission: Permission;
  resource?: string;
  tenantId?: string;
}

export interface BulkRoleUpdateRequest {
  updates: Array<{
    userId: string;
    role: TenantRole;
  }>;
}

// Utility function to check if user has permission
export function hasPermission(
  userRole: UserRole,
  permission: Permission
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

// Utility function to get all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Utility function to check if role is tenant-specific
export function isTenantRole(role: UserRole): role is TenantRole {
  return ["tenant_admin", "tenant_marketer", "tenant_analyst"].includes(
    role as TenantRole
  );
}

// Utility function to check if role is global
export function isGlobalRole(role: UserRole): role is GlobalRole {
  return role === "superadmin";
}

// Role hierarchy levels (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  tenant_analyst: 1,
  tenant_marketer: 2,
  tenant_admin: 3,
  superadmin: 10,
};

// Check if one role can manage another role
export function canManageRole(
  managerRole: UserRole,
  targetRole: UserRole
): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}
