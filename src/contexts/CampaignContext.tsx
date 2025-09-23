import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { CampaignConfig, parseCampaignConfig, loadCampaignConfig } from '../types/campaign';

const CampaignContext = createContext<CampaignConfig | undefined>(undefined);

interface CampaignProviderProps {
  children: ReactNode;
  config?: CampaignConfig; // Allow passing config for testing/override
  campaignId?: string; // Specify which JSON config to load
}

export function CampaignProvider({ children, config, campaignId }: CampaignProviderProps) {
  const [campaignConfig, setCampaignConfig] = useState<CampaignConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      // If config is provided directly, use it
      setCampaignConfig(config);
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
        setCampaignConfig(config);
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
    <CampaignContext.Provider value={campaignConfig}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign(): CampaignConfig {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}
