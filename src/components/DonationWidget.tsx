import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useSearchParams } from 'react-router-dom';
import { AnchorLink } from '@/components/AnchorLink';
import { DonorInfo } from './DonorInfo';
import { AmountSelector } from './AmountSelector';
import { DonationType } from './DonationType';
import { ProcessingFee } from './ProcessingFee';
import { Footer } from './Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Heart, RotateCcw, CreditCard, Info } from 'lucide-react';
import { useCampaign } from '@/contexts/CampaignContext';

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

interface DonationWidgetProps {
  showFullPage?: boolean; // Controls whether to show full page content or just widget
}

function DonationWidget({ showFullPage = false }: DonationWidgetProps) {
  const [searchParams] = useSearchParams();
  const { initialAmount } = parseUrlParameters(searchParams);
  
  const formRef = useRef(null);
  const cardElementRef = useRef(null);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const cardRef = useRef(null);
  const { config: campaign } = useCampaign();
  
  // Form state
  const [donationAmount, setDonationAmount] = useState(initialAmount);
  const [donationType, setDonationType] = useState<'monthly' | 'one-time'>('monthly');
  const [processingFeeAmount, setProcessingFeeAmount] = useState(0);
  const [coverProcessingFee, setCoverProcessingFee] = useState(true);
  
  // Form validation state
  const [donorInfoValid, setDonorInfoValid] = useState(false);
  const [paymentInfoValid, setPaymentInfoValid] = useState(false);
  const [donorInfoData, setDonorInfoData] = useState({});
  
  // Payment processing state
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cardErrors, setCardErrors] = useState('');
  
  // Calculate if form is ready for submission
  const isFormValid = donationAmount > 0 && donorInfoValid && paymentInfoValid;

  useEffect(() => {
    const initializeStripe = async () => {
      if (!window.Stripe) {
        console.error('Stripe.js not loaded');
        return;
      }
      
      let publishableKey = window.STRIPE_PUBLISHABLE_KEY;
      
      // In development, fetch the key from API if not available in window
      if (!publishableKey && import.meta.env.DEV) {
        try {
          const response = await fetch('/api/stripe-key');
          const data = await response.json();
          publishableKey = data.publishableKey;
          console.log('🔑 Fetched Stripe key from API:', publishableKey.substring(0, 12) + '...');
        } catch (error) {
          console.error('Failed to fetch Stripe key:', error);
          publishableKey = 'pk_test_dummy_key_replace_with_real_key';
        }
      }
      
      if (!publishableKey) {
        publishableKey = 'pk_test_dummy_key_replace_with_real_key';
      }
      
      const stripeInstance = window.Stripe(publishableKey);
      if (!stripeInstance) {
        console.error('Failed to initialize Stripe');
        return;
      }
      
      const elementsInstance = stripeInstance.elements();
      setStripe(stripeInstance);
      setElements(elementsInstance);

      const card = elementsInstance.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#0f172a', // matches shadcn foreground
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '::placeholder': { color: '#64748b' }, // matches shadcn muted-foreground
            iconColor: '#64748b',
          },
          invalid: { 
            color: '#dc2626', // matches shadcn destructive
            iconColor: '#dc2626',
          },
          complete: {
            iconColor: '#0f172a', // matches shadcn primary
          },
        },
        hidePostalCode: true,
      });
      
      if (cardElementRef.current) {
        card.mount(cardElementRef.current);
        cardRef.current = card;

        // Listen for card validation changes
        card.on('change', (event) => {
          // Card is valid when complete and no errors
          const isValid = event.complete === true && !event.error;
          setPaymentInfoValid(isValid);
          
          // Update card errors in React state
          if (event.error) {
            setCardErrors(event.error.message);
          } else {
            setCardErrors('');
          }
        });
      }
    };
    
    initializeStripe();
    
    return () => {
      if (cardRef.current) {
        try { cardRef.current.unmount(); } catch {}
      }
    };
  }, []);

  // Payment submission functions ported from vanilla widget.js
  const getFormData = () => {
    const totalAmount = donationAmount + processingFeeAmount;
    return {
      firstName: donorInfoData.firstName || '',
      lastName: donorInfoData.lastName || '',
      email: donorInfoData.email || '',
      phone: donorInfoData.phone || '',
      address: donorInfoData.address || '',
      city: donorInfoData.city || '',
      state: donorInfoData.state || '',
      zip: donorInfoData.zip || '',
      occupation: donorInfoData.occupation || '',
      employer: donorInfoData.employer || '',
      comment: donorInfoData.comment || '',
      amount: Math.round(totalAmount * 100), // Convert to cents
      donationAmount: Math.round(donationAmount * 100),
      processingFee: Math.round(processingFeeAmount * 100),
      donationType: donationType,
      coverProcessingFee: coverProcessingFee,
    };
  };

  const createPaymentIntent = async (formData) => {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create payment intent' }));
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    return await response.json();
  };

  const handleSubmit = async () => {
    const totalAmount = donationAmount + processingFeeAmount;
    
    if (totalAmount <= 0) {
      setErrorMessage('Please select a donation amount.');
      return;
    }

    // Clear previous errors
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Get form data
      const formData = getFormData();
      console.log('🔄 Submitting donation:', {
        amount: formData.amount,
        donationType: formData.donationType,
        email: formData.email ? '[REDACTED]' : 'missing'
      });

      // Create payment intent on server
      const { clientSecret } = await createPaymentIntent(formData);
      console.log('💳 Confirming payment with Stripe...');

      // Prepare billing details for Stripe
      const billingDetails = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone || undefined,
        address: {
          line1: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zip,
          country: 'US'
        }
      };

      console.log('🏠 Billing details being sent to Stripe:', billingDetails);

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardRef.current,
          billing_details: billingDetails,
        },
      });

      console.log('Payment confirmation result:', result);

      if (result.error) {
        console.error('❌ Payment failed:', result.error);
        setErrorMessage(result.error.message);
        setIsLoading(false);
      } else {
        console.log('✅ Payment succeeded:', result.paymentIntent);
        setPaymentSuccess(true);
        setIsLoading(false);
        
        // Optional: Track the donation for analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'donation', {
            'event_category': 'engagement',
            'event_label': donationType,
            'value': totalAmount
          });
        }
      }

    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  // If payment succeeded, show success message
  if (paymentSuccess) {
    return (
      <div className="donation-widget space-y-6 max-w-2xl mx-auto py-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
          <div>
            <h2 className="text-2xl font-semibold text-green-900 mb-2">Thank You!</h2>
            <p className="text-green-800 text-base">
              Your {donationType === 'monthly' ? 'monthly ' : ''}
              donation of <span className="font-semibold">${(donationAmount + processingFeeAmount).toFixed(2)}</span> has been processed successfully.
            </p>
          </div>
          
          <div className="bg-white/50 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-center text-sm text-green-700">
              <Mail className="h-4 w-4 mr-2" />
              You should receive a confirmation email shortly
            </div>
            <div className="flex items-center justify-center text-sm text-green-700">
              <Heart className="h-4 w-4 mr-2" />
              Your contribution helps keep our campaign independent
            </div>
            {donationType === 'monthly' && (
              <div className="flex items-center justify-center text-sm text-green-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                Your monthly donation will continue until you choose to cancel
              </div>
            )}
          </div>
          
          <Button 
            onClick={() => {
              setPaymentSuccess(false);
              setDonationAmount(0);
              setProcessingFeeAmount(0);
              setDonorInfoData({});
              setDonorInfoValid(false);
              setPaymentInfoValid(false);
              setErrorMessage('');
              setCardErrors('');
            }}
            variant="outline"
            className="mt-6 bg-white hover:bg-green-50 text-green-700 border-green-300"
          >
            Make Another Donation
          </Button>
        </div>
      </div>
    );
  }

  const widgetContent = (
    <div className="donation-widget space-y-6 max-w-2xl mx-auto py-6">
      {/* Amount Selection Section */}
      <AmountSelector 
        initialAmount={initialAmount}
        onAmountChange={(amount, isCustom) => {
          setDonationAmount(amount);
          console.log('Amount selected:', amount, 'Custom:', isCustom);
        }} 
      />
      
      {/* Donation Type Section */}
      <DonationType onTypeChange={(type) => {
        setDonationType(type);
        console.log('Donation type selected:', type);
      }} />
      
      {/* Processing Fee Section */}
      <ProcessingFee 
        donationAmount={donationAmount}
        onFeeChange={(feeAmount, coverFee) => {
          setProcessingFeeAmount(feeAmount);
          setCoverProcessingFee(coverFee);
          console.log('Fee amount:', feeAmount, 'Cover fee:', coverFee);
        }}
      />
      
      {/* Donor Information Section - Now using shadcn/ui! */}
      <DonorInfo onValidationChange={(isValid, data) => {
        setDonorInfoValid(isValid);
        setDonorInfoData(data);
      }} />
      
      <div className="payment-section space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Payment Information</h3>
          <small className="text-muted-foreground">Secure payment powered by Stripe</small>
        </div>
        
        {/* Development mode test card info */}
        {(import.meta.env.DEV || window.location.hostname === 'localhost') && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start">
              <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Test Card Numbers:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center">
                    <CreditCard className="h-3 w-3 mr-1" />
                    <span className="font-mono">4242 4242 4242 4242</span>
                    <span className="ml-2 text-blue-600">(Success)</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-3 w-3 mr-1" />
                    <span className="font-mono">4000 0000 0000 0002</span>
                    <span className="ml-2 text-blue-600">(Decline)</span>
                  </div>
                  <p className="text-blue-600 mt-1">Use any future expiry date and any 3-digit CVC</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <div className="w-full rounded-md border border-input bg-transparent p-3 text-base shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring" ref={cardElementRef} />
          {cardErrors && (
            <div className="text-sm text-destructive mt-2" role="alert">
              {cardErrors}
            </div>
          )}
        </div>
      </div>
      
      {/* Total/Summary Section */}
      <div className="total-section space-y-4">
        <div className="bg-muted/50 rounded-md border p-4 space-y-3">
          <h3 className="text-lg font-semibold">Summary</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {donationType === 'monthly' ? 'Monthly donation' : 'One-time donation'}
              </span>
              <span className="font-medium">
                ${donationAmount > 0 ? donationAmount.toFixed(2) : '0.00'}
              </span>
            </div>
            
            {processingFeeAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Processing fee (helps cover costs)
                </span>
                <span className="font-medium">
                  ${processingFeeAmount.toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-semibold">
                Total {donationType === 'monthly' ? 'monthly' : ''}
              </span>
              <span className="font-bold text-lg">
                ${(donationAmount + processingFeeAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Error Display */}
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 text-center">
            <p className="text-sm text-destructive font-medium">{errorMessage}</p>
          </div>
        )}
        
        {/* Submit Button */}
        <Button 
          className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:hover:bg-gray-400"
          size="lg"
          disabled={!isFormValid || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            donationType === 'monthly' 
              ? `Donate $${(donationAmount + processingFeeAmount).toFixed(2)} Monthly`
              : `Donate $${(donationAmount + processingFeeAmount).toFixed(2)}`
          )}
        </Button>
        
        {/* Validation feedback */}
        {!isFormValid && (
          <div className="text-xs text-muted-foreground text-center space-y-1">
            {donationAmount === 0 && <div>• Please select a donation amount</div>}
            {!donorInfoValid && <div>• Please fill out all required donor information</div>}
            {!paymentInfoValid && <div>• Please enter valid payment information</div>}
          </div>
        )}
        
        {/* Stripe Badge */}
        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <span>Powered by</span>
          <img 
            src="/assets/Stripe_wordmark_-_slate.svg" 
            alt="Stripe" 
            className="opacity-80 h-5" 
          />
        </div>
      </div>
    </div>
  );
  
  // Full page version with logo, header, footer, etc.
  return (
    <div className="min-h-screen">
      <div className="donation-page max-w-xl mx-auto px-6">
        <div className="logo max-w-64 py-4 mx-auto">
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
          <div className="w-full text-center text-xs">{campaign.tagline}</div>
        </div>
        <div className="page-header py-4">
          <div className="prose prose-gray max-w-2xl">
            <ReactMarkdown
              components={{
                a: ({ href, children, ...props }) => {
                  // Check if it's an anchor link (starts with # or contains #)
                  if (href && (href.startsWith('#') || href.includes('#'))) {
                    return (
                      <AnchorLink href={href} {...props}>
                        {children}
                      </AnchorLink>
                    );
                  }
                  // Regular external/internal links
                  return <a href={href} {...props}>{children}</a>;
                },
              }}
            >
              {campaign.headerContent}
            </ReactMarkdown>
          </div>
        </div>
        {widgetContent}
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
    </div>
  );
}

export default DonationWidget;

