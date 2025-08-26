# URL Parameter Pre-filling

The donation widget now supports pre-filling donation amounts via URL parameters. This is perfect for campaign emails, social media links, and targeted fundraising campaigns.

## How it Works

Add an `amount` parameter to your donation widget URL with the value in **cents** (not dollars).

### Examples:

#### Preset Button Selection
These URLs will automatically select the corresponding preset buttons:

```
http://localhost:3000?amount=2500   → Selects $25 button
http://localhost:3000?amount=5000   → Selects $50 button  
http://localhost:3000?amount=10000  → Selects $100 button
http://localhost:3000?amount=25000  → Selects $250 button
http://localhost:3000?amount=50000  → Selects $500 button
http://localhost:3000?amount=100000 → Selects $1,000 button
```

#### Custom Amount Pre-filling
These URLs will fill in the custom amount field:

```
http://localhost:3000?amount=1500   → Custom amount: $15.00
http://localhost:3000?amount=3000   → Custom amount: $30.00
http://localhost:3000?amount=7500   → Custom amount: $75.00
http://localhost:3000?amount=15000  → Custom amount: $150.00
```

## Campaign Use Cases

### 1. Email Campaigns
```html
<a href="https://donate.your-campaign.com?amount=5000">
  Donate $50 to support our campaign
</a>
```

### 2. Social Media Posts
```
🚨 URGENT: We need 100 donors to give $25 each by midnight!
👉 https://donate.your-campaign.com?amount=2500
```

### 3. Targeted Fundraising
```
Major donors: https://donate.your-campaign.com?amount=100000
Grassroots: https://donate.your-campaign.com?amount=2500
Students: https://donate.your-campaign.com?amount=1000
```

### 4. Event-Specific Donations
```
Dinner ticket: https://donate.your-campaign.com?amount=15000
VIP access: https://donate.your-campaign.com?amount=50000
```

## Technical Details

### Parameter Format
- **Parameter name**: `amount`
- **Value format**: Integer in cents (e.g., 2500 for $25.00)
- **Minimum**: 100 cents ($1.00)
- **Maximum**: No limit (but be reasonable!)

### How the Widget Handles Parameters

1. **Preset amounts**: If the amount matches one of the preset buttons ($25, $50, $100, $250, $500, $1000), that button will be automatically selected.

2. **Custom amounts**: If the amount doesn't match a preset button, it will be filled into the custom amount field.

3. **Invalid amounts**: Amounts less than $1.00 (100 cents) will be ignored with a console warning.

### Examples in Production

```javascript
// These would work in production:
https://your-donation-widget.com?amount=5000    // $50
https://your-donation-widget.com?amount=12500   // $125 (custom)
https://your-donation-widget.com?amount=100000  // $1,000
```

## Testing Locally

Try these URLs in your local development:

```bash
# Start your server
cd ~/Documents/donation-widget
npm start

# Then test these URLs:
http://localhost:3000?amount=5000   # Should select $50 button
http://localhost:3000?amount=3000   # Should show $30.00 in custom field
http://localhost:3000?amount=25000  # Should select $250 button
```

## Console Logging

The widget logs pre-filling activities to the browser console for debugging:

```javascript
// Successful preset selection:
"Pre-filling amount from URL: $50 (5000 cents)"
"Selected preset button: $50"

// Successful custom amount:
"Pre-filling amount from URL: $30 (3000 cents)"  
"Set custom amount: $30"

// Invalid amount:
"Invalid amount parameter: 50. Amount must be at least 100 cents ($1.00)"
```

## Security Notes

- The amount parameter only affects the initial display - all validation still happens on the server
- Users can still change the amount after the page loads
- No sensitive information is passed via URL parameters

## Multiple Parameters (Future Enhancement)

You could extend this feature to support other parameters:

```javascript
// Possible future enhancements:
?amount=5000&type=monthly     // Pre-select monthly donations
?amount=5000&fee=false        // Don't cover processing fees
?amount=5000&source=email     // Track donation source
```

This URL parameter feature makes it much easier to create targeted donation campaigns and track conversion rates from different sources!
