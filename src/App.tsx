import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { CampaignProvider } from './contexts/CampaignContext';
import { DonationPage } from './components/admin/DonationPage';
import { AlertTriangle, Code } from 'lucide-react';

// Development mode banner component
function DevBanner() {
    const location = useLocation();
    
    // Only show dev banner on donation pages, not on the main dashboard
    if (location.pathname.startsWith('/admin') || location.pathname === '/') return null;
    
    // Only show in development mode
    const isDev = import.meta.env.DEV || window.location.hostname === 'localhost';
    const stripeKey = window.STRIPE_PUBLISHABLE_KEY || '';
    const isTestMode = stripeKey.startsWith('pk_test_');
    
    if (!isDev && !isTestMode) return null;
    
    return (
        <div className="sticky top-0 w-full z-[9999] bg-blue-50 border-b border-blue-200 px-4 py-2">
            <div className="max-w-4xl mx-auto flex items-center justify-center text-sm">
                <div className="flex items-center text-blue-800">
                    <Code className="h-4 w-4 mr-2" />
                    <span className="font-medium">Development Mode</span>
                    {isTestMode && (
                        <>
                            <span className="mx-2">•</span>
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            <span>Using Stripe Test Keys</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}


// Main App component with routing
function App() {
    return (
        <CampaignProvider>
            <Router>
                <DevBanner />
                <Routes>
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/" element={<DonationPage />} />
                </Routes>
            </Router>
        </CampaignProvider>
    );
}

export default App;
