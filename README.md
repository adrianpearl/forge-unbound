# Political Campaign Donation Widget

A simple, embeddable donation widget built with Stripe Elements for political campaigns. Features donation amounts, recurring payments, and processing fee coverage similar to ActBlue and WinRed platforms.

## Features

- ✅ **Multiple donation amounts** - Preset buttons ($25, $50, $100, $250, $500, $1000) plus custom amount
- ✅ **One-time and monthly recurring donations** - Radio button selection
- ✅ **Processing fee coverage** - Checkbox to cover Stripe fees (2.9% + $0.30)
- ✅ **Secure payment processing** - Uses Stripe Elements for PCI compliance
- ✅ **Donor information collection** - Name, email, phone
- ✅ **Responsive design** - Works on desktop and mobile
- ✅ **Embeddable** - Can be embedded in any website via iframe
- ✅ **Customizable styling** - Colors and branding can be customized

## Quick Start

### 1. Prerequisites

- Node.js 14+ installed
- Stripe account with API keys
- Basic knowledge of HTML/JavaScript

### 2. Installation

```bash
# Clone or download the project
cd donation-widget

# Install dependencies
npm install

# Copy environment file and add your Stripe keys
cp .env.example .env
```

### 3. Configure Stripe Keys

Edit `.env` file and add your Stripe keys:

```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_RESTRICTED_KEY=rk_test_your_actual_restricted_key_here
```

### 4. Start the Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

The widget will be available at `http://localhost:3000`

## File Structure

```
donation-widget/
├── index.html          # Main widget page
├── css/
│   └── widget.css      # Widget styles
├── js/
│   └── widget.js       # Widget functionality
├── server.js           # Node.js server
├── embed.js            # Embeddable script
├── embed-example.html  # Example of embedding
├── package.json        # Dependencies
├── .env.example        # Environment variables template
└── README.md           # This file
```

## Usage

### Option 1: Standalone Widget

Visit `http://localhost:3000` to see the widget running standalone.

### Option 2: Embed in Another Website

Add this HTML to your webpage where you want the widget:

```html
<!-- Container for the widget -->
<div id="donation-widget-container"></div>

<!-- Configuration -->
<script>
window.DonationWidgetConfig = {
    serverUrl: 'https://your-donation-widget.com',
    stripeKey: 'pk_test_your_publishable_key',
    customization: {
        title: 'Support Our Campaign',
        subtitle: 'Every donation makes a difference',
        primaryColor: '#3b82f6',
        accentColor: '#059669'
    }
};
</script>

<!-- Load widget script -->
<script src="https://your-donation-widget.com/embed.js"></script>
```

### Option 3: Direct Integration

Include the CSS and JS files directly in your website:

```html
<link rel="stylesheet" href="css/widget.css">
<script src="https://js.stripe.com/v3/"></script>
<script>
window.STRIPE_PUBLISHABLE_KEY = 'pk_test_your_publishable_key';
</script>
<script src="js/widget.js"></script>
```

## Configuration Options

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_RESTRICTED_KEY` | Stripe restricted key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Webhook endpoint secret | No |
| `PORT` | Server port (default: 3000) | No |

### Widget Customization

```javascript
window.DonationWidgetConfig = {
    // Server URL where widget is hosted
    serverUrl: 'https://your-domain.com',
    
    // Your Stripe publishable key
    stripeKey: 'pk_test_...',
    
    // Visual customization
    customization: {
        title: 'Make a Donation',
        subtitle: 'Support our campaign',
        primaryColor: '#3b82f6',    // Main blue color
        accentColor: '#059669',     // Green accent for buttons
        variant: 'standalone'       // 'standalone' or 'embedded'
    },
    
    // Callback functions
    onSuccess: function(data) {
        console.log('Donation successful!', data);
    },
    
    onError: function(error) {
        console.error('Donation failed:', error);
    },
    
    // Container element ID
    containerId: 'donation-widget-container'
};
```

## Processing Fee Calculation

The widget calculates processing fees based on typical Stripe rates:
- **Rate**: 2.9% + $0.30 per transaction
- **Example**: $100 donation = $3.20 processing fee
- **Total**: $103.20 charged to donor (if fee coverage is enabled)

## Server API Endpoints

### POST `/api/create-payment-intent`

Creates a Stripe Payment Intent for processing donations.

**Request Body:**
```json
{
    "amount": 10000,
    "donationAmount": 10000,
    "processingFee": 320,
    "donationType": "one-time",
    "coverProcessingFee": true,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-0123"
}
```

**Response:**
```json
{
    "clientSecret": "pi_1234567890_secret_abcdef"
}
```

### POST `/webhook`

Stripe webhook endpoint for handling payment events.

### GET `/health`

Health check endpoint.

## Security Considerations

1. **API Keys**: Never expose secret keys in frontend code
2. **HTTPS**: Always use HTTPS in production
3. **Validation**: Server validates all input data
4. **PCI Compliance**: Stripe Elements handles sensitive card data
5. **CSRF Protection**: Consider adding CSRF tokens in production

## Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create new app
heroku create your-donation-widget

# Set environment variables
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_...
heroku config:set STRIPE_RESTRICTED_KEY=rk_live_...

# Deploy
git push heroku main
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Deploy to AWS/DigitalOcean

1. Set up a server with Node.js
2. Clone the repository
3. Install dependencies: `npm install`
4. Set environment variables
5. Use PM2 for process management: `pm2 start server.js`
6. Set up reverse proxy (nginx) for HTTPS

## Testing

### Test Cards (Stripe Test Mode)

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0000 0000 3220

Use any future expiration date and any 3-digit CVC.

### Manual Testing Checklist

- [ ] Amount selection works
- [ ] Custom amount input works
- [ ] One-time vs monthly toggle works
- [ ] Processing fee checkbox updates totals
- [ ] Form validation works
- [ ] Stripe card validation works
- [ ] Payment processing works
- [ ] Success/error handling works
- [ ] Mobile responsive design

## Customization

### Styling

Edit `css/widget.css` to customize the appearance:

```css
/* Change primary colors */
:root {
    --primary-color: #your-color;
    --accent-color: #your-accent-color;
}

/* Customize specific elements */
.donation-widget {
    border-radius: 8px; /* Less rounded corners */
}

.widget-header {
    background: linear-gradient(135deg, #your-color, #your-other-color);
}
```

### Adding Fields

To add custom fields (like occupation for political compliance):

1. Add HTML input in `index.html`
2. Add styling in `css/widget.css`
3. Update validation in `js/widget.js`
4. Handle the data in `server.js`

### Analytics Integration

Add tracking to the success callback:

```javascript
onSuccess: function(data) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'donation', {
            event_category: 'engagement',
            event_label: data.donationType,
            value: data.amount / 100
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Donate', {
            value: data.amount / 100,
            currency: 'USD'
        });
    }
}
```

## Legal Compliance

For political campaigns, ensure you:

1. **Collect required information** (name, address, occupation, employer)
2. **Set contribution limits** (federal: $3,500 per primary + $3,500 per general election)
3. **Handle prohibited contributors** (foreign nationals, corporations)
4. **File proper reports** with FEC or state agencies
5. **Store donation records** for required periods

## Support

For questions or issues:

1. Check this documentation
2. Review the code comments
3. Test with Stripe's test cards
4. Check Stripe's documentation
5. Open an issue in the repository

## License

MIT License - feel free to use and modify for your campaign needs.

---

**Note**: This is a basic implementation. For production campaigns, consider additional features like:
- Compliance fields (occupation, employer)
- Contribution limit checking
- Database storage
- Email receipts
- Admin dashboard
- A/B testing capabilities
