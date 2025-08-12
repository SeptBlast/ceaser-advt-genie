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
  Alert,
} from '@mui/material';
import { 
  Gavel, 
  Security, 
  Warning, 
  Info, 
  AccountBalance,
  Verified,
  MonetizationOn,
  Cancel
} from '@mui/icons-material';

const TermsAndConditions: React.FC = () => {
  return (
    <Stack spacing={4}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Terms and Conditions ⚖️
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Legal agreement for using CeaserTheAdGenius platform
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
        
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
          <Chip icon={<Gavel />} label="Legally Binding" color="error" size="small" />
          <Chip icon={<Security />} label="User Protection" color="primary" size="small" />
          <Chip icon={<Verified />} label="Fair Terms" color="success" size="small" />
        </Stack>
      </Box>

      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          <strong>Important:</strong> By using CeaserTheAdGenius, you agree to these terms. 
          Please read them carefully before using our platform.
        </Typography>
      </Alert>

      <Divider />

      {/* Introduction */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          🐕 Welcome to CeaserTheAdGenius
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          These Terms and Conditions ("Terms") govern your use of the CeaserTheAdGenius 
          platform and services ("Service") provided by CeaserTheAdGenius Inc. ("we," "our," or "us"). 
          By accessing or using our Service, you agree to be bound by these Terms.
        </Typography>
      </Box>

      {/* Acceptance of Terms */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Verified color="primary" />
          1. Acceptance of Terms
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          By creating an account, accessing, or using CeaserTheAdGenius, you acknowledge that 
          you have read, understood, and agree to be bound by these Terms and our Privacy Policy. 
          If you do not agree to these Terms, you may not use our Service.
        </Typography>
        
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Eligibility Requirements:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="Age Requirement" 
              secondary="You must be at least 18 years old to use our Service"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Business Authority" 
              secondary="You represent that you have the authority to bind your organization to these Terms"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Legal Compliance" 
              secondary="You must comply with all applicable local, state, and federal laws"
            />
          </ListItem>
        </List>
      </Box>

      {/* Service Description */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          🎯 2. Description of Service
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          CeaserTheAdGenius provides an AI-powered advertising platform that helps businesses 
          create, manage, and optimize digital advertising campaigns across multiple platforms.
        </Typography>
        
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Our Service includes:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="Campaign Management" 
              secondary="Tools to create, edit, and manage advertising campaigns"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="AI Optimization" 
              secondary="Machine learning algorithms to optimize campaign performance"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Analytics & Reporting" 
              secondary="Comprehensive reporting and performance analytics"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Multi-Platform Integration" 
              secondary="Integration with major advertising platforms"
            />
          </ListItem>
        </List>
      </Box>

      {/* User Accounts */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          👤 3. User Accounts and Security
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          To use our Service, you must create an account and provide accurate information.
        </Typography>
        
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Account Responsibilities:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Accurate Information" 
              secondary="Provide truthful, accurate, and complete information during registration"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Password Security" 
              secondary="Maintain the confidentiality of your account credentials"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Account Activity" 
              secondary="You are responsible for all activities that occur under your account"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Unauthorized Access" 
              secondary="Immediately notify us of any unauthorized use of your account"
            />
          </ListItem>
        </List>
      </Box>

      {/* Acceptable Use */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          4. Acceptable Use Policy
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          You agree to use our Service only for lawful purposes and in accordance with these Terms.
        </Typography>
        
        <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }}>
          <Typography variant="body2">
            <strong>Prohibited Activities:</strong> The following activities are strictly forbidden 
            and may result in immediate account termination.
          </Typography>
        </Alert>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          You agree NOT to:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Illegal Content" 
              secondary="Create or promote campaigns for illegal products, services, or activities"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Harmful Content" 
              secondary="Use our platform for hate speech, harassment, or discriminatory content"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Fraudulent Activity" 
              secondary="Engage in click fraud, impression fraud, or any deceptive practices"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="System Abuse" 
              secondary="Attempt to bypass security measures or overload our systems"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Intellectual Property Violation" 
              secondary="Infringe on copyrights, trademarks, or other intellectual property rights"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Data Scraping" 
              secondary="Extract or harvest data from our platform without permission"
            />
          </ListItem>
        </List>
      </Box>

      {/* Payment Terms */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MonetizationOn color="success" />
          5. Payment Terms and Billing
        </Typography>
        
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Subscription Plans:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Free Trial" 
              secondary="New users receive a 14-day free trial with full platform access"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Monthly Billing" 
              secondary="Subscription fees are billed monthly in advance"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Auto-Renewal" 
              secondary="Subscriptions automatically renew unless cancelled before the billing date"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Price Changes" 
              secondary="We will provide 30 days notice for any subscription price changes"
            />
          </ListItem>
        </List>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Advertising Spend:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Platform Fees" 
              secondary="Advertising spend on external platforms is billed directly by those platforms"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Management Fees" 
              secondary="Our platform fee is separate from advertising spend and clearly disclosed"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Budget Controls" 
              secondary="You maintain full control over advertising budgets and spending limits"
            />
          </ListItem>
        </List>
      </Box>

      {/* Intellectual Property */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          🔒 6. Intellectual Property Rights
        </Typography>
        
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Our Intellectual Property:
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          The CeaserTheAdGenius platform, including all software, algorithms, designs, trademarks, 
          and content, is owned by us and protected by intellectual property laws.
        </Typography>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Your Content:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Ownership" 
              secondary="You retain ownership of all content you create and upload to our platform"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="License to Use" 
              secondary="You grant us a license to use your content to provide our services"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Compliance" 
              secondary="You warrant that your content does not infringe on third-party rights"
            />
          </ListItem>
        </List>
      </Box>

      {/* Privacy and Data */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          7. Privacy and Data Protection
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Your privacy is important to us. Our collection and use of your information is governed 
          by our Privacy Policy, which is incorporated into these Terms by reference.
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Data Collection" 
              secondary="We collect and process data as described in our Privacy Policy"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="GDPR Compliance" 
              secondary="We comply with GDPR requirements for EU users"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="HIPAA Compliance" 
              secondary="Healthcare clients receive additional HIPAA protections"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Data Security" 
              secondary="We implement industry-standard security measures to protect your data"
            />
          </ListItem>
        </List>
      </Box>

      {/* Service Availability */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          ⚡ 8. Service Availability and Support
        </Typography>
        
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Service Level:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Uptime Target" 
              secondary="We strive for 99.9% uptime but cannot guarantee uninterrupted service"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Maintenance" 
              secondary="Scheduled maintenance will be announced in advance when possible"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Customer Support" 
              secondary="Support is available during business hours via email and chat"
            />
          </ListItem>
        </List>
      </Box>

      {/* Limitation of Liability */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" />
          9. Limitation of Liability
        </Typography>
        
        <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
          <Typography variant="body2">
            <strong>Important Legal Notice:</strong> Please read this section carefully as it 
            limits our liability to you.
          </Typography>
        </Alert>

        <Typography variant="body2" color="text.secondary" paragraph>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL CAESERTHEADGENIUS BE LIABLE FOR:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Indirect Damages" 
              secondary="Any indirect, incidental, special, consequential, or punitive damages"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Business Losses" 
              secondary="Loss of profits, revenue, data, or business opportunities"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Campaign Performance" 
              secondary="Any advertising campaign performance or results"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Third-Party Actions" 
              secondary="Actions or inactions of third-party advertising platforms"
            />
          </ListItem>
        </List>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Our total liability to you for any claims arising from these Terms or our Service 
          shall not exceed the amount you paid us in the 12 months preceding the claim.
        </Typography>
      </Box>

      {/* Termination */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Cancel color="error" />
          10. Termination
        </Typography>
        
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Your Right to Terminate:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Account Cancellation" 
              secondary="You may cancel your account at any time through your account settings"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="No Refunds" 
              secondary="Subscription fees are non-refundable except as required by law"
            />
          </ListItem>
        </List>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Our Right to Terminate:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Violation of Terms" 
              secondary="We may suspend or terminate accounts that violate these Terms"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Immediate Termination" 
              secondary="We reserve the right to terminate accounts immediately for severe violations"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Notice Period" 
              secondary="For non-violation terminations, we will provide reasonable notice"
            />
          </ListItem>
        </List>
      </Box>

      {/* Governing Law */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance color="primary" />
          11. Governing Law and Disputes
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          These Terms are governed by the laws of [Your State/Country] without regard to 
          conflict of law principles. Any disputes arising from these Terms or our Service 
          will be resolved through binding arbitration, except for claims that may be 
          brought in small claims court.
        </Typography>
        
        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Dispute Resolution Process:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="1. Direct Communication" 
              secondary="First, contact our support team to resolve the issue"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="2. Mediation" 
              secondary="If unresolved, we'll attempt mediation through a neutral third party"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="3. Arbitration" 
              secondary="Final disputes will be resolved through binding arbitration"
            />
          </ListItem>
        </List>
      </Box>

      {/* Changes to Terms */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          🔄 12. Changes to Terms
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          We may update these Terms periodically to reflect changes in our Service or legal requirements. 
          We will notify you of material changes by email and by posting the updated Terms on our website. 
          Your continued use of our Service after such changes constitutes acceptance of the new Terms.
        </Typography>
      </Box>

      {/* Contact Information */}
      <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Info color="primary" />
          Contact Information
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          If you have any questions about these Terms and Conditions, please contact us:
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>Legal Department:</strong> legal@caesertheadgenius.com
          </Typography>
          <Typography variant="body2">
            <strong>General Support:</strong> support@caesertheadgenius.com
          </Typography>
          <Typography variant="body2">
            <strong>Business Address:</strong><br />
            CeaserTheAdGenius Inc.<br />
            [Your Company Address]<br />
            [City, State, ZIP Code]<br />
            [Country]
          </Typography>
          <Typography variant="body2">
            <strong>Phone:</strong> [Your Business Phone]
          </Typography>
        </Stack>
      </Box>

      {/* Final Notice */}
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          <strong>Effective Date:</strong> These Terms and Conditions are effective as of {new Date().toLocaleDateString()} 
          and will remain in effect until superseded by updated terms.
        </Typography>
      </Alert>
    </Stack>
  );
};

export default TermsAndConditions;
