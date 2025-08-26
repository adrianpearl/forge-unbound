// Embeddable Donation Widget Script
// This script allows other websites to easily embed the donation widget

(function() {
    'use strict';
    
    // Configuration object that can be overridden
    window.DonationWidgetConfig = window.DonationWidgetConfig || {};
    
    const defaultConfig = {
        // Default widget server URL - replace with your actual domain
        serverUrl: 'https://your-donation-widget.com',
        
        // Stripe publishable key - this should be set by the embedder
        stripeKey: null,
        
        // Widget customization
        customization: {
            primaryColor: '#3b82f6',
            accentColor: '#059669',
            title: 'Make a Donation',
            subtitle: 'Support our campaign',
            // Can be 'embedded' to remove box shadow and border radius
            variant: 'embedded' // or 'standalone'
        },
        
        // Optional callback functions
        onSuccess: null,
        onError: null,
        
        // Container element ID where widget should be mounted
        containerId: 'donation-widget-container'
    };
    
    // Merge user config with defaults
    const config = Object.assign({}, defaultConfig, window.DonationWidgetConfig);
    
    function loadWidget() {
        const container = document.getElementById(config.containerId);
        
        if (!container) {
            console.error(`Donation Widget: Container element with ID "${config.containerId}" not found`);
            return;
        }
        
        // Create iframe for security and isolation
        const iframe = document.createElement('iframe');
        iframe.src = `${config.serverUrl}?embedded=true`;
        iframe.style.width = '100%';
        iframe.style.height = '800px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = config.customization.variant === 'embedded' ? '0' : '12px';
        iframe.style.boxShadow = config.customization.variant === 'embedded' ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.1)';
        iframe.setAttribute('allowtransparency', 'true');
        iframe.setAttribute('scrolling', 'no');
        
        // Set up message listener for iframe communication
        window.addEventListener('message', function(event) {
            if (event.origin !== config.serverUrl) return;
            
            const data = event.data;
            
            switch (data.type) {
                case 'donation_success':
                    if (config.onSuccess) {
                        config.onSuccess(data.payload);
                    }
                    break;
                    
                case 'donation_error':
                    if (config.onError) {
                        config.onError(data.payload);
                    }
                    break;
                    
                case 'widget_resize':
                    iframe.style.height = data.height + 'px';
                    break;
            }
        });
        
        // Send configuration to iframe once loaded
        iframe.onload = function() {
            iframe.contentWindow.postMessage({
                type: 'config',
                config: {
                    stripeKey: config.stripeKey,
                    customization: config.customization
                }
            }, config.serverUrl);
        };
        
        container.appendChild(iframe);
    }
    
    // Load widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadWidget);
    } else {
        loadWidget();
    }
    
})();
