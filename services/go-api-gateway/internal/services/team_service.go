package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/models"
)

// TeamService handles team management operations
type TeamService struct {
	client *firestore.Client
}

// NewTeamService creates a new TeamService instance
func NewTeamService(client *firestore.Client) *TeamService {
	return &TeamService{
		client: client,
	}
}

// Collection names
const (
	CollectionTeamMembers    = "team_members"
	CollectionTeamInvitations = "team_invitations"
	CollectionTenants        = "tenants"
	CollectionUserProfiles   = "user_profiles"
)

// GetTeamMembers retrieves team members for a tenant with pagination
func (s *TeamService) GetTeamMembers(ctx context.Context, tenantID string, page, limit int) (*models.PaginatedTeamMembersResponse, error) {
	// Calculate offset
	offset := (page - 1) * limit
	
	// Query team members
	query := s.client.Collection(CollectionTeamMembers).
		Where("tenant_id", "==", tenantID).
		Where("is_active", "==", true).
		OrderBy("created_at", firestore.Desc).
		Limit(limit).
		Offset(offset)
	
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get team members: %w", err)
	}
	
	var members []models.TeamMemberResponse
	for _, doc := range docs {
		var member models.TeamMember
		if err := doc.DataTo(&member); err != nil {
			log.Printf("Error unmarshaling team member %s: %v", doc.Ref.ID, err)
			continue
		}
		member.ID = doc.Ref.ID
		
		// Convert to response model
		response := models.TeamMemberResponse{
			ID:          member.ID,
			UserID:      member.UserID,
			Email:       member.Email,
			DisplayName: member.DisplayName,
			Role:        member.Role,
			Permissions: member.Permissions,
			IsActive:    member.IsActive,
			InvitedBy:   member.InvitedBy,
			InvitedAt:   member.InvitedAt,
			JoinedAt:    member.JoinedAt,
			Metadata:    member.Metadata,
		}
		members = append(members, response)
	}
	
	// Get total count for pagination
	totalQuery := s.client.Collection(CollectionTeamMembers).
		Where("tenant_id", "==", tenantID).
		Where("is_active", "==", true)
	
	totalDocs, err := totalQuery.Documents(ctx).GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get total count: %w", err)
	}
	
	total := len(totalDocs)
	totalPages := (total + limit - 1) / limit
	
	return &models.PaginatedTeamMembersResponse{
		Members: members,
		Pagination: models.PaginationInfo{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
			HasNext:    page < totalPages,
			HasPrev:    page > 1,
		},
	}, nil
}

// GetTeamMember retrieves a specific team member
func (s *TeamService) GetTeamMember(ctx context.Context, tenantID, memberID string) (*models.TeamMemberResponse, error) {
	doc, err := s.client.Collection(CollectionTeamMembers).Doc(memberID).Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get team member: %w", err)
	}
	
	var member models.TeamMember
	if err := doc.DataTo(&member); err != nil {
		return nil, fmt.Errorf("failed to unmarshal team member: %w", err)
	}
	member.ID = doc.Ref.ID
	
	// Verify tenant ID matches
	if member.TenantID != tenantID {
		return nil, fmt.Errorf("team member not found in specified tenant")
	}
	
	return &models.TeamMemberResponse{
		ID:          member.ID,
		UserID:      member.UserID,
		Email:       member.Email,
		DisplayName: member.DisplayName,
		Role:        member.Role,
		Permissions: member.Permissions,
		IsActive:    member.IsActive,
		InvitedBy:   member.InvitedBy,
		InvitedAt:   member.InvitedAt,
		JoinedAt:    member.JoinedAt,
		Metadata:    member.Metadata,
	}, nil
}

