// Donation Widget JavaScript
class DonationWidget {
    constructor() {
        // Get Stripe publishable key from environment or use dummy key
        this.stripePublishableKey = window.STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_key_replace_with_real_key';
        this.stripe = null;
        this.elements = null;
        this.card = null;
        
        // State
        this.selectedAmount = 0;
        this.customAmount = 0;
        this.donationType = 'one-time';
        this.coverProcessingFee = true;
        this.processingFeeAmount = 0;
        this.totalAmount = 0;
        
        // Card validation state
        this.cardComplete = false;
        this.cardEmpty = true;
        
        // Processing fee calculation (typical rates: 2.9% + $0.30)
        this.processingFeeRate = 0.029;
        this.processingFeeFixed = 0.30;
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize Stripe
            this.stripe = Stripe(this.stripePublishableKey);
            this.elements = this.stripe.elements();
            
            // Setup Stripe Elements
            this.setupStripeElements();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Handle URL parameters for pre-filling amounts
            this.handleUrlParameters();
            
            // Initial calculations
            this.updateTotals();
            
        } catch (error) {
            console.error('Error initializing donation widget:', error);
            this.showError('Failed to initialize payment system. Please refresh and try again.');
        }
    }
    
    setupStripeElements() {
        // Create card element
        this.card = this.elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#374151',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    '::placeholder': {
                        color: '#9ca3af',
                    },
                },
                invalid: {
                    color: '#dc2626',
                },
            },
        });
        
        // Mount card element
        this.card.mount('#card-element');
        
        // Handle card changes
        this.card.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            
            // Update card validation state
            this.cardComplete = event.complete;
            this.cardEmpty = event.empty;
            
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
            
            // Optional: Enable debug logging for development
            // console.log('Card state:', {
            //     complete: event.complete,
            //     empty: event.empty,
            //     error: event.error?.message || null
            // });
            
            this.updateDonateButton();
        });
    }
    
    setupEventListeners() {
        // Amount buttons
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectAmount(btn);
            });
        });
        
        // Custom amount input
        const customAmountInput = document.getElementById('custom-amount-input');
        customAmountInput.addEventListener('input', () => {
            this.handleCustomAmount();
        });
        
        customAmountInput.addEventListener('focus', () => {
            this.clearSelectedAmountButtons();
        });
        
        // Donation type radio buttons
        document.querySelectorAll('input[name="donation-type"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.donationType = radio.value;
                this.updateDonateButton();
            });
        });
        
        // Processing fee checkbox
        document.getElementById('cover-processing-fee').addEventListener('change', (e) => {
            this.coverProcessingFee = e.target.checked;
            this.updateTotals();
        });
        
        // Form inputs for validation
        document.querySelectorAll('input[required], select[required]').forEach(input => {
            input.addEventListener('input', () => {
                this.updateDonateButton();
            });
            input.addEventListener('change', () => {
                this.updateDonateButton();
            });
        });
        
        // Form submission
        document.getElementById('donation-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }
    
    selectAmount(button) {
        // Clear other selections
        this.clearSelectedAmountButtons();
        document.getElementById('custom-amount-input').value = '';
        this.customAmount = 0;
        
        // Select this button
        button.classList.add('selected');
        this.selectedAmount = parseFloat(button.dataset.amount);
        
        this.updateTotals();
    }
    
    handleCustomAmount() {
        const input = document.getElementById('custom-amount-input');
        const value = parseFloat(input.value) || 0;
        
        if (value > 0) {
            this.clearSelectedAmountButtons();
            this.selectedAmount = 0;
            this.customAmount = value;
        } else {
            this.customAmount = 0;
        }
        
        this.updateTotals();
    }
    
    clearSelectedAmountButtons() {
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }
    
    handleUrlParameters() {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const amountParam = urlParams.get('amount');
        
        if (amountParam) {
            // Convert from cents to dollars
            const amountInCents = parseInt(amountParam);
            const amountInDollars = amountInCents / 100;
            
            // Validate the amount
            if (amountInCents > 0 && amountInDollars >= 1) {
                console.log(`Pre-filling amount from URL: $${amountInDollars} (${amountInCents} cents)`);
                
                // Check if this amount matches any preset buttons
                const presetAmounts = [25, 50, 100, 250, 500, 1000];
                
                if (presetAmounts.includes(amountInDollars)) {
                    // Select the matching preset button
                    const matchingButton = document.querySelector(`[data-amount="${amountInDollars}"]`);
                    if (matchingButton) {
                        this.selectAmount(matchingButton);
                        console.log(`Selected preset button: $${amountInDollars}`);
                    }
                } else {
                    // Use custom amount
                    this.clearSelectedAmountButtons();
                    this.selectedAmount = 0;
                    this.customAmount = amountInDollars;
                    
                    // Fill in the custom amount input
                    const customAmountInput = document.getElementById('custom-amount-input');
                    customAmountInput.value = amountInDollars.toFixed(2);
                    
                    console.log(`Set custom amount: $${amountInDollars}`);
                }
            } else {
                console.warn(`Invalid amount parameter: ${amountParam}. Amount must be at least 100 cents ($1.00)`);
            }
        }
    }
    
    calculateProcessingFee(amount) {
        if (amount <= 0) return 0;
        return Math.round((amount * this.processingFeeRate + this.processingFeeFixed) * 100) / 100;
    }
    
    updateTotals() {
        const baseAmount = this.selectedAmount || this.customAmount || 0;
        
        if (this.coverProcessingFee && baseAmount > 0) {
            // Calculate fee on base amount
            this.processingFeeAmount = this.calculateProcessingFee(baseAmount);
        } else {
            this.processingFeeAmount = 0;
        }
        
        this.totalAmount = baseAmount + this.processingFeeAmount;
        
        // Update display
        document.getElementById('donation-amount-display').textContent = this.formatCurrency(baseAmount);
        document.getElementById('processing-fee-display').textContent = this.formatCurrency(this.processingFeeAmount);
        document.getElementById('total-amount-display').textContent = this.formatCurrency(this.totalAmount);
        
        // Update fee amount in checkbox label
        document.querySelector('.fee-amount').textContent = `(${this.formatCurrency(this.processingFeeAmount)})`;
        
        // Show/hide fee breakdown
        const feeBreakdown = document.getElementById('fee-breakdown');
        if (this.coverProcessingFee && this.processingFeeAmount > 0) {
            feeBreakdown.style.display = 'flex';
        } else {
            feeBreakdown.style.display = 'none';
        }
        
        this.updateDonateButton();
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    }
    
    updateDonateButton() {
        const button = document.getElementById('donate-button');
        const buttonText = document.getElementById('button-text');
        
        const hasAmount = this.totalAmount > 0;
        const hasValidCard = this.cardComplete && !this.cardEmpty;
        const hasRequiredFields = this.validateRequiredFields();
        
        const isValid = hasAmount && hasValidCard && hasRequiredFields;
        
        // Optional: Enable debug logging for development
        // console.log('Button state:', {
        //     hasAmount,
        //     hasValidCard,
        //     hasRequiredFields,
        //     isValid,
        //     cardComplete: this.cardComplete,
        //     cardEmpty: this.cardEmpty
        // });
        
        button.disabled = !isValid;
        
        // Update button text
        if (hasAmount) {
            const typeText = this.donationType === 'monthly' ? 'monthly' : 'now';
            buttonText.textContent = `Donate ${this.formatCurrency(this.totalAmount)} ${typeText}`;
        } else {
            buttonText.textContent = 'Enter amount to donate';
        }
    }
    
    validateRequiredFields() {
        const requiredFields = ['first-name', 'last-name', 'email', 'address', 'city', 'state', 'zip', 'occupation', 'employer'];
        return requiredFields.every(fieldId => {
            const field = document.getElementById(fieldId);
            return field.value.trim() !== '';
        });
    }
    
    async handleSubmit() {
        if (this.totalAmount <= 0) {
            this.showError('Please select a donation amount.');
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Get form data
            const formData = this.getFormData();
            
            // Create payment intent on your server
            const { clientSecret } = await this.createPaymentIntent(formData);
            
            // Confirm payment with Stripe
            const result = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: this.card,
                    billing_details: {
                        name: `${formData.firstName} ${formData.lastName}`,
                        email: formData.email,
                        phone: formData.phone || undefined,
                    },
                },
            });
            
            if (result.error) {
                this.showError(result.error.message);
                this.setLoadingState(false);
            } else {
                // Payment succeeded
                this.showSuccess();
            }
            
        } catch (error) {
            console.error('Payment error:', error);
            this.showError('Payment failed. Please try again.');
            this.setLoadingState(false);
        }
    }
    
    getFormData() {
        return {
            firstName: document.getElementById('first-name').value.trim(),
            lastName: document.getElementById('last-name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            state: document.getElementById('state').value.trim(),
            zip: document.getElementById('zip').value.trim(),
            occupation: document.getElementById('occupation').value.trim(),
            employer: document.getElementById('employer').value.trim(),
            amount: Math.round(this.totalAmount * 100), // Convert to cents
            donationAmount: Math.round((this.selectedAmount || this.customAmount) * 100),
            processingFee: Math.round(this.processingFeeAmount * 100),
            donationType: this.donationType,
            coverProcessingFee: this.coverProcessingFee,
        };
    }
    
    async createPaymentIntent(formData) {
        // This is a mock implementation - replace with actual server endpoint
        // In a real implementation, you would call your server to create a PaymentIntent
        
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
            throw new Error('Failed to create payment intent');
        }
        
        return await response.json();
    }
    
    setLoadingState(loading) {
        const button = document.getElementById('donate-button');
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('spinner');
        
        if (loading) {
            button.disabled = true;
            buttonText.style.opacity = '0';
            spinner.style.display = 'block';
        } else {
            this.updateDonateButton(); // This will set the correct disabled state
            buttonText.style.opacity = '1';
            spinner.style.display = 'none';
        }
    }
    
    showSuccess() {
        const form = document.getElementById('donation-form');
        const successMessage = document.getElementById('success-message');
        
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Optional: Track the donation for analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'donation', {
                'event_category': 'engagement',
                'event_label': this.donationType,
                'value': this.totalAmount
            });
        }
    }
    
    showError(message) {
        // You can customize this to show errors in a more user-friendly way
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = message;
        
        // Scroll to error
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Initialize widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if Stripe key is provided
    if (!window.STRIPE_PUBLISHABLE_KEY) {
        console.warn('STRIPE_PUBLISHABLE_KEY not found. Using dummy key. Set window.STRIPE_PUBLISHABLE_KEY to use real Stripe integration.');
    }
    
    new DonationWidget();
});

// Export for embedding
window.DonationWidget = DonationWidget;
