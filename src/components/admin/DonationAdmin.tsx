import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useCampaign } from '@/contexts/CampaignContext';
import DonationWidget from '@/components/DonationWidget';
import { CampaignConfigForm } from './CampaignConfigForm';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export function DonationAdmin() {
  const { config: campaign, saveConfig } = useCampaign();
  
  const headerActions = (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => window.open('/donate', '_blank')}
      className="flex items-center gap-2"
    >
      <ExternalLink className="h-4 w-4" />
      Preview
    </Button>
  );
  
  return (
    <AdminLayout 
      pageTitle="Donation Widget"
      breadcrumbs={[{ label: 'Donation Widget' }]}
      headerActions={headerActions}
    >
      {/* Use the widget-only version within AdminLayout */}
      <DonationWidget showFullPage={false} />
      
      <Separator className="my-8" />
      
      {/* Configuration Editor */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <CampaignConfigForm 
          initialConfig={campaign}
          onConfigChange={saveConfig}
        />
      </div>
    </AdminLayout>
  );
}