// CreateTeamMember adds a new team member (internal user already exists)
func (s *TeamService) CreateTeamMember(ctx context.Context, tenantID, inviterID string, req *models.CreateTeamMemberRequest) (*models.TeamMemberResponse, error) {
	// Validate role
	if !models.IsValidRole(string(req.Role)) {
		return nil, fmt.Errorf("invalid role: %s", req.Role)
	}
	
	// Check if user already exists in this tenant
	existingQuery := s.client.Collection(CollectionTeamMembers).
		Where("tenant_id", "==", tenantID).
		Where("email", "==", req.Email).
		Where("is_active", "==", true)
	
	existingDocs, err := existingQuery.Documents(ctx).GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to check existing member: %w", err)
	}
	
	if len(existingDocs) > 0 {
		return nil, fmt.Errorf("user already exists in this tenant")
	}
	
	// Create team member
	now := time.Now()
	member := models.TeamMember{
		UserID:      "", // Will be set when user joins
		TenantID:    tenantID,
		Email:       req.Email,
		DisplayName: req.DisplayName,
		Role:        req.Role,
		Permissions: req.Role.GetPermissions(),
		IsActive:    true,
		InvitedBy:   inviterID,
		InvitedAt:   now,
		CreatedAt:   now,
		UpdatedAt:   now,
		Metadata:    req.Metadata,
	}
	
	// Add to Firestore
	docRef, _, err := s.client.Collection(CollectionTeamMembers).Add(ctx, member)
	if err != nil {
		return nil, fmt.Errorf("failed to create team member: %w", err)
	}
	
	member.ID = docRef.ID
	
	return &models.TeamMemberResponse{
		ID:          member.ID,
		UserID:      member.UserID,
		Email:       member.Email,
		DisplayName: member.DisplayName,
		Role:        member.Role,
		Permissions: member.Permissions,
		IsActive:    member.IsActive,
		InvitedBy:   member.InvitedBy,
		InvitedAt:   member.InvitedAt,
		JoinedAt:    member.JoinedAt,
		Metadata:    member.Metadata,
	}, nil
}

// UpdateTeamMember updates an existing team member
func (s *TeamService) UpdateTeamMember(ctx context.Context, tenantID, memberID string, req *models.UpdateTeamMemberRequest) (*models.TeamMemberResponse, error) {
	// Get existing member
	doc, err := s.client.Collection(CollectionTeamMembers).Doc(memberID).Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get team member: %w", err)
	}
	
	var member models.TeamMember
	if err := doc.DataTo(&member); err != nil {
		return nil, fmt.Errorf("failed to unmarshal team member: %w", err)
	}
	
	// Verify tenant ID
	if member.TenantID != tenantID {
		return nil, fmt.Errorf("team member not found in specified tenant")
	}
	
	// Prepare update data
	updates := map[string]interface{}{
		"updated_at": time.Now(),
	}
	
	if req.Role != nil {
		if !models.IsValidRole(string(*req.Role)) {
			return nil, fmt.Errorf("invalid role: %s", *req.Role)
		}
		updates["role"] = *req.Role
		updates["permissions"] = req.Role.GetPermissions()
		member.Role = *req.Role
		member.Permissions = req.Role.GetPermissions()
	}
	
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
		member.IsActive = *req.IsActive
	}
	
	if req.Metadata != nil {
		updates["metadata"] = req.Metadata
		member.Metadata = req.Metadata
	}
	
	// Update in Firestore
	_, err = s.client.Collection(CollectionTeamMembers).Doc(memberID).Update(ctx, 
		[]firestore.Update{
			{Path: "updated_at", Value: updates["updated_at"]},
		})
	
	if req.Role != nil {
		_, err = s.client.Collection(CollectionTeamMembers).Doc(memberID).Update(ctx, 
			[]firestore.Update{
				{Path: "role", Value: updates["role"]},
				{Path: "permissions", Value: updates["permissions"]},
			})
	}
	
	if req.IsActive != nil {
		_, err = s.client.Collection(CollectionTeamMembers).Doc(memberID).Update(ctx, 
			[]firestore.Update{
				{Path: "is_active", Value: updates["is_active"]},
			})
	}
	
	if req.Metadata != nil {
		_, err = s.client.Collection(CollectionTeamMembers).Doc(memberID).Update(ctx, 
			[]firestore.Update{
				{Path: "metadata", Value: updates["metadata"]},
			})
	}
	
	if err != nil {
		return nil, fmt.Errorf("failed to update team member: %w", err)
	}
	
	member.ID = memberID
	member.UpdatedAt = updates["updated_at"].(time.Time)
	
	return &models.TeamMemberResponse{
		ID:          member.ID,
		UserID:      member.UserID,
		Email:       member.Email,
		DisplayName: member.DisplayName,
		Role:        member.Role,
		Permissions: member.Permissions,
		IsActive:    member.IsActive,
		InvitedBy:   member.InvitedBy,
		InvitedAt:   member.InvitedAt,
		JoinedAt:    member.JoinedAt,
		Metadata:    member.Metadata,
	}, nil
}

