package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/models"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/services"
)

// TeamHandler handles team management HTTP requests
type TeamHandler struct {
	teamService *services.TeamService
}

// NewTeamHandler creates a new TeamHandler instance
func NewTeamHandler(teamService *services.TeamService) *TeamHandler {
	return &TeamHandler{
		teamService: teamService,
	}
}

// GetTeamMembers retrieves team members for a tenant
// @Summary Get team members
// @Description Retrieve team members for a tenant with pagination
// @Tags team
// @Accept json
// @Produce json
// @Param tenantId path string true "Tenant ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} models.PaginatedTeamMembersResponse
// @Failure 400 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /api/v1/tenants/{tenantId}/team [get]
func (h *TeamHandler) GetTeamMembers(c *gin.Context) {
	tenantID := c.Param("tenantId")
	if tenantID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Tenant ID is required",
		})
		return
	}

	// Get pagination parameters
	page := 1
	limit := 10

	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	// Check permissions
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}

	// Check if user can read team members
	permissionCheck, err := h.teamService.CheckPermission(c.Request.Context(), userID, tenantID, models.PermissionTenantReadUsers)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to check permissions",
		})
		return
	}

	if !permissionCheck.HasPermission {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Insufficient permissions to view team members",
		})
		return
	}

	// Get team members
	result, err := h.teamService.GetTeamMembers(c.Request.Context(), tenantID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to retrieve team members",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    result,
	})
}

// GetTeamMember retrieves a specific team member
// @Summary Get team member
// @Description Retrieve a specific team member by ID
// @Tags team
// @Accept json
// @Produce json
// @Param tenantId path string true "Tenant ID"
// @Param memberId path string true "Member ID"
// @Success 200 {object} models.TeamMemberResponse
// @Failure 400 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /api/v1/tenants/{tenantId}/team/{memberId} [get]
func (h *TeamHandler) GetTeamMember(c *gin.Context) {
	tenantID := c.Param("tenantId")
	memberID := c.Param("memberId")

	if tenantID == "" || memberID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Tenant ID and Member ID are required",
		})
		return
	}

	// Check permissions
	userID := c.GetString("user_id")
	permissionCheck, err := h.teamService.CheckPermission(c.Request.Context(), userID, tenantID, models.PermissionTenantReadUsers)
	if err != nil || !permissionCheck.HasPermission {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Insufficient permissions",
		})
		return
	}

	// Get team member
	member, err := h.teamService.GetTeamMember(c.Request.Context(), tenantID, memberID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Error:   "Team member not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    member,
	})
}

// CreateTeamMember adds a new team member
// @Summary Create team member
// @Description Add a new team member to the tenant
// @Tags team
// @Accept json
// @Produce json
// @Param tenantId path string true "Tenant ID"
// @Param request body models.CreateTeamMemberRequest true "Team member data"
// @Success 201 {object} models.TeamMemberResponse
// @Failure 400 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 409 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /api/v1/tenants/{tenantId}/team [post]
func (h *TeamHandler) CreateTeamMember(c *gin.Context) {
	tenantID := c.Param("tenantId")
	if tenantID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Tenant ID is required",
		})
		return
	}

	var req models.CreateTeamMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request data: " + err.Error(),
		})
		return
	}

	// Check permissions
	userID := c.GetString("user_id")
	permissionCheck, err := h.teamService.CheckPermission(c.Request.Context(), userID, tenantID, models.PermissionTenantCreateUsers)
	if err != nil || !permissionCheck.HasPermission {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Insufficient permissions to create team members",
		})
		return
	}

	// Create team member
	member, err := h.teamService.CreateTeamMember(c.Request.Context(), tenantID, userID, &req)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "user already exists in this tenant" {
			status = http.StatusConflict
		}
		c.JSON(status, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Data:    member,
		Message: "Team member created successfully",
	})
}

// UpdateTeamMember updates an existing team member
// @Summary Update team member
// @Description Update an existing team member's details
// @Tags team
// @Accept json
// @Produce json
// @Param tenantId path string true "Tenant ID"
// @Param memberId path string true "Member ID"
// @Param request body models.UpdateTeamMemberRequest true "Update data"
// @Success 200 {object} models.TeamMemberResponse
// @Failure 400 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /api/v1/tenants/{tenantId}/team/{memberId} [put]
func (h *TeamHandler) UpdateTeamMember(c *gin.Context) {
	tenantID := c.Param("tenantId")
	memberID := c.Param("memberId")

	if tenantID == "" || memberID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Tenant ID and Member ID are required",
		})
		return
	}

	var req models.UpdateTeamMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request data: " + err.Error(),
		})
		return
	}

	// Check permissions
	userID := c.GetString("user_id")
	permissionCheck, err := h.teamService.CheckPermission(c.Request.Context(), userID, tenantID, models.PermissionTenantUpdateUsers)
	if err != nil || !permissionCheck.HasPermission {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Insufficient permissions to update team members",
		})
		return
	}

	// Update team member
	member, err := h.teamService.UpdateTeamMember(c.Request.Context(), tenantID, memberID, &req)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "team member not found in specified tenant" {
			status = http.StatusNotFound
		}
		c.JSON(status, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    member,
		Message: "Team member updated successfully",
	})
}

