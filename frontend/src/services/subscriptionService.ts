// Simple mock service for handling waitlist and newsletter subscriptions
// In production, this would integrate with your backend API

interface SubscriptionData {
  email: string;
  timestamp: Date;
  type: "waitlist" | "newsletter";
  gdprConsent?: boolean;
  termsConsent?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

class SubscriptionService {
  // In production, these would be API calls to your backend
  static async joinWaitlist(data: {
    email: string;
    agreedToTerms: boolean;
    agreedToPrivacy: boolean;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          message: "Please enter a valid email address.",
        };
      }

      // Check consents
      if (!data.agreedToTerms || !data.agreedToPrivacy) {
        return {
          success: false,
          message: "Please agree to our Terms and Privacy Policy.",
        };
      }

      // Store subscription data (GDPR/HIPAA compliant)
      const subscriptionData: SubscriptionData = {
        email: data.email,
        timestamp: new Date(),
        type: "waitlist",
        gdprConsent: data.agreedToPrivacy,
        termsConsent: data.agreedToTerms,
        ipAddress: "[HASHED]", // In production, hash for privacy
        userAgent: navigator.userAgent.substring(0, 100), // Truncated for privacy
      };

      // In production, send to secure backend
      console.log("Waitlist signup (GDPR/HIPAA compliant):", subscriptionData);

      // Store in localStorage for demo (in production, use secure backend)
      const existingWaitlist = JSON.parse(
        localStorage.getItem("caeser_waitlist") || "[]"
      );

      // Check for duplicate
      if (existingWaitlist.find((item: any) => item.email === data.email)) {
        return {
          success: false,
          message: "This email is already on our waitlist! 🐕",
        };
      }

      existingWaitlist.push(subscriptionData);
      localStorage.setItem("caeser_waitlist", JSON.stringify(existingWaitlist));

      // In production, trigger welcome email with proper consent records
      this.sendWelcomeEmail(data.email, "waitlist");

      return {
        success: true,
        message:
          "Welcome to the pack! You'll hear from us soon with early access. 🎾",
      };
    } catch (error) {
      console.error("Waitlist signup error:", error);
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      };
    }
  }

  static async subscribeNewsletter(data: {
    email: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          message: "Please enter a valid email address.",
        };
      }

      // Store subscription data (GDPR compliant - minimal data collection)
      const subscriptionData: SubscriptionData = {
        email: data.email,
        timestamp: new Date(),
        type: "newsletter",
        // Newsletter uses opt-in consent model (lighter requirements)
      };

      // In production, send to secure backend
      console.log("Newsletter signup (GDPR compliant):", subscriptionData);

      // Store in localStorage for demo (in production, use secure backend)
      const existingNewsletter = JSON.parse(
        localStorage.getItem("caeser_newsletter") || "[]"
      );

      // Check for duplicate
      if (existingNewsletter.find((item: any) => item.email === data.email)) {
        return {
          success: false,
          message: "You're already subscribed! 📬",
        };
      }

      existingNewsletter.push(subscriptionData);
      localStorage.setItem(
        "caeser_newsletter",
        JSON.stringify(existingNewsletter)
      );

      // In production, trigger welcome email
      this.sendWelcomeEmail(data.email, "newsletter");

      return {
        success: true,
        message: "Subscribed successfully! Check your inbox for updates. 📧",
      };
    } catch (error) {
      console.error("Newsletter signup error:", error);
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      };
    }
  }

  private static async sendWelcomeEmail(
    email: string,
    type: "waitlist" | "newsletter"
  ) {
    // In production, this would integrate with email service (SendGrid, Mailchimp, etc.)
    // with proper GDPR consent tracking and unsubscribe mechanisms
    console.log(`Welcome email sent to ${email} for ${type}`);

    // Example of GDPR-compliant email tracking
    const emailRecord = {
      email,
      type,
      sentAt: new Date(),
      consentRecorded: true,
      unsubscribeToken: this.generateUnsubscribeToken(email),
    };

    console.log("Email tracking record (GDPR compliant):", emailRecord);
  }

  private static generateUnsubscribeToken(email: string): string {
    // In production, use proper cryptographic functions
    return btoa(email + Date.now())
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 16);
  }

  // GDPR compliance methods
  static async requestDataExport(email: string): Promise<any> {
    // In production, compile all user data for export
    const waitlist = JSON.parse(
      localStorage.getItem("caeser_waitlist") || "[]"
    );
    const newsletter = JSON.parse(
      localStorage.getItem("caeser_newsletter") || "[]"
    );

    const userData = {
      waitlistData: waitlist.filter((item: any) => item.email === email),
      newsletterData: newsletter.filter((item: any) => item.email === email),
      exportedAt: new Date(),
      retentionPeriod: "36 months",
    };

    return userData;
  }

  static async requestDataDeletion(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // In production, remove from all systems and mark for deletion
      const waitlist = JSON.parse(
        localStorage.getItem("caeser_waitlist") || "[]"
      );
      const newsletter = JSON.parse(
        localStorage.getItem("caeser_newsletter") || "[]"
      );

      const updatedWaitlist = waitlist.filter(
        (item: any) => item.email !== email
      );
      const updatedNewsletter = newsletter.filter(
        (item: any) => item.email !== email
      );

      localStorage.setItem("caeser_waitlist", JSON.stringify(updatedWaitlist));
      localStorage.setItem(
        "caeser_newsletter",
        JSON.stringify(updatedNewsletter)
      );

      // In production, log deletion request for compliance audit trail
      console.log(
        `GDPR deletion request processed for ${email} at ${new Date()}`
      );

      return {
        success: true,
        message: "Your data has been permanently deleted from our systems.",
      };
    } catch (error) {
      console.error("Data deletion error:", error);
      return {
        success: false,
        message: "Unable to process deletion request. Please contact support.",
      };
    }
  }

  // Analytics for admin (anonymized)
  static getSubscriptionStats() {
    const waitlist = JSON.parse(
      localStorage.getItem("caeser_waitlist") || "[]"
    );
    const newsletter = JSON.parse(
      localStorage.getItem("caeser_newsletter") || "[]"
    );

    return {
      waitlistCount: waitlist.length,
      newsletterCount: newsletter.length,
      totalSubscriptions: waitlist.length + newsletter.length,
      lastSignup: Math.max(
        ...waitlist.map((item: any) => new Date(item.timestamp).getTime()),
        ...newsletter.map((item: any) => new Date(item.timestamp).getTime())
      ),
    };
  }
}

export default SubscriptionService;