// DeleteTeamMember removes a team member (soft delete)
func (s *TeamService) DeleteTeamMember(ctx context.Context, tenantID, memberID string) error {
	// Verify member exists and belongs to tenant
	doc, err := s.client.Collection(CollectionTeamMembers).Doc(memberID).Get(ctx)
	if err != nil {
		return fmt.Errorf("failed to get team member: %w", err)
	}
	
	var member models.TeamMember
	if err := doc.DataTo(&member); err != nil {
		return fmt.Errorf("failed to unmarshal team member: %w", err)
	}
	
	if member.TenantID != tenantID {
		return fmt.Errorf("team member not found in specified tenant")
	}
	
	// Soft delete by setting is_active to false
	_, err = s.client.Collection(CollectionTeamMembers).Doc(memberID).Update(ctx, []firestore.Update{
		{Path: "is_active", Value: false},
		{Path: "updated_at", Value: time.Now()},
	})
	
	if err != nil {
		return fmt.Errorf("failed to delete team member: %w", err)
	}
	
	return nil
}

// InviteTeamMember creates an invitation for a new team member
func (s *TeamService) InviteTeamMember(ctx context.Context, tenantID, inviterID string, req *models.InviteTeamMemberRequest) (*models.TeamInvitationResponse, error) {
	// Validate role
	if !models.IsValidRole(string(req.Role)) {
		return nil, fmt.Errorf("invalid role: %s", req.Role)
	}
	
	// Check if user already exists in this tenant
	existingQuery := s.client.Collection(CollectionTeamMembers).
		Where("tenant_id", "==", tenantID).
		Where("email", "==", req.Email).
		Where("is_active", "==", true)
	
	existingDocs, err := existingQuery.Documents(ctx).GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to check existing member: %w", err)
	}
	
	if len(existingDocs) > 0 {
		return nil, fmt.Errorf("user already exists in this tenant")
	}
	
	// Check for existing pending invitation
	pendingQuery := s.client.Collection(CollectionTeamInvitations).
		Where("tenant_id", "==", tenantID).
		Where("email", "==", req.Email).
		Where("status", "==", "pending")
	
	pendingDocs, err := pendingQuery.Documents(ctx).GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to check pending invitations: %w", err)
	}
	
	if len(pendingDocs) > 0 {
		return nil, fmt.Errorf("pending invitation already exists for this email")
	}
	
	// Generate invitation token
	token, err := generateInvitationToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate invitation token: %w", err)
	}
	
	// Create invitation
	now := time.Now()
	invitation := models.TeamInvitation{
		TenantID:  tenantID,
		Email:     req.Email,
		Role:      req.Role,
		InvitedBy: inviterID,
		InvitedAt: now,
		ExpiresAt: now.Add(7 * 24 * time.Hour), // 7 days
		Status:    "pending",
		Token:     token,
		Message:   req.Message,
		CreatedAt: now,
		UpdatedAt: now,
	}
	
	// Add to Firestore
	docRef, _, err := s.client.Collection(CollectionTeamInvitations).Add(ctx, invitation)
	if err != nil {
		return nil, fmt.Errorf("failed to create invitation: %w", err)
	}
	
	invitation.ID = docRef.ID
	
	// TODO: Send invitation email
	
	return &models.TeamInvitationResponse{
		ID:        invitation.ID,
		Email:     invitation.Email,
		Role:      invitation.Role,
		InvitedBy: invitation.InvitedBy,
		InvitedAt: invitation.InvitedAt,
		ExpiresAt: invitation.ExpiresAt,
		Status:    invitation.Status,
		Message:   invitation.Message,
	}, nil
}

