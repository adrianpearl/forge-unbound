import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { CampaignProvider } from './contexts/CampaignContext';
import { AuthProvider } from './contexts/AuthContext';
import { DonationAdmin } from './components/admin/DonationAdmin';
import { ActionPortalsAdmin } from './components/admin/ActionPortalsAdmin';
import { AnalyticsAdmin } from './components/admin/AnalyticsAdmin';
import { DonationPage } from './components/pages/DonationPage';
import { InitialAnchorScroll } from './components/InitialAnchorScroll';
import { AlertTriangle, Code } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

// Development mode banner component
function DevBanner() {
    const location = useLocation();
    
    // Only show dev banner on public pages, not on admin pages
    const publicRoutes = ['/donate', '/privacy', '/terms'];
    const utilityRoutes = ['/privacy', '/terms'];
    const isPublicRoute = publicRoutes.includes(location.pathname);
    const isUtilityRoute = utilityRoutes.includes(location.pathname);
    if (!isPublicRoute || isUtilityRoute) return null;
    
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
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <CampaignProvider>
                    <Router>
                        <InitialAnchorScroll />
                        <DevBanner />
                        <Routes>
                            <Route path="/privacy" element={<PrivacyPolicy />} />
                            <Route path="/terms" element={<TermsOfService />} />
                            <Route path="/donate" element={<DonationPage />} />
                            <Route path="/analytics" element={<AnalyticsAdmin />} />
                            <Route path="/action-portals" element={<ActionPortalsAdmin />} />
                            <Route path="/donation-portal" element={<DonationAdmin />} />
                            <Route path="/" element={<Navigate to="/donation-portal" replace />} />
                        </Routes>
                        <Toaster 
                            position="top-right"
                            toastOptions={{
                                duration: 5000,
                                style: {
                                    background: 'white',
                                    color: '#1f2937',
                                    border: '1px solid #d1d5db',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                },
                                classNames: {
                                    description: 'text-gray-700 font-medium',
                                    toast: 'bg-white text-gray-900 border-gray-300',
                                    actionButton: 'bg-blue-600 text-white font-medium hover:bg-blue-700',
                                },
                            }}
                        />
                    </Router>
                </CampaignProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
