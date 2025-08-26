# Single Deployment Guide for Donation Widget

Since your widget requires both frontend and backend, here are the best platforms for single full-stack deployment:

## Option 1: Railway (Recommended - Easiest)

Railway is perfect for full-stack Node.js apps with automatic deployments.

### Setup Steps:

1. **Sign up at [railway.app](https://railway.app)**

2. **Connect your GitHub repository:**
   ```bash
   cd ~/Documents/donation-widget
   git init
   git add .
   git commit -m "Initial commit"
   
   # Create GitHub repository and push
   gh repo create donation-widget --public
   git push origin main
   ```

3. **Deploy on Railway:**
   - Click "New Project" → "Deploy from GitHub"
   - Select your donation-widget repository
   - Railway auto-detects it's a Node.js app

4. **Set environment variables in Railway dashboard:**
   - `STRIPE_PUBLISHABLE_KEY=pk_live_your_key`
   - `STRIPE_SECRET_KEY=sk_live_your_secret_key`
   - `NODE_ENV=production`

5. **Your app will be live at:** `https://donation-widget-production.up.railway.app`

**Cost:** Free tier includes $5/month credit, then $0.000463 per GB-hour

## Option 2: Render (Great Alternative)

Similar to Railway but with different pricing model.

### Setup Steps:

1. **Sign up at [render.com](https://render.com)**

2. **Create a new Web Service:**
   - Connect your GitHub repository
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set environment variables:**
   - Add your Stripe keys in the Render dashboard

**Cost:** Free tier available, $7/month for production apps

## Option 3: Heroku (Classic Choice)

### Setup Steps:

1. **Install Heroku CLI:**
   ```bash
   # On Fedora
   sudo dnf install heroku
   ```

2. **Deploy:**
   ```bash
   cd ~/Documents/donation-widget
   
   # Create Procfile if not exists
   echo "web: node server/server.js" > Procfile
   
   # Login and create app
   heroku login
   heroku create your-donation-widget
   
   # Set environment variables
   heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   heroku config:set STRIPE_SECRET_KEY=sk_live_your_secret_key
   heroku config:set NODE_ENV=production
   
   # Deploy
   git push heroku main
   ```

**Cost:** $5-7/month for basic dyno

## Option 4: DigitalOcean App Platform

### Setup Steps:

1. **Create app.yaml:**
   ```bash
   cd ~/Documents/donation-widget
   mkdir .do
   cat > .do/app.yaml << 'EOF'
   name: donation-widget
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/donation-widget
       branch: main
       deploy_on_push: true
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: STRIPE_PUBLISHABLE_KEY
       scope: RUN_TIME
       type: SECRET
     - key: STRIPE_SECRET_KEY
       scope: RUN_TIME
       type: SECRET
     - key: NODE_ENV
       scope: RUN_TIME
       value: production
   EOF
   ```

2. **Deploy via DigitalOcean dashboard or CLI**

**Cost:** $5/month for basic app

## Option 5: Vercel (Serverless)

Vercel can host both frontend and API routes as serverless functions.

### Restructure for Vercel:

1. **Move server code to API routes:**
   ```bash
   cd ~/Documents/donation-widget
   mkdir -p api
   ```

2. **Create API route file:**
   ```bash
   cat > api/create-payment-intent.js << 'EOF'
   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

   export default async function handler(req, res) {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }

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
       if (!amount || amount < 50) {
         return res.status(400).json({ error: 'Invalid amount' });
       }

       if (!firstName || !lastName || !email) {
         return res.status(400).json({ error: 'Missing required fields' });
       }

       // Create customer
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

       if (donationType === 'monthly') {
         // Create subscription
         const product = await stripe.products.create({
           name: 'Monthly Donation',
           metadata: {
             donor_name: `${firstName} ${lastName}`,
             donor_email: email
           }
         });

         const price = await stripe.prices.create({
           unit_amount: amount,
           currency: 'usd',
           recurring: { interval: 'month' },
           product: product.id,
         });

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
         const paymentIntent = await stripe.paymentIntents.create({
           amount: amount,
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
         });

         res.json({
           clientSecret: paymentIntent.client_secret
         });
       }
     } catch (error) {
       console.error('Error creating payment intent:', error);
       res.status(500).json({ error: error.message });
     }
   }
   EOF
   ```

3. **Create package.json for Vercel:**
   ```bash
   cat > package.json << 'EOF'
   {
     "name": "donation-widget",
     "version": "1.0.0",
     "dependencies": {
       "stripe": "^14.9.0"
     }
   }
   EOF
   ```

4. **Deploy:**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   
   # Set environment variables
   vercel env add STRIPE_PUBLISHABLE_KEY
   vercel env add STRIPE_SECRET_KEY
   
   # Deploy to production
   vercel --prod
   ```

**Cost:** Free tier very generous, scales automatically

## Quick Start: Railway Deployment (Recommended)

Here's the fastest way to get your widget deployed:

1. **Prepare your code:**
   ```bash
   cd ~/Documents/donation-widget
   
   # Make sure package.json has correct start script
   # (Already configured correctly)
   
   # Initialize git
   git init
   git add .
   git commit -m "Initial donation widget"
   ```

2. **Push to GitHub:**
   ```bash
   # Install GitHub CLI if not already installed
   sudo dnf install gh
   
   # Authenticate and create repository
   gh auth login
   gh repo create donation-widget --public
   git push origin main
   ```

3. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Sign up/login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your donation-widget repository
   - Wait for deployment (2-3 minutes)

4. **Add environment variables:**
   - In Railway dashboard, go to Variables tab
   - Add:
     - `STRIPE_PUBLISHABLE_KEY` = your publishable key
     - `STRIPE_SECRET_KEY` = your secret key
     - `NODE_ENV` = production

5. **Your widget is live!**
   - Railway will give you a URL like `https://donation-widget-production.up.railway.app`
   - Test it with Stripe test cards first

## Custom Domain Setup

For any platform, you can add a custom domain:

1. **Add domain in platform dashboard**
2. **Update your DNS:**
   ```
   Type: CNAME
   Name: donate (for donate.your-campaign.com)
   Value: your-app-url (provided by platform)
   ```

## Security Checklist

Before going live:

- [ ] Use HTTPS (all platforms provide this automatically)
- [ ] Use production Stripe keys (pk_live_ and sk_live_)
- [ ] Test with real credit cards in small amounts
- [ ] Set up Stripe webhooks for payment confirmations
- [ ] Monitor error logs in your platform dashboard
- [ ] Test on mobile devices
- [ ] Verify all FEC compliance fields are collected

## Platform Comparison

| Platform | Cost | Setup Difficulty | Auto-scaling | Custom Domain |
|----------|------|------------------|--------------|---------------|
| Railway  | $5/mo after free credits | Easy | Yes | Yes |
| Render   | Free/$7/mo | Easy | Yes | Yes |
| Heroku   | $7/mo | Medium | Manual | Yes |
| Vercel   | Free/Pay-per-use | Medium | Yes | Yes |
| DigitalOcean | $5/mo | Medium | Manual | Yes |

**Recommendation:** Start with Railway for the easiest deployment experience.
