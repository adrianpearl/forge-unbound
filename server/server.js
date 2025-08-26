// Simple Node.js server for donation widget
// This is a basic example - in production, you'd want more robust error handling, validation, and security

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Stripe with your secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Serve the widget
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// API endpoint to create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const {
            amount,
            donationAmount,
            processingFee,
            donationType,
            coverProcessingFee,
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            state,
            zip,
            occupation,
            employer
        } = req.body;

        // Validate required fields
        if (!amount || amount < 50) { // Minimum $0.50
            return res.status(400).json({ error: 'Invalid amount' });
        }

        if (!firstName || !lastName || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create customer (optional - helps with tracking)
        const customer = await stripe.customers.create({
            name: `${firstName} ${lastName}`,
            email: email,
            phone: phone || undefined,
            metadata: {
                donation_type: donationType,
                cover_processing_fee: coverProcessingFee.toString(),
                donation_amount: donationAmount.toString(),
                processing_fee: processingFee.toString(),
                address: address || '',
                city: city || '',
                state: state || '',
                zip: zip || '',
                occupation: occupation || '',
                employer: employer || ''
            }
        });

        // Create payment intent
        const paymentIntentData = {
            amount: amount, // Amount in cents
            currency: 'usd',
            customer: customer.id,
            metadata: {
                donation_type: donationType,
                cover_processing_fee: coverProcessingFee.toString(),
                donation_amount: donationAmount.toString(),
                processing_fee: processingFee.toString(),
                donor_name: `${firstName} ${lastName}`,
                donor_email: email
            },
            description: `Donation from ${firstName} ${lastName}`,
            receipt_email: email,
            // For test mode, you might want to set this
            // confirm: true,
            // return_url: 'https://your-site.com/donation-success'
        };

        // If monthly donation, create a subscription instead
        if (donationType === 'monthly') {
            // Create a product for the donation
            const product = await stripe.products.create({
                name: 'Monthly Donation',
                metadata: {
                    donor_name: `${firstName} ${lastName}`,
                    donor_email: email
                }
            });

            // Create a price for the product
            const price = await stripe.prices.create({
                unit_amount: amount,
                currency: 'usd',
                recurring: { interval: 'month' },
                product: product.id,
            });

            // Create a subscription
            const subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: price.id }],
                payment_behavior: 'default_incomplete',
                expand: ['latest_invoice.payment_intent'],
            });

            res.json({
                subscriptionId: subscription.id,
                clientSecret: subscription.latest_invoice.payment_intent.client_secret
            });

        } else {
            // One-time payment
            const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

            res.json({
                clientSecret: paymentIntent.client_secret
            });
        }

    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook endpoint for Stripe events (optional but recommended)
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
        console.warn('Webhook secret not configured');
        return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('💰 Payment succeeded:', paymentIntent.id);
            // Handle successful payment (e.g., send confirmation email, update database)
            break;

        case 'payment_intent.payment_failed':
            console.log('❌ Payment failed:', event.data.object.id);
            break;

        case 'customer.subscription.created':
            console.log('🔄 Subscription created:', event.data.object.id);
            break;

        case 'invoice.payment_succeeded':
            console.log('📧 Recurring payment succeeded:', event.data.object.id);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Donation widget server running at http://localhost:${port}`);
    console.log(`📝 Widget available at http://localhost:${port}`);
    
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_dummy_secret_key_replace_with_real_key') {
        console.warn('⚠️  Warning: Using dummy Stripe secret key. Set STRIPE_SECRET_KEY environment variable.');
    }
    
    if (!process.env.STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY === 'pk_test_dummy_key_replace_with_real_key') {
        console.warn('⚠️  Warning: Using dummy Stripe publishable key. Set STRIPE_PUBLISHABLE_KEY environment variable.');
    }
});
