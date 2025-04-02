'use client';

import { useState, useEffect } from 'react';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);

    // Load announcement from system settings
    const loadAnnouncement = () => {
      try {
        const systemSettings = localStorage.getItem('systemSettings');
        
        if (systemSettings) {
          const settings = JSON.parse(systemSettings);
          if (settings.announcementBanner) {
            setAnnouncement(settings.announcementBanner);
          }
        }
      } catch (error) {
        console.error('Error loading announcement banner:', error);
      }
    };

    loadAnnouncement();
  }, []);

  // Don't render anything if no announcement or component is not mounted yet
  if (!announcement || !isMounted || !isVisible) {
    return null;
  }

  return (
    <div className="bg-blue-600 text-white py-3 px-4 relative">
      <div className="container mx-auto text-center">
        {announcement}
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200"
        aria-label="Close announcement"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
} 