import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Vote, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ActionPortalsAdmin() {
  return (
    <AdminLayout 
      pageTitle="Action Portals"
      breadcrumbs={[{ label: 'Action Portals' }]}
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Action Portals</h1>
          <p className="text-muted-foreground">
            Create and manage donation portals for different campaigns, events, and fundraising goals.
          </p>
        </div>

        {/* Empty State */}
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Vote className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">No Action Portals Yet</CardTitle>
            <CardDescription className="text-base max-w-md mx-auto">
              Get started by creating your first donation portal. You can customize the messaging, 
              branding, and settings for different campaigns or fundraising goals.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center pb-8">
            <Button asChild size="lg" className="mb-6">
              <Link to="/donation-portal">
                <Plus className="mr-2 h-4 w-4" />
                New Donation Portal
              </Link>
            </Button>
            
            {/* Example Use Cases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 text-left">
              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  <Vote className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Standard Campaign Portal</h3>
                  <p className="text-sm text-muted-foreground">
                    Your main donation page with campaign messaging and regular fundraising goals.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Emergency Fundraising</h3>
                  <p className="text-sm text-muted-foreground">
                    Urgent deadline-driven portals with compelling messaging for critical moments.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
