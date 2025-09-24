import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { CampaignConfig, parseCampaignConfig, loadCampaignConfig } from '../types/campaign';

// Utility function to determine if a color is light or dark (for contrast)
function isLightColor(hex: string): boolean {
  // Remove hash if present
  hex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
}

interface CampaignContextType {
  config: CampaignConfig;
  updateConfig: (newConfig: CampaignConfig) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

interface CampaignProviderProps {
  children: ReactNode;
  config?: CampaignConfig; // Allow passing config for testing/override
  campaignId?: string; // Specify which JSON config to load
}

export function CampaignProvider({ children, config, campaignId }: CampaignProviderProps) {
  const [campaignConfig, setCampaignConfig] = useState<CampaignConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const updateConfig = (newConfig: CampaignConfig) => {
    setCampaignConfig(newConfig);
    
    // Update HTML meta tags dynamically
    if (newConfig.pageTitle) {
      document.title = newConfig.pageTitle;
    }
    
    if (newConfig.faviconUrl) {
      // Update favicon
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = newConfig.faviconUrl;
    }
    
    if (newConfig.metaDescription) {
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = newConfig.metaDescription;
    }
    
    // Update CSS variables for campaign theme colors
    if (newConfig.primaryColor) {
      // Set the campaign primary color directly as hex
      document.documentElement.style.setProperty('--campaign-primary-color', newConfig.primaryColor);
      
      // Calculate appropriate foreground color based on lightness
      const foregroundColor = isLightColor(newConfig.primaryColor) ? '#000000' : '#ffffff';
      document.documentElement.style.setProperty('--campaign-primary-foreground-color', foregroundColor);
      
      console.log('🎨 Updated campaign primary color:', newConfig.primaryColor, 'with foreground:', foregroundColor);
    }
    
    if (newConfig.secondaryColor) {
      // Set the campaign secondary color directly as hex
      document.documentElement.style.setProperty('--campaign-secondary-color', newConfig.secondaryColor);
      
      // Calculate appropriate foreground color
      const foregroundColor = isLightColor(newConfig.secondaryColor) ? '#000000' : '#ffffff';
      document.documentElement.style.setProperty('--campaign-secondary-foreground-color', foregroundColor);
      
      console.log('🎨 Updated campaign secondary color:', newConfig.secondaryColor, 'with foreground:', foregroundColor);
    }
  };

  useEffect(() => {
    if (config) {
    // If config is provided directly, use it
      updateConfig(config);
      setLoading(false);
      return;
    }

    // Determine which campaign config to load
    let targetCampaignId = campaignId || 'sarah-johnson';
    
    console.log('Loading campaign config for:', targetCampaignId);
    
    // Load the campaign config
    setLoading(true);
    loadCampaignConfig(targetCampaignId)
      .then(config => {
        console.log('Successfully loaded campaign config:', config.name);
        updateConfig(config);
        setLoading(false);
        setError(null);
      })
      .catch(error => {
        console.error('Failed to load campaign config:', error);
        setError(`Failed to load campaign: ${error.message}`);
        setLoading(false);
      });
  }, [config, campaignId]);

  if (loading) {
    return <div>Loading campaign...</div>;
  }
  
  if (error || !campaignConfig) {
    return <div>Error: {error || 'Failed to load campaign configuration'}</div>;
  }
  
  return (
    <CampaignContext.Provider value={{ config: campaignConfig, updateConfig }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign(): CampaignContextType {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}

// Convenience hook for just getting the config
export function useCampaignConfig(): CampaignConfig {
  const { config } = useCampaign();
  return config;
}
