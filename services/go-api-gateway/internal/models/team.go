package models

import (
	"time"
)

// Enhanced Role definitions for multi-tenant RBAC system
type UserRole string

const (
	// Global Platform Roles
	RoleSuperAdmin UserRole = "superadmin"

	// Tenant-Specific Roles
	RoleTenantAdmin    UserRole = "tenant_admin"
	RoleTenantMarketer UserRole = "tenant_marketer"
	RoleTenantAnalyst  UserRole = "tenant_analyst"

	// Basic User Role
	RoleUser UserRole = "user"
)

// Permission types
type Permission string

const (
	// Platform Management (Super Admin Only)
	PermissionPlatformReadAllTenants       Permission = "platform:read_all_tenants"
	PermissionPlatformCreateTenant         Permission = "platform:create_tenant"
	PermissionPlatformDeleteTenant         Permission = "platform:delete_tenant"
	PermissionPlatformManageGlobalSettings Permission = "platform:manage_global_settings"
	PermissionPlatformViewGlobalAnalytics  Permission = "platform:view_global_analytics"
	PermissionPlatformManageGlobalBilling  Permission = "platform:manage_global_billing"

	// Tenant Management (Tenant Admin)
	PermissionTenantReadUsers      Permission = "tenant:read_users"
	PermissionTenantCreateUsers    Permission = "tenant:create_users"
	PermissionTenantUpdateUsers    Permission = "tenant:update_users"
	PermissionTenantDeleteUsers    Permission = "tenant:delete_users"
	PermissionTenantManageRoles    Permission = "tenant:manage_roles"
	PermissionTenantViewSettings   Permission = "tenant:view_tenant_settings"
	PermissionTenantUpdateSettings Permission = "tenant:update_tenant_settings"

	// Campaign Management (Marketer)
	PermissionCampaignsRead   Permission = "campaigns:read"
	PermissionCampaignsCreate Permission = "campaigns:create"
	PermissionCampaignsUpdate Permission = "campaigns:update"
	PermissionCampaignsDelete Permission = "campaigns:delete"
	PermissionCampaignsLaunch Permission = "campaigns:launch"
	PermissionCampaignsPause  Permission = "campaigns:pause"

	// Creative Management (Marketer)
	PermissionCreativesRead       Permission = "creatives:read"
	PermissionCreativesCreate     Permission = "creatives:create"
	PermissionCreativesUpdate     Permission = "creatives:update"
	PermissionCreativesDelete     Permission = "creatives:delete"
	PermissionCreativesGenerateAI Permission = "creatives:generate_ai"

	// Budget Management (Marketer)
	PermissionBudgetsRead     Permission = "budgets:read"
	PermissionBudgetsUpdate   Permission = "budgets:update"
	PermissionBudgetsAllocate Permission = "budgets:allocate"

	// Analytics & Reporting (Analyst)
	PermissionAnalyticsReadCampaignData    Permission = "analytics:read_campaign_data"
	PermissionAnalyticsReadPerformanceData Permission = "analytics:read_performance_data"
	PermissionAnalyticsExportReports       Permission = "analytics:export_reports"
	PermissionAnalyticsCreateCustomReports Permission = "analytics:create_custom_reports"

	// Billing Access (Analyst)
	PermissionBillingReadInvoices           Permission = "billing:read_invoices"
	PermissionBillingExportInvoices         Permission = "billing:export_invoices"
	PermissionBillingViewUsageData          Permission = "billing:view_usage_data"
	PermissionBillingGenerateBillingReports Permission = "billing:generate_billing_reports"
)

// Enhanced UserProfile with comprehensive RBAC
type EnhancedUserProfile struct {
	UID           string                 `firestore:"-" json:"uid"` // Document ID
	Email         string                 `firestore:"email" json:"email"`
	DisplayName   string                 `firestore:"display_name" json:"display_name"`
	PhotoURL      string                 `firestore:"photo_url" json:"photo_url,omitempty"`
	EmailVerified bool                   `firestore:"email_verified" json:"email_verified"`
	Role          UserRole               `firestore:"role" json:"role"`
	TenantID      string                 `firestore:"tenant_id" json:"tenant_id,omitempty"` // null for super admin
	Permissions   []Permission           `firestore:"permissions" json:"permissions"`
	IsActive      bool                   `firestore:"is_active" json:"is_active"`
	CreatedAt     time.Time              `firestore:"created_at" json:"created_at"`
	UpdatedAt     time.Time              `firestore:"updated_at" json:"updated_at"`
	LastLoginAt   *time.Time             `firestore:"last_login_at" json:"last_login_at,omitempty"`
	Metadata      map[string]interface{} `firestore:"metadata" json:"metadata,omitempty"`

	// AI Model Configurations (preserved from original)
	AIModels    map[string]interface{} `firestore:"ai_models" json:"ai_models,omitempty"`
	MediaModels map[string]interface{} `firestore:"media_models" json:"media_models,omitempty"`
	Security    map[string]interface{} `firestore:"security" json:"security,omitempty"`
	Preferences map[string]interface{} `firestore:"preferences" json:"preferences,omitempty"`
}

