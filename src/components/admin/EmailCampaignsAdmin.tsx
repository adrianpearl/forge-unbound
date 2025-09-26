import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Mails, Clock } from 'lucide-react';

export function EmailCampaignsAdmin() {
  return (
    <AdminLayout 
      pageTitle="Email Campaigns"
      breadcrumbs={[{ label: 'Email Campaigns' }]}
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Mails className="h-12 w-12 text-muted-foreground" />
            <Badge variant="secondary" className="px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Email Campaigns</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              This page is under construction. Email campaign management features will be available soon.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
