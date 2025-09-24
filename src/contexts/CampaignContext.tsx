import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { CampaignConfig, parseCampaignConfig, loadCampaignConfig, saveCampaignConfig } from '../types/campaign';
import { useAuth } from './AuthContext';

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
  saveConfig: (config: CampaignConfig) => Promise<void>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

interface CampaignProviderProps {
  children: ReactNode;
  config?: CampaignConfig; // Allow passing config for testing/override
  campaignId?: string; // Specify which JSON config to load
}

export function CampaignProvider({ children, config, campaignId }: CampaignProviderProps) {
  const { isDemo } = useAuth();
  const [campaignConfig, setCampaignConfig] = useState<CampaignConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  
  const updateConfig = (newConfig: CampaignConfig) => {
    setCampaignConfig(newConfig);
    
    // In demo mode, store config changes in sessionStorage for preview snapshots
    if (isDemo && currentCampaignId) {
      try {
        sessionStorage.setItem(`demo-config-${currentCampaignId}`, JSON.stringify(newConfig));
        console.log('💾 Demo config stored for preview snapshots');
      } catch (error) {
        console.warn('Failed to store demo config:', error);
      }
    }
    
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
    setCurrentCampaignId(targetCampaignId);
    
    console.log('Loading campaign config for:', targetCampaignId);
    
    // In demo mode, check for demo config in sessionStorage first
    if (isDemo) {
      try {
        const demoConfigStr = sessionStorage.getItem(`demo-config-${targetCampaignId}`);
        if (demoConfigStr) {
          const demoConfig = JSON.parse(demoConfigStr);
          console.log('🎭 Found demo config in session storage:', demoConfig.name);
          updateConfig(demoConfig);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.warn('Failed to load demo config from storage:', error);
        // Fall through to load from server
      }
    }
    
    // Load the campaign config from server
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
  
  const saveConfig = async (newConfig: CampaignConfig) => {
    if (!currentCampaignId) {
      throw new Error('No campaign ID available for saving');
    }
    
    await saveCampaignConfig(currentCampaignId, newConfig, isDemo);
    // Update the local state after successful save (even in demo mode for real-time preview)
    updateConfig(newConfig);
  };

  if (loading) {
    return <div>Loading campaign...</div>;
  }
  
  if (error || !campaignConfig) {
    return <div>Error: {error || 'Failed to load campaign configuration'}</div>;
  }
  
  return (
    <CampaignContext.Provider value={{ config: campaignConfig, updateConfig, saveConfig }}>
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