// TeamMember represents a member of a tenant's team
type TeamMember struct {
	ID          string                 `firestore:"-" json:"id"` // Document ID
	UserID      string                 `firestore:"user_id" json:"user_id"`
	TenantID    string                 `firestore:"tenant_id" json:"tenant_id"`
	Email       string                 `firestore:"email" json:"email"`
	DisplayName string                 `firestore:"display_name" json:"display_name,omitempty"`
	Role        UserRole               `firestore:"role" json:"role"`
	Permissions []Permission           `firestore:"permissions" json:"permissions"`
	IsActive    bool                   `firestore:"is_active" json:"is_active"`
	InvitedBy   string                 `firestore:"invited_by" json:"invited_by"`
	InvitedAt   time.Time              `firestore:"invited_at" json:"invited_at"`
	JoinedAt    *time.Time             `firestore:"joined_at" json:"joined_at,omitempty"`
	CreatedAt   time.Time              `firestore:"created_at" json:"created_at"`
	UpdatedAt   time.Time              `firestore:"updated_at" json:"updated_at"`
	Metadata    map[string]interface{} `firestore:"metadata" json:"metadata,omitempty"`
}

// TeamInvitation represents an invitation to join a tenant's team
type TeamInvitation struct {
	ID        string    `firestore:"-" json:"id"` // Document ID
	TenantID  string    `firestore:"tenant_id" json:"tenant_id"`
	Email     string    `firestore:"email" json:"email"`
	Role      UserRole  `firestore:"role" json:"role"`
	InvitedBy string    `firestore:"invited_by" json:"invited_by"`
	InvitedAt time.Time `firestore:"invited_at" json:"invited_at"`
	ExpiresAt time.Time `firestore:"expires_at" json:"expires_at"`
	Status    string    `firestore:"status" json:"status"` // pending, accepted, expired, revoked
	Token     string    `firestore:"token" json:"token"`
	Message   string    `firestore:"message" json:"message,omitempty"`
	CreatedAt time.Time `firestore:"created_at" json:"created_at"`
	UpdatedAt time.Time `firestore:"updated_at" json:"updated_at"`
}

// Tenant represents a tenant organization
type Tenant struct {
	ID        string    `firestore:"-" json:"id"` // Document ID
	Name      string    `firestore:"name" json:"name"`
	Domain    string    `firestore:"domain" json:"domain"`
	Plan      string    `firestore:"plan" json:"plan"`     // trial, starter, pro, enterprise
	Status    string    `firestore:"status" json:"status"` // active, suspended, trial, cancelled
	CreatedAt time.Time `firestore:"created_at" json:"created_at"`
	UpdatedAt time.Time `firestore:"updated_at" json:"updated_at"`

	// Settings
	Settings struct {
		MaxUsers       int                    `firestore:"max_users" json:"max_users"`
		Features       []string               `firestore:"features" json:"features"`
		CustomBranding map[string]interface{} `firestore:"custom_branding" json:"custom_branding,omitempty"`
	} `firestore:"settings" json:"settings"`

	// Billing Information
	Billing struct {
		Subscription struct {
			Plan               string    `firestore:"plan" json:"plan"`
			Status             string    `firestore:"status" json:"status"`
			CurrentPeriodStart time.Time `firestore:"current_period_start" json:"current_period_start"`
			CurrentPeriodEnd   time.Time `firestore:"current_period_end" json:"current_period_end"`
		} `firestore:"subscription" json:"subscription"`

		Usage struct {
			Users     int `firestore:"users" json:"users"`
			Campaigns int `firestore:"campaigns" json:"campaigns"`
			Creatives int `firestore:"creatives" json:"creatives"`
			APICalls  int `firestore:"api_calls" json:"api_calls"`
		} `firestore:"usage" json:"usage"`

		Limits struct {
			MaxUsers     int `firestore:"max_users" json:"max_users"`
			MaxCampaigns int `firestore:"max_campaigns" json:"max_campaigns"`
			MaxCreatives int `firestore:"max_creatives" json:"max_creatives"`
			MaxAPICalls  int `firestore:"max_api_calls" json:"max_api_calls"`
		} `firestore:"limits" json:"limits"`
	} `firestore:"billing" json:"billing"`
}

