import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for handling smooth scrolling to anchor elements
 * Supports both same-page and cross-page navigation
 */
export function useScrollToAnchor() {
  const navigate = useNavigate();

  const scrollToAnchor = useCallback((
    anchorId: string, 
    targetPath?: string, 
    offset: number = 80 // Default offset for headers
  ) => {
    const currentPath = window.location.pathname;
    
    if (targetPath && targetPath !== currentPath) {
      // Cross-page navigation: navigate first, then scroll
      navigate(targetPath);
      
      // Small delay to ensure the new page has rendered
      setTimeout(() => {
        const element = document.getElementById(anchorId);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - offset,
            behavior: 'smooth',
          });
          
          // Update the URL to include the anchor hash
          window.history.replaceState(null, '', `${targetPath}#${anchorId}`);
        }
      }, 100);
    } else {
      // Same-page navigation: scroll directly
      const element = document.getElementById(anchorId);
      if (element) {
        window.scrollTo({
          top: element.offsetTop - offset,
          behavior: 'smooth',
        });
        
        // Update the URL to include the anchor hash
        window.history.replaceState(null, '', `${currentPath}#${anchorId}`);
      }
    }
  }, [navigate]);

  return scrollToAnchor;
}
