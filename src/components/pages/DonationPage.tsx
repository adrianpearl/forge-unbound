import React from 'react';
import DonationWidget from '@/components/DonationWidget';
import { useCampaignConfig } from '@/contexts/CampaignContext';

export function DonationPage() {
  const campaign = useCampaignConfig();
  
  // Set the document title using campaign config
  document.title = campaign.pageTitle || `Donate | ${campaign.fullName}`;
  
  return (
    <div className="public-facing bg-muted/50">
      <DonationWidget showFullPage={true} />
    </div>
  );
}
