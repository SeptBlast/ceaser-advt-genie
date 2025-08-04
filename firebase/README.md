# Firebase Configuration Templates and Documentation

This folder contains centralized Firebase configuration files used across the application.

## Files

- `firebase.json` - Firebase project configuration for hosting
- `firebase-config.template.json` - Template for Firebase client configuration
- `service-account-template.json` - Template for Firebase service account keys
- `.firebaserc` - Firebase project aliases

## Environment Setup

### Production Only

This application is configured to use production Firebase services only. Place your actual service account key file as:

- `service-account.json` (this file is gitignored)

## Docker Integration

The Docker containers mount this folder to access Firebase configurations:

- Frontend: Uses client configuration via environment variables
- Backend services: Use service account key for admin access

## Security Notes

- Never commit actual service account keys to version control
- Use environment variables for sensitive configuration
- The `service-account.json` file is gitignored for security
