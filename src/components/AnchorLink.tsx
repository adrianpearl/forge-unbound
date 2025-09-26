import React from 'react';
import { useScrollToAnchor } from '@/hooks/useScrollToAnchor';

interface AnchorLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  offset?: number;
}

/**
 * Smart anchor link component that handles both same-page and cross-page navigation
 * Automatically detects if the link is to the same page or needs navigation
 */
export function AnchorLink({ href, children, className, offset }: AnchorLinkProps) {
  const scrollToAnchor = useScrollToAnchor();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Parse the href to extract path and anchor
    const url = new URL(href, window.location.origin);
    const anchorId = url.hash.substring(1); // Remove the #
    const targetPath = url.pathname;
    
    if (anchorId) {
      scrollToAnchor(anchorId, targetPath, offset);
    }
  };

  return (
    <a 
      href={href} 
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
