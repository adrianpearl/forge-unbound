import React from 'react';
import DonationWidget from '@/components/DonationWidget';

export function DonationPage() {
  return (
    <div className="public-font">
      <DonationWidget showFullPage={true} />
    </div>
  );
}
