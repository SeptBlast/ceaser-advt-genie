import React from 'react';
import {
  Typography,
  Box,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { Security, Shield, Lock, Verified } from '@mui/icons-material';

const PrivacyPolicy: React.FC = () => {
  return (
    <Stack spacing={4}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Privacy Policy 🛡️
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Your privacy is our top priority at CeaserTheAdGenius
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
        
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
          <Chip icon={<Security />} label="GDPR Compliant" color="primary" size="small" />
          <Chip icon={<Shield />} label="HIPAA Compliant" color="secondary" size="small" />
          <Chip icon={<Lock />} label="SOC 2 Type II" color="success" size="small" />
        </Stack>
      </Box>

      <Divider />

      {/* Introduction */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          🐕 Introduction
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          CeaserTheAdGenius ("we," "our," or "us") is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
          when you use our AI-powered advertising platform. Just like a loyal companion, we're 
          transparent about how we handle your data.
        </Typography>
      </Box>

      {/* Information We Collect */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          📊 Information We Collect
        </Typography>
        
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Personal Information:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="Account Information" 
              secondary="Name, email address, phone number, company details"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Billing Information" 
              secondary="Payment details, billing address (processed securely through our payment partners)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Profile Data" 
              secondary="User preferences, settings, and profile customizations"
            />
          </ListItem>
        </List>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Usage Information:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="Campaign Data" 
              secondary="Advertising campaigns, performance metrics, audience data"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Platform Analytics" 
              secondary="How you interact with our platform, feature usage, clicks, and navigation"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Device Information" 
              secondary="IP address, browser type, device type, operating system"
            />
          </ListItem>
        </List>
      </Box>

      {/* How We Use Information */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          🎯 How We Use Your Information
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Service Delivery" 
              secondary="To provide, maintain, and improve our AI advertising platform"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Personalization" 
              secondary="To customize your experience and provide relevant recommendations"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Communication" 
              secondary="To send important updates, security alerts, and customer support"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Analytics & Improvement" 
              secondary="To analyze usage patterns and improve our platform performance"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Legal Compliance" 
              secondary="To comply with applicable laws and protect our rights"
            />
          </ListItem>
        </List>
      </Box>

      {/* GDPR Compliance */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          GDPR Compliance (EU Users)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          If you are in the European Union, you have specific rights under the General Data Protection Regulation (GDPR):
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Right to Access" 
              secondary="Request a copy of your personal data we hold"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Right to Rectification" 
              secondary="Request correction of inaccurate or incomplete data"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Right to Erasure" 
              secondary="Request deletion of your personal data ('right to be forgotten')"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Right to Portability" 
              secondary="Request transfer of your data to another service provider"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Right to Object" 
              secondary="Object to processing of your data for direct marketing"
            />
          </ListItem>
        </List>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          To exercise these rights, contact us at: <strong>gdpr@caesertheadgenius.com</strong>
        </Typography>
      </Box>

      {/* HIPAA Compliance */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield color="secondary" />
          HIPAA Compliance (Healthcare Data)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          For clients in the healthcare industry, we maintain strict HIPAA compliance standards:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Protected Health Information (PHI)" 
              secondary="We implement appropriate safeguards to protect any healthcare-related data"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Business Associate Agreements" 
              secondary="We sign BAAs with healthcare clients to ensure HIPAA compliance"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Access Controls" 
              secondary="Strict role-based access controls for healthcare-related advertising data"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Audit Trails" 
              secondary="Comprehensive logging and monitoring of all PHI access"
            />
          </ListItem>
        </List>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          For HIPAA-related inquiries, contact: <strong>hipaa@caesertheadgenius.com</strong>
        </Typography>
      </Box>

      {/* Data Security */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lock color="success" />
          Data Security & Protection
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          We implement industry-leading security measures to protect your data:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Encryption" 
              secondary="All data is encrypted in transit (TLS 1.3) and at rest (AES-256)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Access Controls" 
              secondary="Multi-factor authentication and role-based access controls"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Regular Audits" 
              secondary="SOC 2 Type II compliance with annual security audits"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Data Centers" 
              secondary="Hosted in secure, certified data centers with 24/7 monitoring"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Incident Response" 
              secondary="Comprehensive incident response plan with immediate notification procedures"
            />
          </ListItem>
        </List>
      </Box>

      {/* Data Sharing */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          🤝 Data Sharing & Third Parties
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          We do not sell your personal data. We may share your information only in these limited circumstances:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Service Providers" 
              secondary="Trusted partners who help us provide our services (with strict data processing agreements)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Legal Requirements" 
              secondary="When required by law or to protect our rights and safety"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Business Transfers" 
              secondary="In the event of a merger, acquisition, or sale of assets (with user notification)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Advertising Platforms" 
              secondary="Anonymized, aggregated data for campaign optimization (no personal identifiers)"
            />
          </ListItem>
        </List>
      </Box>

      {/* Data Retention */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          🗄️ Data Retention
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          We retain your data only as long as necessary to provide our services and comply with legal obligations:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Account Data" 
              secondary="Retained while your account is active and for 12 months after deletion"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Campaign Data" 
              secondary="Retained for 36 months for historical analysis and optimization"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Financial Records" 
              secondary="Retained for 7 years as required by accounting regulations"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Support Communications" 
              secondary="Retained for 24 months for quality assurance and training"
            />
          </ListItem>
        </List>
      </Box>

      {/* Your Rights */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          🛡️ Your Rights & Choices
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Account Settings" 
              secondary="Update your personal information and preferences anytime"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Email Preferences" 
              secondary="Unsubscribe from marketing emails (service emails may still be sent)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Data Export" 
              secondary="Request a copy of your data in a portable format"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Account Deletion" 
              secondary="Permanently delete your account and associated data"
            />
          </ListItem>
        </List>
      </Box>

      {/* Children's Privacy */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          👶 Children's Privacy
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Our services are not intended for individuals under 18 years of age. We do not knowingly 
          collect personal information from children under 18. If you are a parent and believe 
          your child has provided us with personal information, please contact us immediately.
        </Typography>
      </Box>

      {/* Updates */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          🔄 Policy Updates
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          We may update this Privacy Policy periodically. We will notify you of any material 
          changes by email and by posting the new policy on our website. Your continued use 
          of our services after such modifications constitutes acceptance of the updated policy.
        </Typography>
      </Box>

      {/* Contact Information */}
      <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Verified color="primary" />
          Contact Our Privacy Team
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Have questions about this Privacy Policy or how we handle your data? We're here to help:
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>General Privacy Inquiries:</strong> privacy@caesertheadgenius.com
          </Typography>
          <Typography variant="body2">
            <strong>GDPR Requests:</strong> gdpr@caesertheadgenius.com
          </Typography>
          <Typography variant="body2">
            <strong>HIPAA Inquiries:</strong> hipaa@caesertheadgenius.com
          </Typography>
          <Typography variant="body2">
            <strong>Data Protection Officer:</strong> dpo@caesertheadgenius.com
          </Typography>
          <Typography variant="body2">
            <strong>Mailing Address:</strong><br />
            CeaserTheAdGenius Privacy Team<br />
            [Your Company Address]<br />
            [City, State, ZIP Code]
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
};

export default PrivacyPolicy;
