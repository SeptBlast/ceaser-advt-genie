"""
Production settings for AdGenius platform.
These settings are used in production environments.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = [
    config('ALLOWED_HOST_1', default='adgenius.com'),
    config('ALLOWED_HOST_2', default='*.adgenius.com'),
    config('ALLOWED_HOST_3', default=''),
]

# Remove empty hosts
ALLOWED_HOSTS = [host for host in ALLOWED_HOSTS if host]

# Security settings for production
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    config('FRONTEND_URL', default='https://adgenius.com'),
]

CORS_ALLOW_CREDENTIALS = True

# Database connection pooling for production
DATABASES['default']['CLIENT'].update({
    'maxPoolSize': int(config('MONGO_MAX_POOL_SIZE', default=50)),
    'minPoolSize': int(config('MONGO_MIN_POOL_SIZE', default=5)),
    'maxIdleTimeMS': int(config('MONGO_MAX_IDLE_TIME_MS', default=30000)),
    'connectTimeoutMS': int(config('MONGO_CONNECT_TIMEOUT_MS', default=10000)),
    'serverSelectionTimeoutMS': int(config('MONGO_SERVER_SELECTION_TIMEOUT_MS', default=10000)),
})

# Email configuration for production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='')
EMAIL_PORT = int(config('EMAIL_PORT', default=587))
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@adgenius.com')

# Static files configuration for production
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Media files configuration for production (consider using cloud storage)
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

# Production logging
LOGGING['handlers']['file']['filename'] = '/var/log/adgenius/django.log'
LOGGING['root']['level'] = 'INFO'
LOGGING['loggers']['apps']['level'] = 'INFO'

# Performance optimizations
CONN_MAX_AGE = 60

# Sentry configuration for error tracking (optional)
SENTRY_DSN = config('SENTRY_DSN', default='')
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.celery import CeleryIntegration
    
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
        ],
        traces_sample_rate=0.1,
        send_default_pii=True
    )
