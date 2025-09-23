import React from 'react';
import { Link } from 'react-router-dom';
import { useCampaignConfig } from '../contexts/CampaignContext';

export function Footer() {
  const campaign = useCampaignConfig();
  return (
    <footer className="py-6 border-t text-center">
      <div className="space-x-3 mb-4">
        <Link to="/privacy">
          Privacy Policy
        </Link>
        <span className="text-muted-foreground">|</span>
        <Link to="/terms">
          Terms of Service
        </Link>
      </div>
      <p className="text-xs text-muted-foreground">
        Paid for by {campaign.legalName}. Not authorized by any candidate or candidate's committee.
      </p>
    </footer>
  );
}
