import React from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import DonationWidget from './components/DonationWidget';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { Footer } from './components/Footer';
import { CampaignProvider, useCampaign } from './contexts/CampaignContext';
import { PreviewPage } from './components/admin/PreviewPage';
import { AlertTriangle, Code } from 'lucide-react';

// Development mode banner component
function DevBanner() {
    const location = useLocation();
    
    // Don't show dev banner on admin routes
    if (location.pathname.startsWith('/admin')) return null;
    
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

// Parse URL parameters for donation pre-filling
function parseUrlParameters(searchParams: URLSearchParams) {
    const amountParam = searchParams.get('amount');
    
    if (amountParam) {
        const amountInCents = parseInt(amountParam);
        const amountInDollars = amountInCents / 100;
        
        if (amountInCents > 0 && amountInDollars >= 1) {
            console.log(`Pre-filling amount from URL: $${amountInDollars} (${amountInCents} cents)`);
            return { initialAmount: amountInDollars };
        } else {
            console.warn(`Invalid amount parameter: ${amountParam}. Amount must be at least 100 cents ($1.00)`);
        }
    }
    
    return { initialAmount: 0 };
}

// Home page component that handles URL parameters
function HomePage() {
    const [searchParams] = useSearchParams();
    const { initialAmount } = parseUrlParameters(searchParams);
    const campaign = useCampaign();
    
    return (
        <div className="max-w-xl mx-auto px-6">
            <div className="logo max-w-56 my-4 mx-auto">
                <a href={campaign.website}>
                    <img src={campaign.logoUrl} alt={campaign.logoAlt} />
                </a>
            </div>
            <div className="page-header py-4">
                <div className="prose prose-gray max-w-2xl">
                    <ReactMarkdown>{campaign.headerContent}</ReactMarkdown>
                </div>
            </div>
            <DonationWidget initialAmount={initialAmount} />
            <footer className="text-left p-5 border-t border-border text-xs leading-relaxed text-foreground">
                <div className="mb-5">
                    <h3 className="text-base font-bold mb-2.5">Contribution rules</h3>
                    <ul className="list-disc list-inside space-y-1.5 text-sm">
                        <li>I am a U.S. citizen or lawfully admitted permanent resident (i.e., green card holder).</li>
                        <li>This contribution is made from my own funds, and funds are not being provided to me by another person or entity for the purpose of making this contribution.</li>
                        <li>I am at least eighteen years old.</li>
                        <li>I am not a federal contractor.</li>
                        <li>I am making this contribution with my own personal credit card and not with a corporate or business credit card or a card issued to another person.</li>
                    </ul>
                </div>

                <div className="mb-4">
                    <p className="mb-2.5">
                        <strong>Federal Election Commission Disclaimer:</strong> By proceeding with this transaction, you agree to the contribution rules above. Contributions to political candidates are not tax-deductible for federal income tax purposes.
                    </p>
                </div>

                <div className="mb-4">
                    <p className="mb-2.5">
                        <strong>Platform Disclaimer:</strong> This donation platform is paid for by {campaign.legalName} and not authorized by any other candidate or candidate committee. For questions about donations, please contact <a href={`mailto:${campaign.contactEmail}`}>{campaign.contactEmail}</a>.
                    </p>
                </div>

                <div className="mb-5">
                    <p>
                        <strong>Contribution Limits:</strong> Federal law requires us to use our best efforts to collect and report the name, mailing address, occupation and name of employer of individuals whose contributions exceed $200 in a calendar year. The maximum amount an individual may contribute is $3,500 for the primary plus an additional $3,500 for the general election for a total of $7,000 per election.
                    </p>
                </div>

            </footer>
            <Footer />
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
                    <Route path="/" element={<HomePage />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/admin/preview" element={<PreviewPage />} />
                </Routes>
            </Router>
        </CampaignProvider>
    );
}

export default App;
