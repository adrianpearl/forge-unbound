export interface CampaignConfig {
  // Basic Campaign Info
  name: string;
  fullName: string;
  tagline: string;
  website: string;
  contactEmail: string;
  
  // Campaign Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Branding
  logoUrl: string;
  logoAlt: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  
  // Page Metadata
  pageTitle?: string;
  metaDescription?: string;
  
  // Legal Information
  legalName: string; // For FEC disclaimers
  fecId?: string; // FEC Committee ID
  privacyOfficer?: string;
  privacyOfficerEmail?: string;
  
  // Donation Settings
  defaultAmounts: number[]; // Preset amounts in dollars
  maxContribution: number; // Maximum single contribution
  
  // Custom Messaging
  customFooterText?: string;
  donationSuccessMessage?: string;
}

// Parse environment variables into a typed CampaignConfig
export function parseCampaignConfig(): CampaignConfig {
  const env = import.meta.env;
  
  return {
    name: env.VITE_CAMPAIGN_NAME || 'Your Campaign',
    fullName: env.VITE_CAMPAIGN_FULL_NAME || 'Your Campaign',
    tagline: env.VITE_CAMPAIGN_TAGLINE || 'Support our campaign.',
    website: env.VITE_CAMPAIGN_WEBSITE || 'https://example.com',
    contactEmail: env.VITE_CAMPAIGN_CONTACT_EMAIL || 'info@example.com',
    
    address: env.VITE_CAMPAIGN_ADDRESS || '123 Main Street',
    city: env.VITE_CAMPAIGN_CITY || 'Anytown',
    state: env.VITE_CAMPAIGN_STATE || 'NY',
    zipCode: env.VITE_CAMPAIGN_ZIP_CODE || '12345',
    
    logoUrl: env.VITE_CAMPAIGN_LOGO_URL || '/assets/logo.png',
    logoAlt: env.VITE_CAMPAIGN_LOGO_ALT || 'Campaign Logo',
    faviconUrl: env.VITE_CAMPAIGN_FAVICON_URL,
    primaryColor: env.VITE_CAMPAIGN_PRIMARY_COLOR,
    secondaryColor: env.VITE_CAMPAIGN_SECONDARY_COLOR,
    
    pageTitle: env.VITE_CAMPAIGN_PAGE_TITLE || `Donate | ${env.VITE_CAMPAIGN_FULL_NAME || 'Your Campaign'}`,
    metaDescription: env.VITE_CAMPAIGN_META_DESCRIPTION,
    
    legalName: env.VITE_CAMPAIGN_LEGAL_NAME || env.VITE_CAMPAIGN_FULL_NAME || 'Your Campaign',
    fecId: env.VITE_CAMPAIGN_FEC_ID,
    privacyOfficer: env.VITE_CAMPAIGN_PRIVACY_OFFICER,
    privacyOfficerEmail: env.VITE_CAMPAIGN_PRIVACY_OFFICER_EMAIL || env.VITE_CAMPAIGN_CONTACT_EMAIL || 'info@example.com',
    
    defaultAmounts: env.VITE_CAMPAIGN_DEFAULT_AMOUNTS 
      ? JSON.parse(env.VITE_CAMPAIGN_DEFAULT_AMOUNTS) 
      : [25, 50, 100, 250, 500, 1000, 3500],
    maxContribution: parseInt(env.VITE_CAMPAIGN_MAX_CONTRIBUTION || '3500'),
    
    customFooterText: env.VITE_CAMPAIGN_FOOTER_TEXT,
    donationSuccessMessage: env.VITE_CAMPAIGN_SUCCESS_MESSAGE,
  };
}