// DeleteTeamMember removes a team member
// @Summary Delete team member
// @Description Remove a team member from the tenant
// @Tags team
// @Accept json
// @Produce json
// @Param tenantId path string true "Tenant ID"
// @Param memberId path string true "Member ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /api/v1/tenants/{tenantId}/team/{memberId} [delete]
func (h *TeamHandler) DeleteTeamMember(c *gin.Context) {
	tenantID := c.Param("tenantId")
	memberID := c.Param("memberId")

	if tenantID == "" || memberID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Tenant ID and Member ID are required",
		})
		return
	}

	// Check permissions
	userID := c.GetString("user_id")
	permissionCheck, err := h.teamService.CheckPermission(c.Request.Context(), userID, tenantID, models.PermissionTenantDeleteUsers)
	if err != nil || !permissionCheck.HasPermission {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Insufficient permissions to delete team members",
		})
		return
	}

	// Delete team member
	err = h.teamService.DeleteTeamMember(c.Request.Context(), tenantID, memberID)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "team member not found in specified tenant" {
			status = http.StatusNotFound
		}
		c.JSON(status, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Team member deleted successfully",
	})
}

// InviteTeamMember creates an invitation for a new team member
// @Summary Invite team member
// @Description Send an invitation to join the tenant team
// @Tags team
// @Accept json
// @Produce json
// @Param tenantId path string true "Tenant ID"
// @Param request body models.InviteTeamMemberRequest true "Invitation data"
// @Success 201 {object} models.TeamInvitationResponse
// @Failure 400 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 409 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /api/v1/tenants/{tenantId}/invitations [post]
func (h *TeamHandler) InviteTeamMember(c *gin.Context) {
	tenantID := c.Param("tenantId")
	if tenantID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Tenant ID is required",
		})
		return
	}

	var req models.InviteTeamMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request data: " + err.Error(),
		})
		return
	}

	// Check permissions
	userID := c.GetString("user_id")
	permissionCheck, err := h.teamService.CheckPermission(c.Request.Context(), userID, tenantID, models.PermissionTenantCreateUsers)
	if err != nil || !permissionCheck.HasPermission {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Insufficient permissions to invite team members",
		})
		return
	}

	// Create invitation
	invitation, err := h.teamService.InviteTeamMember(c.Request.Context(), tenantID, userID, &req)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "user already exists in this tenant" || err.Error() == "pending invitation already exists for this email" {
			status = http.StatusConflict
		}
		c.JSON(status, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Data:    invitation,
		Message: "Invitation sent successfully",
	})
}

// GetTeamInvitations retrieves team invitations for a tenant
// @Summary Get team invitations
// @Description Retrieve team invitations for a tenant with pagination
// @Tags team
// @Accept json
// @Produce json
// @Param tenantId path string true "Tenant ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} models.PaginatedTeamInvitationsResponse
// @Failure 400 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /api/v1/tenants/{tenantId}/invitations [get]
func (h *TeamHandler) GetTeamInvitations(c *gin.Context) {
	tenantID := c.Param("tenantId")
	if tenantID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Tenant ID is required",
		})
		return
	}

	// Get pagination parameters
	page := 1
	limit := 10

	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	// Check permissions
	userID := c.GetString("user_id")
	permissionCheck, err := h.teamService.CheckPermission(c.Request.Context(), userID, tenantID, models.PermissionTenantReadUsers)
	if err != nil || !permissionCheck.HasPermission {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Insufficient permissions to view invitations",
		})
		return
	}

	// Get invitations
	result, err := h.teamService.GetTeamInvitations(c.Request.Context(), tenantID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to retrieve invitations",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    result,
	})
}

// AcceptInvitation processes an invitation acceptance
// @Summary Accept invitation
// @Description Accept a team invitation using the invitation token
// @Tags team
// @Accept json
// @Produce json
// @Param token path string true "Invitation Token"
// @Param request body models.AcceptInvitationRequest true "Acceptance data"
// @Success 200 {object} models.TeamMemberResponse
// @Failure 400 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 410 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /api/v1/invitations/{token}/accept [post]
func (h *TeamHandler) AcceptInvitation(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invitation token is required",
		})
		return
	}

	var req models.AcceptInvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request data: " + err.Error(),
		})
		return
	}

	req.Token = token

	// Accept invitation
	member, err := h.teamService.AcceptInvitation(c.Request.Context(), token, &req)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "invitation not found or already processed" {
			status = http.StatusNotFound
		} else if err.Error() == "invitation has expired" {
			status = http.StatusGone
		}
		c.JSON(status, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    member,
		Message: "Invitation accepted successfully",
	})
}

// CheckPermission verifies user permissions
// @Summary Check permission
// @Description Check if the authenticated user has a specific permission
// @Tags team
// @Accept json
// @Produce json
// @Param request body models.CheckPermissionRequest true "Permission check data"
// @Success 200 {object} models.CheckPermissionResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /api/v1/permissions/check [post]
func (h *TeamHandler) CheckPermission(c *gin.Context) {
	var req models.CheckPermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request data: " + err.Error(),
		})
		return
	}

	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}

	// Check permission
	result, err := h.teamService.CheckPermission(c.Request.Context(), userID, req.TenantID, req.Permission)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to check permission",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    result,
	})
}