// GetTeamInvitations retrieves team invitations for a tenant
func (s *TeamService) GetTeamInvitations(ctx context.Context, tenantID string, page, limit int) (*models.PaginatedTeamInvitationsResponse, error) {
	offset := (page - 1) * limit
	
	query := s.client.Collection(CollectionTeamInvitations).
		Where("tenant_id", "==", tenantID).
		OrderBy("created_at", firestore.Desc).
		Limit(limit).
		Offset(offset)
	
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get invitations: %w", err)
	}
	
	var invitations []models.TeamInvitationResponse
	for _, doc := range docs {
		var invitation models.TeamInvitation
		if err := doc.DataTo(&invitation); err != nil {
			log.Printf("Error unmarshaling invitation %s: %v", doc.Ref.ID, err)
			continue
		}
		invitation.ID = doc.Ref.ID
		
		response := models.TeamInvitationResponse{
			ID:        invitation.ID,
			Email:     invitation.Email,
			Role:      invitation.Role,
			InvitedBy: invitation.InvitedBy,
			InvitedAt: invitation.InvitedAt,
			ExpiresAt: invitation.ExpiresAt,
			Status:    invitation.Status,
			Message:   invitation.Message,
		}
		invitations = append(invitations, response)
	}
	
	// Get total count
	totalQuery := s.client.Collection(CollectionTeamInvitations).
		Where("tenant_id", "==", tenantID)
	
	totalDocs, err := totalQuery.Documents(ctx).GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get total count: %w", err)
	}
	
	total := len(totalDocs)
	totalPages := (total + limit - 1) / limit
	
	return &models.PaginatedTeamInvitationsResponse{
		Invitations: invitations,
		Pagination: models.PaginationInfo{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
			HasNext:    page < totalPages,
			HasPrev:    page > 1,
		},
	}, nil
}

// AcceptInvitation processes an invitation acceptance
func (s *TeamService) AcceptInvitation(ctx context.Context, token string, req *models.AcceptInvitationRequest) (*models.TeamMemberResponse, error) {
	// Find invitation by token
	query := s.client.Collection(CollectionTeamInvitations).
		Where("token", "==", token).
		Where("status", "==", "pending")
	
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to find invitation: %w", err)
	}
	
	if len(docs) == 0 {
		return nil, fmt.Errorf("invitation not found or already processed")
	}
	
	var invitation models.TeamInvitation
	if err := docs[0].DataTo(&invitation); err != nil {
		return nil, fmt.Errorf("failed to unmarshal invitation: %w", err)
	}
	invitation.ID = docs[0].Ref.ID
	
	// Check if invitation is expired
	if time.Now().After(invitation.ExpiresAt) {
		// Update invitation status to expired
		_, err = s.client.Collection(CollectionTeamInvitations).Doc(invitation.ID).Update(ctx, []firestore.Update{
			{Path: "status", Value: "expired"},
			{Path: "updated_at", Value: time.Now()},
		})
		if err != nil {
			log.Printf("Failed to update expired invitation: %v", err)
		}
		return nil, fmt.Errorf("invitation has expired")
	}
	
	// Create team member
	now := time.Now()
	member := models.TeamMember{
		UserID:      "", // This should be set from Firebase Auth context
		TenantID:    invitation.TenantID,
		Email:       invitation.Email,
		DisplayName: req.DisplayName,
		Role:        invitation.Role,
		Permissions: invitation.Role.GetPermissions(),
		IsActive:    true,
		InvitedBy:   invitation.InvitedBy,
		InvitedAt:   invitation.InvitedAt,
		JoinedAt:    &now,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	
	// Add team member
	docRef, _, err := s.client.Collection(CollectionTeamMembers).Add(ctx, member)
	if err != nil {
		return nil, fmt.Errorf("failed to create team member: %w", err)
	}
	
	// Update invitation status
	_, err = s.client.Collection(CollectionTeamInvitations).Doc(invitation.ID).Update(ctx, []firestore.Update{
		{Path: "status", Value: "accepted"},
		{Path: "updated_at", Value: now},
	})
	if err != nil {
		log.Printf("Failed to update invitation status: %v", err)
	}
	
	member.ID = docRef.ID
	
	return &models.TeamMemberResponse{
		ID:          member.ID,
		UserID:      member.UserID,
		Email:       member.Email,
		DisplayName: member.DisplayName,
		Role:        member.Role,
		Permissions: member.Permissions,
		IsActive:    member.IsActive,
		InvitedBy:   member.InvitedBy,
		InvitedAt:   member.InvitedAt,
		JoinedAt:    member.JoinedAt,
		Metadata:    member.Metadata,
	}, nil
}

