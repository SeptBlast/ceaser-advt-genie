"""
Models for the Tenants app.
Handles multi-tenant data structures and relationships.
"""

from django.db import models
from django.core.validators import RegexValidator
from apps.core.models import BaseModel, SoftDeleteModel
import uuid


class Tenant(BaseModel):
    """
    Model representing a tenant in the multi-tenant system.
    Each tenant has its own isolated data and configuration.
    """
    
    name = models.CharField(
        max_length=255,
        help_text="Display name of the tenant organization"
    )
    
    slug = models.SlugField(
        unique=True,
        max_length=100,
        validators=[
            RegexValidator(
                regex=r'^[a-z0-9-]+$',
                message='Slug can only contain lowercase letters, numbers, and hyphens.'
            )
        ],
        help_text="URL-safe identifier for the tenant (used in subdomains)"
    )
    
    domain = models.CharField(
        max_length=255,
        unique=True,
        help_text="Custom domain for the tenant (e.g., acme.adgenius.com)"
    )
    
    database_name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Name of the tenant's dedicated database"
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the tenant is active and can access the platform"
    )
    
    settings = models.JSONField(
        default=dict,
        blank=True,
        help_text="Tenant-specific configuration settings"
    )
    
    subscription_tier = models.CharField(
        max_length=50,
        choices=[
            ('free', 'Free'),
            ('basic', 'Basic'),
            ('professional', 'Professional'),
            ('enterprise', 'Enterprise'),
        ],
        default='free',
        help_text="Subscription tier for the tenant"
    )
    
    max_users = models.PositiveIntegerField(
        default=5,
        help_text="Maximum number of users allowed for this tenant"
    )
    
    max_monthly_generations = models.PositiveIntegerField(
        default=100,
        help_text="Maximum number of AI generations allowed per month"
    )
    
    monthly_generations_used = models.PositiveIntegerField(
        default=0,
        help_text="Number of AI generations used in the current month"
    )
    
    last_generation_reset = models.DateTimeField(
        auto_now_add=True,
        help_text="Last time the monthly generation counter was reset"
    )
    
    class Meta:
        verbose_name = "Tenant"
        verbose_name_plural = "Tenants"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.slug})"
    
    def save(self, *args, **kwargs):
        """
        Override save to set database_name if not provided.
        """
        if not self.database_name:
            self.database_name = f"tenant_{self.slug}_db"
        super().save(*args, **kwargs)
    
    def can_generate_content(self):
        """
        Check if the tenant can generate more content based on their limits.
        """
        return (
            self.is_active and 
            self.monthly_generations_used < self.max_monthly_generations
        )
    
    def increment_generation_count(self):
        """
        Increment the monthly generation counter.
        """
        self.monthly_generations_used += 1
        self.save(update_fields=['monthly_generations_used'])
    
    def reset_monthly_generations(self):
        """
        Reset the monthly generation counter.
        """
        from django.utils import timezone
        self.monthly_generations_used = 0
        self.last_generation_reset = timezone.now()
        self.save(update_fields=['monthly_generations_used', 'last_generation_reset'])


class TenantUser(BaseModel):
    """
    Model representing the relationship between users and tenants.
    Handles user roles and permissions within a tenant.
    """
    
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='tenant_users'
    )
    
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='tenant_memberships'
    )
    
    role = models.CharField(
        max_length=50,
        choices=[
            ('owner', 'Owner'),
            ('admin', 'Admin'),
            ('member', 'Member'),
            ('viewer', 'Viewer'),
        ],
        default='member',
        help_text="Role of the user within the tenant"
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the user's membership is active"
    )
    
    joined_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the user joined the tenant"
    )
    
    permissions = models.JSONField(
        default=dict,
        blank=True,
        help_text="Custom permissions for this user in the tenant"
    )
    
    class Meta:
        verbose_name = "Tenant User"
        verbose_name_plural = "Tenant Users"
        unique_together = ['tenant', 'user']
        ordering = ['joined_at']
    
    def __str__(self):
        return f"{self.user.email} in {self.tenant.name} ({self.role})"
    
    def has_permission(self, permission):
        """
        Check if the user has a specific permission in the tenant.
        """
        # Define role-based permissions
        role_permissions = {
            'owner': ['*'],  # All permissions
            'admin': [
                'manage_users', 'manage_billing', 'generate_content',
                'view_analytics', 'manage_settings'
            ],
            'member': ['generate_content', 'view_analytics'],
            'viewer': ['view_analytics'],
        }
        
        # Check role-based permissions
        if '*' in role_permissions.get(self.role, []):
            return True
        
        if permission in role_permissions.get(self.role, []):
            return True
        
        # Check custom permissions
        return permission in self.permissions.get('allow', [])


class TenantInvitation(BaseModel):
    """
    Model for handling tenant invitations.
    """
    
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='invitations'
    )
    
    email = models.EmailField(
        help_text="Email address of the invited user"
    )
    
    role = models.CharField(
        max_length=50,
        choices=[
            ('admin', 'Admin'),
            ('member', 'Member'),
            ('viewer', 'Viewer'),
        ],
        default='member',
        help_text="Role to assign to the invited user"
    )
    
    invited_by = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='sent_invitations'
    )
    
    token = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        help_text="Unique token for the invitation"
    )
    
    is_accepted = models.BooleanField(
        default=False,
        help_text="Whether the invitation has been accepted"
    )
    
    expires_at = models.DateTimeField(
        help_text="When the invitation expires"
    )
    
    accepted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the invitation was accepted"
    )
    
    accepted_by = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='accepted_invitations',
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = "Tenant Invitation"
        verbose_name_plural = "Tenant Invitations"
        unique_together = ['tenant', 'email']
        ordering = ['-created_at']
    
    def __str__(self):
        status = "Accepted" if self.is_accepted else "Pending"
        return f"Invitation to {self.email} for {self.tenant.name} ({status})"
    
    def is_expired(self):
        """
        Check if the invitation has expired.
        """
        from django.utils import timezone
        return timezone.now() > self.expires_at
    
    def accept(self, user):
        """
        Accept the invitation and create the tenant membership.
        """
        from django.utils import timezone
        
        if self.is_expired():
            raise ValueError("Invitation has expired")
        
        if self.is_accepted:
            raise ValueError("Invitation has already been accepted")
        
        # Create the tenant membership
        TenantUser.objects.create(
            tenant=self.tenant,
            user=user,
            role=self.role
        )
        
        # Mark invitation as accepted
        self.is_accepted = True
        self.accepted_at = timezone.now()
        self.accepted_by = user
        self.save()
