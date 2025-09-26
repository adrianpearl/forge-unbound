import { Component } from 'react';

/**
 * Handles scrolling to anchor elements when the app loads with a hash in the URL
 * This only handles initial page load - click navigation is handled by AnchorLink components
 */
export class InitialAnchorScroll extends Component {
  componentDidMount() {
    // Check if there's a hash in the URL on initial load
    const hash = window.location.hash;
    
    if (hash) {
      const anchorId = hash.substring(1); // Remove the #
      
      // Use a timeout to ensure the DOM has fully rendered
      setTimeout(() => {
        const element = document.getElementById(anchorId);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 80, // Account for any headers
            behavior: 'smooth',
          });
        }
      }, 150); // Delay for initial page load
    }
  }

  render() {
    return null; // This component doesn't render anything
  }
}