// CheckPermission verifies if a user has a specific permission
func (s *TeamService) CheckPermission(ctx context.Context, userID, tenantID string, permission models.Permission) (*models.CheckPermissionResponse, error) {
	// Get user profile
	userDoc, err := s.client.Collection(CollectionUserProfiles).Doc(userID).Get(ctx)
	if err != nil {
		return &models.CheckPermissionResponse{
			HasPermission: false,
			Reason:        "User not found",
		}, nil
	}
	
	var user models.EnhancedUserProfile
	if err := userDoc.DataTo(&user); err != nil {
		return &models.CheckPermissionResponse{
			HasPermission: false,
			Reason:        "Failed to load user profile",
		}, nil
	}
	
	// Check if user is super admin (global permissions)
	if user.Role == models.RoleSuperAdmin {
		if user.Role.HasPermission(permission) {
			return &models.CheckPermissionResponse{
				HasPermission: true,
			}, nil
		}
	}
	
	// For tenant-specific roles, check tenant membership
	if user.Role.IsTenantRole() {
		if user.TenantID != tenantID {
			return &models.CheckPermissionResponse{
				HasPermission: false,
				Reason:        "User not member of specified tenant",
			}, nil
		}
		
		// Check if user has the permission
		if user.Role.HasPermission(permission) {
			return &models.CheckPermissionResponse{
				HasPermission: true,
			}, nil
		}
	}
	
	return &models.CheckPermissionResponse{
		HasPermission: false,
		Reason:        "Insufficient permissions",
	}, nil
}

// Helper function to generate invitation token
func generateInvitationToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// ValidateRoleHierarchy checks if a user can assign/manage a specific role
func (s *TeamService) ValidateRoleHierarchy(managerRole, targetRole models.UserRole) error {
	if !managerRole.CanManageRole(targetRole) {
		return fmt.Errorf("insufficient privileges to manage role %s", targetRole)
	}
	return nil
}

// BulkUpdateRoles updates multiple user roles in a transaction
func (s *TeamService) BulkUpdateRoles(ctx context.Context, tenantID string, updates []struct {
	UserID string
	Role   models.UserRole
}) error {
	// This would ideally be done in a transaction
	for _, update := range updates {
		memberQuery := s.client.Collection(CollectionTeamMembers).
			Where("tenant_id", "==", tenantID).
			Where("user_id", "==", update.UserID).
			Where("is_active", "==", true)
		
		docs, err := memberQuery.Documents(ctx).GetAll()
		if err != nil {
			return fmt.Errorf("failed to find member %s: %w", update.UserID, err)
		}
		
		if len(docs) == 0 {
			continue // Skip if member not found
		}
		
		memberID := docs[0].Ref.ID
		
		_, err = s.client.Collection(CollectionTeamMembers).Doc(memberID).Update(ctx, []firestore.Update{
			{Path: "role", Value: update.Role},
			{Path: "permissions", Value: update.Role.GetPermissions()},
			{Path: "updated_at", Value: time.Now()},
		})
		
		if err != nil {
			return fmt.Errorf("failed to update member %s: %w", update.UserID, err)
		}
	}
	
	return nil
}
