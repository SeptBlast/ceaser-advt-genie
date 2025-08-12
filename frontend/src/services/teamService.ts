import { TeamMember, TeamInvitation, UserRole } from '../types/team';

export interface CreateTeamMemberRequest {
  email: string;
  role: UserRole;
  department?: string;
  jobTitle?: string;
}

export interface InviteTeamMemberRequest {
  email: string;
  role: UserRole;
  message?: string;
}

export interface UpdateTeamMemberRequest {
  role?: UserRole;
  isActive?: boolean;
  department?: string;
  jobTitle?: string;
}

export interface TeamMemberListResponse {
  members: TeamMember[];
  total: number;
  page: number;
  limit: number;
}

export interface TeamInvitationListResponse {
  invitations: TeamInvitation[];
  total: number;
  page: number;
  limit: number;
}

class TeamService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  }

  private async getAuthHeaders(): Promise<{ [key: string]: string }> {
    // This should get the Firebase auth token
    const token = localStorage.getItem('authToken'); // Placeholder - replace with actual token retrieval
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  // Get team members for a tenant
  async getTeamMembers(tenantId: string, page = 1, limit = 10): Promise<TeamMemberListResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/tenants/${tenantId}/team/members?page=${page}&limit=${limit}`,
      { headers }
    );
    return this.handleResponse<TeamMemberListResponse>(response);
  }

  // Get team invitations for a tenant
  async getTeamInvitations(tenantId: string, page = 1, limit = 10): Promise<TeamInvitationListResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/tenants/${tenantId}/team/invitations?page=${page}&limit=${limit}`,
      { headers }
    );
    return this.handleResponse<TeamInvitationListResponse>(response);
  }

  // Invite a new team member
  async inviteTeamMember(tenantId: string, request: InviteTeamMemberRequest): Promise<TeamInvitation> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/tenants/${tenantId}/team/invite`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      }
    );
    return this.handleResponse<TeamInvitation>(response);
  }

  // Create team member directly (for super admin)
  async createTeamMember(tenantId: string, request: CreateTeamMemberRequest): Promise<TeamMember> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/tenants/${tenantId}/team/members`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      }
    );
    return this.handleResponse<TeamMember>(response);
  }

  // Update team member
  async updateTeamMember(tenantId: string, memberId: string, request: UpdateTeamMemberRequest): Promise<TeamMember> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/tenants/${tenantId}/team/members/${memberId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(request),
      }
    );
    return this.handleResponse<TeamMember>(response);
  }

  // Remove team member
  async removeTeamMember(tenantId: string, memberId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/tenants/${tenantId}/team/members/${memberId}`,
      {
        method: 'DELETE',
        headers,
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
  }

  // Accept team invitation
  async acceptInvitation(token: string): Promise<TeamMember> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/team/invitations/${token}/accept`,
      {
        method: 'POST',
        headers,
      }
    );
    return this.handleResponse<TeamMember>(response);
  }

  // Decline team invitation
  async declineInvitation(token: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/team/invitations/${token}/decline`,
      {
        method: 'POST',
        headers,
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
  }

  // Resend invitation
  async resendInvitation(tenantId: string, invitationId: string): Promise<TeamInvitation> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/tenants/${tenantId}/team/invitations/${invitationId}/resend`,
      {
        method: 'POST',
        headers,
      }
    );
    return this.handleResponse<TeamInvitation>(response);
  }

  // Cancel invitation
  async cancelInvitation(tenantId: string, invitationId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/tenants/${tenantId}/team/invitations/${invitationId}`,
      {
        method: 'DELETE',
        headers,
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
  }

  // Get team member details
  async getTeamMember(tenantId: string, memberId: string): Promise<TeamMember> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/tenants/${tenantId}/team/members/${memberId}`,
      { headers }
    );
    return this.handleResponse<TeamMember>(response);
  }

  // Get invitation details
  async getInvitation(token: string): Promise<TeamInvitation> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${this.baseUrl}/api/v1/team/invitations/${token}`,
      { headers }
    );
    return this.handleResponse<TeamInvitation>(response);
  }
}

export const teamService = new TeamService();