// Request/Response Models for Team Management APIs

// CreateTeamMemberRequest represents request to add a team member
type CreateTeamMemberRequest struct {
	Email       string                 `json:"email" binding:"required,email"`
	Role        UserRole               `json:"role" binding:"required"`
	DisplayName string                 `json:"display_name,omitempty"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// UpdateTeamMemberRequest represents request to update a team member
type UpdateTeamMemberRequest struct {
	Role     *UserRole              `json:"role,omitempty"`
	IsActive *bool                  `json:"is_active,omitempty"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// InviteTeamMemberRequest represents request to invite a team member
type InviteTeamMemberRequest struct {
	Email   string   `json:"email" binding:"required,email"`
	Role    UserRole `json:"role" binding:"required"`
	Message string   `json:"message,omitempty"`
}

// AcceptInvitationRequest represents request to accept an invitation
type AcceptInvitationRequest struct {
	Token       string `json:"token" binding:"required"`
	DisplayName string `json:"display_name,omitempty"`
	Password    string `json:"password,omitempty"`
}

// CheckPermissionRequest represents request to check user permissions
type CheckPermissionRequest struct {
	Permission Permission `json:"permission" binding:"required"`
	Resource   string     `json:"resource,omitempty"`
	TenantID   string     `json:"tenant_id,omitempty"`
}

// CheckPermissionResponse represents response for permission check
type CheckPermissionResponse struct {
	HasPermission bool   `json:"has_permission"`
	Reason        string `json:"reason,omitempty"`
}

// BulkRoleUpdateRequest represents request to update multiple user roles
type BulkRoleUpdateRequest struct {
	Updates []struct {
		UserID string   `json:"user_id"`
		Role   UserRole `json:"role"`
	} `json:"updates" binding:"required"`
}

// TeamMemberResponse represents team member data for API responses
type TeamMemberResponse struct {
	ID          string                 `json:"id"`
	UserID      string                 `json:"user_id"`
	Email       string                 `json:"email"`
	DisplayName string                 `json:"display_name,omitempty"`
	Role        UserRole               `json:"role"`
	Permissions []Permission           `json:"permissions"`
	IsActive    bool                   `json:"is_active"`
	InvitedBy   string                 `json:"invited_by"`
	InvitedAt   time.Time              `json:"invited_at"`
	JoinedAt    *time.Time             `json:"joined_at,omitempty"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// TeamInvitationResponse represents team invitation data for API responses
type TeamInvitationResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Role      UserRole  `json:"role"`
	InvitedBy string    `json:"invited_by"`
	InvitedAt time.Time `json:"invited_at"`
	ExpiresAt time.Time `json:"expires_at"`
	Status    string    `json:"status"`
	Message   string    `json:"message,omitempty"`
}

// PaginatedTeamMembersResponse represents paginated team members response
type PaginatedTeamMembersResponse struct {
	Members    []TeamMemberResponse `json:"members"`
	Pagination PaginationInfo       `json:"pagination"`
}

// PaginatedTeamInvitationsResponse represents paginated team invitations response
type PaginatedTeamInvitationsResponse struct {
	Invitations []TeamInvitationResponse `json:"invitations"`
	Pagination  PaginationInfo           `json:"pagination"`
}

// PaginationInfo represents pagination metadata
type PaginationInfo struct {
	Page       int  `json:"page"`
	Limit      int  `json:"limit"`
	Total      int  `json:"total"`
	TotalPages int  `json:"total_pages"`
	HasNext    bool `json:"has_next"`
	HasPrev    bool `json:"has_prev"`
}

// Role Permission Mapping
var RolePermissions = map[UserRole][]Permission{
	RoleSuperAdmin: {
		PermissionPlatformReadAllTenants,
		PermissionPlatformCreateTenant,
		PermissionPlatformDeleteTenant,
		PermissionPlatformManageGlobalSettings,
		PermissionPlatformViewGlobalAnalytics,
		PermissionPlatformManageGlobalBilling,
	},
	RoleTenantAdmin: {
		PermissionTenantReadUsers,
		PermissionTenantCreateUsers,
		PermissionTenantUpdateUsers,
		PermissionTenantDeleteUsers,
		PermissionTenantManageRoles,
		PermissionTenantViewSettings,
		PermissionTenantUpdateSettings,
		PermissionCampaignsRead,
		PermissionCampaignsCreate,
		PermissionCampaignsUpdate,
		PermissionCampaignsDelete,
		PermissionCampaignsLaunch,
		PermissionCampaignsPause,
		PermissionCreativesRead,
		PermissionCreativesCreate,
		PermissionCreativesUpdate,
		PermissionCreativesDelete,
		PermissionCreativesGenerateAI,
		PermissionBudgetsRead,
		PermissionBudgetsUpdate,
		PermissionBudgetsAllocate,
		PermissionAnalyticsReadCampaignData,
		PermissionAnalyticsReadPerformanceData,
		PermissionAnalyticsExportReports,
		PermissionAnalyticsCreateCustomReports,
		PermissionBillingReadInvoices,
		PermissionBillingExportInvoices,
		PermissionBillingViewUsageData,
		PermissionBillingGenerateBillingReports,
	},
	RoleTenantMarketer: {
		PermissionCampaignsRead,
		PermissionCampaignsCreate,
		PermissionCampaignsUpdate,
		PermissionCampaignsDelete,
		PermissionCampaignsLaunch,
		PermissionCampaignsPause,
		PermissionCreativesRead,
		PermissionCreativesCreate,
		PermissionCreativesUpdate,
		PermissionCreativesDelete,
		PermissionCreativesGenerateAI,
		PermissionBudgetsRead,
		PermissionBudgetsUpdate,
		PermissionBudgetsAllocate,
		PermissionAnalyticsReadCampaignData,
		PermissionAnalyticsReadPerformanceData,
	},
	RoleTenantAnalyst: {
		PermissionCampaignsRead,
		PermissionCreativesRead,
		PermissionAnalyticsReadCampaignData,
		PermissionAnalyticsReadPerformanceData,
		PermissionAnalyticsExportReports,
		PermissionAnalyticsCreateCustomReports,
		PermissionBillingReadInvoices,
		PermissionBillingExportInvoices,
		PermissionBillingViewUsageData,
		PermissionBillingGenerateBillingReports,
	},
	RoleUser: {},
}

// Utility functions

// HasPermission checks if a user role has a specific permission
func (r UserRole) HasPermission(permission Permission) bool {
	permissions, exists := RolePermissions[r]
	if !exists {
		return false
	}

	for _, p := range permissions {
		if p == permission {
			return true
		}
	}
	return false
}

// GetPermissions returns all permissions for a role
func (r UserRole) GetPermissions() []Permission {
	permissions, exists := RolePermissions[r]
	if !exists {
		return []Permission{}
	}
	return permissions
}

// IsTenantRole checks if a role is tenant-specific
func (r UserRole) IsTenantRole() bool {
	return r == RoleTenantAdmin || r == RoleTenantMarketer || r == RoleTenantAnalyst
}

// IsGlobalRole checks if a role is global
func (r UserRole) IsGlobalRole() bool {
	return r == RoleSuperAdmin
}

// Role hierarchy levels (higher number = more permissions)
var RoleHierarchy = map[UserRole]int{
	RoleUser:           0,
	RoleTenantAnalyst:  1,
	RoleTenantMarketer: 2,
	RoleTenantAdmin:    3,
	RoleSuperAdmin:     10,
}

// CanManageRole checks if one role can manage another role
func (r UserRole) CanManageRole(targetRole UserRole) bool {
	managerLevel, exists := RoleHierarchy[r]
	if !exists {
		return false
	}

	targetLevel, exists := RoleHierarchy[targetRole]
	if !exists {
		return false
	}

	return managerLevel > targetLevel
}

// IsValidRole checks if a role string is valid
func IsValidRole(role string) bool {
	switch UserRole(role) {
	case RoleSuperAdmin, RoleTenantAdmin, RoleTenantMarketer, RoleTenantAnalyst, RoleUser:
		return true
	default:
		return false
	}
}

// IsValidPermission checks if a permission string is valid
func IsValidPermission(permission string) bool {
	// This could be expanded to include all permissions
	// For now, we'll do a simple check
	return len(permission) > 0 && (permission[0] != ' ' && permission[len(permission)-1] != ' ')
}
