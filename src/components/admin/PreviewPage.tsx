import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AdminLayout } from '@/components/AdminLayout';
import { useCampaign } from '@/contexts/CampaignContext';
import DonationWidget from '@/components/DonationWidget';
import { Footer } from '@/components/Footer';

export function PreviewPage() {
  const campaign = useCampaign();
  
  return (
    <AdminLayout 
      pageTitle="Preview"
      breadcrumbs={[{ label: 'Preview' }]}
    >
      <div className="max-w-xl mx-auto px-6">
        <div className="logo max-w-56 my-4 mx-auto">
          <a href={campaign.website}>
            <img 
              src={campaign.logoUrl} 
              alt={campaign.logoAlt}
              className="mx-auto"
              onError={(e) => {
                // Fallback for missing logo
                e.currentTarget.style.display = 'none';
              }}
            />
          </a>
        </div>
        <div className="page-header py-4">
          <div className="prose prose-gray max-w-2xl">
            <ReactMarkdown>{campaign.headerContent}</ReactMarkdown>
          </div>
        </div>
        <DonationWidget />
        <Footer />
      </div>
    </AdminLayout>
  );
}
