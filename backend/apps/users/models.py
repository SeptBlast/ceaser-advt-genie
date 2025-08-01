"""
Models for the Users app.
Custom User model and related user profile functionality.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.core.models import BaseModel, SoftDeleteModel
import uuid


class User(AbstractUser):
    """
    Custom User model that extends Django's AbstractUser.
    Uses email as the primary identifier instead of username.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    email = models.EmailField(
        unique=True,
        help_text="Email address (used for login)"
    )
    
    first_name = models.CharField(
        max_length=150,
        help_text="First name"
    )
    
    last_name = models.CharField(
        max_length=150,
        help_text="Last name"
    )
    
    is_email_verified = models.BooleanField(
        default=False,
        help_text="Whether the user's email has been verified"
    )
    
    email_verification_token = models.UUIDField(
        default=uuid.uuid4,
        help_text="Token used for email verification"
    )
    
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        help_text="Phone number"
    )
    
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
        help_text="User avatar image"
    )
    
    timezone = models.CharField(
        max_length=50,
        default='UTC',
        help_text="User's timezone"
    )
    
    language = models.CharField(
        max_length=10,
        default='en',
        choices=[
            ('en', 'English'),
            ('es', 'Spanish'),
            ('fr', 'French'),
            ('de', 'German'),
            ('it', 'Italian'),
            ('pt', 'Portuguese'),
            ('ja', 'Japanese'),
            ('ko', 'Korean'),
            ('zh', 'Chinese'),
        ],
        help_text="Preferred language"
    )
    
    preferences = models.JSONField(
        default=dict,
        blank=True,
        help_text="User preferences and settings"
    )
    
    last_login_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address of last login"
    )
    
    failed_login_attempts = models.PositiveIntegerField(
        default=0,
        help_text="Number of failed login attempts"
    )
    
    account_locked_until = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Account locked until this timestamp"
    )
    
    # Use email as the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['email']
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        """
        Return the user's full name.
        """
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def initials(self):
        """
        Return the user's initials.
        """
        return f"{self.first_name[:1]}{self.last_name[:1]}".upper()
    
    def get_tenant_memberships(self):
        """
        Get all tenant memberships for this user.
        """
        return self.tenant_memberships.filter(is_active=True)
    
    def is_tenant_owner(self, tenant):
        """
        Check if the user is an owner of the specified tenant.
        """
        return self.tenant_memberships.filter(
            tenant=tenant,
            role='owner',
            is_active=True
        ).exists()
    
    def is_tenant_admin(self, tenant):
        """
        Check if the user is an admin of the specified tenant.
        """
        return self.tenant_memberships.filter(
            tenant=tenant,
            role__in=['owner', 'admin'],
            is_active=True
        ).exists()
    
    def can_access_tenant(self, tenant):
        """
        Check if the user can access the specified tenant.
        """
        return self.tenant_memberships.filter(
            tenant=tenant,
            is_active=True
        ).exists()
    
    def reset_failed_login_attempts(self):
        """
        Reset failed login attempts counter.
        """
        self.failed_login_attempts = 0
        self.account_locked_until = None
        self.save(update_fields=['failed_login_attempts', 'account_locked_until'])
    
    def increment_failed_login_attempts(self):
        """
        Increment failed login attempts and lock account if necessary.
        """
        from django.utils import timezone
        from datetime import timedelta
        
        self.failed_login_attempts += 1
        
        # Lock account after 5 failed attempts for 30 minutes
        if self.failed_login_attempts >= 5:
            self.account_locked_until = timezone.now() + timedelta(minutes=30)
        
        self.save(update_fields=['failed_login_attempts', 'account_locked_until'])
    
    def is_account_locked(self):
        """
        Check if the account is currently locked.
        """
        from django.utils import timezone
        
        if self.account_locked_until:
            if timezone.now() < self.account_locked_until:
                return True
            else:
                # Lock period has expired, reset the counter
                self.reset_failed_login_attempts()
        
        return False


class UserProfile(BaseModel):
    """
    Extended user profile information.
    Separated from User model to keep the core User model lean.
    """
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
    bio = models.TextField(
        blank=True,
        max_length=500,
        help_text="Short bio/description"
    )
    
    company = models.CharField(
        max_length=255,
        blank=True,
        help_text="Company name"
    )
    
    job_title = models.CharField(
        max_length=255,
        blank=True,
        help_text="Job title"
    )
    
    industry = models.CharField(
        max_length=100,
        blank=True,
        choices=[
            ('technology', 'Technology'),
            ('healthcare', 'Healthcare'),
            ('finance', 'Finance'),
            ('education', 'Education'),
            ('retail', 'Retail'),
            ('manufacturing', 'Manufacturing'),
            ('real_estate', 'Real Estate'),
            ('automotive', 'Automotive'),
            ('entertainment', 'Entertainment'),
            ('food_beverage', 'Food & Beverage'),
            ('travel', 'Travel & Tourism'),
            ('non_profit', 'Non-profit'),
            ('government', 'Government'),
            ('other', 'Other'),
        ],
        help_text="Industry"
    )
    
    company_size = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ('1-10', '1-10 employees'),
            ('11-50', '11-50 employees'),
            ('51-200', '51-200 employees'),
            ('201-500', '201-500 employees'),
            ('501-1000', '501-1000 employees'),
            ('1000+', '1000+ employees'),
        ],
        help_text="Company size"
    )
    
    website = models.URLField(
        blank=True,
        help_text="Company or personal website"
    )
    
    linkedin_url = models.URLField(
        blank=True,
        help_text="LinkedIn profile URL"
    )
    
    twitter_handle = models.CharField(
        max_length=50,
        blank=True,
        help_text="Twitter handle (without @)"
    )
    
    marketing_consent = models.BooleanField(
        default=False,
        help_text="Consent to receive marketing communications"
    )
    
    analytics_consent = models.BooleanField(
        default=True,
        help_text="Consent to analytics tracking"
    )
    
    onboarding_completed = models.BooleanField(
        default=False,
        help_text="Whether the user has completed onboarding"
    )
    
    onboarding_step = models.CharField(
        max_length=50,
        blank=True,
        help_text="Current onboarding step"
    )
    
    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
    
    def __str__(self):
        return f"Profile for {self.user.email}"


class UserSession(BaseModel):
    """
    Model to track user sessions for security and analytics.
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    
    session_key = models.CharField(
        max_length=40,
        unique=True,
        help_text="Django session key"
    )
    
    ip_address = models.GenericIPAddressField(
        help_text="IP address of the session"
    )
    
    user_agent = models.TextField(
        help_text="User agent string"
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the session is active"
    )
    
    last_activity = models.DateTimeField(
        auto_now=True,
        help_text="Last activity timestamp"
    )
    
    expires_at = models.DateTimeField(
        help_text="Session expiration timestamp"
    )
    
    device_info = models.JSONField(
        default=dict,
        blank=True,
        help_text="Parsed device information"
    )
    
    location_info = models.JSONField(
        default=dict,
        blank=True,
        help_text="Geolocation information (if available)"
    )
    
    class Meta:
        verbose_name = "User Session"
        verbose_name_plural = "User Sessions"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Session for {self.user.email} from {self.ip_address}"
    
    def is_expired(self):
        """
        Check if the session has expired.
        """
        from django.utils import timezone
        return timezone.now() > self.expires_at
    
    def terminate(self):
        """
        Terminate the session.
        """
        self.is_active = False
        self.save(update_fields=['is_active'])
