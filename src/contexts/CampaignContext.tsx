import React, { createContext, useContext, ReactNode } from 'react';
import { CampaignConfig, parseCampaignConfig } from '../types/campaign';

const CampaignContext = createContext<CampaignConfig | undefined>(undefined);

interface CampaignProviderProps {
  children: ReactNode;
  config?: CampaignConfig; // Allow passing config for testing/override
}

export function CampaignProvider({ children, config }: CampaignProviderProps) {
  const campaignConfig = config || parseCampaignConfig();
  
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
