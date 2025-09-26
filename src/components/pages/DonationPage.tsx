import React from 'react';
import DonationWidget from '@/components/DonationWidget';

export function DonationPage() {
  return (
    <div className="public-facing bg-muted/50">
      <DonationWidget showFullPage={true} />
    </div>
  );
}
