import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  voiceAnnouncements: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string) => void;
  focusElement: (elementId: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReaderMode: false,
  keyboardNavigation: true,
  voiceAnnouncements: false
};

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    // Load saved accessibility settings
    const savedSettings = localStorage.getItem('accessibility_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }

    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (prefersReducedMotion || prefersHighContrast) {
      setSettings(prev => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast
      }));
    }

    // Listen for system preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  useEffect(() => {
    // Apply accessibility settings to document
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text mode
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Screen reader mode
    if (settings.screenReaderMode) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }

    // Save settings
    localStorage.setItem('accessibility_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const announceToScreenReader = (message: string) => {
    if (!settings.voiceAnnouncements && !settings.screenReaderMode) return;

    // Create or update live region for screen reader announcements
    let liveRegion = document.getElementById('sr-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'sr-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;
      document.body.appendChild(liveRegion);
    }

    // Clear and set new message
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion!.textContent = message;
    }, 100);

    // Voice announcement using Web Speech API
    if (settings.voiceAnnouncements && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Use Hindi voice if available for better local language support
      const voices = speechSynthesis.getVoices();
      const hindiVoice = voices.find(voice => voice.lang.startsWith('hi'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      
      // Announce focus change to screen readers
      const elementText = element.textContent || element.getAttribute('aria-label') || 'Element';
      announceToScreenReader(`Focused on ${elementText}`);
    }
  };

  // Add keyboard navigation event listeners
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip navigation for form inputs
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      switch (event.key) {
        case 'Tab':
          // Enhanced tab navigation with announcements
          setTimeout(() => {
            const focused = document.activeElement as HTMLElement;
            if (focused && focused !== document.body) {
              const label = focused.getAttribute('aria-label') || 
                           focused.textContent?.trim() || 
                           focused.tagName;
              announceToScreenReader(`Focused on ${label}`);
            }
          }, 50);
          break;

        case 'Escape':
          // Close modals, dropdowns, etc.
          const modal = document.querySelector('[role="dialog"]') as HTMLElement;
          if (modal) {
            const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement;
            if (closeButton) {
              closeButton.click();
              announceToScreenReader('Modal closed');
            }
          }
          break;

        case 'Enter':
        case ' ':
          // Activate buttons and links with space/enter
          if (target.getAttribute('role') === 'button' || target.tagName === 'BUTTON') {
            event.preventDefault();
            target.click();
          }
          break;

        case 'ArrowDown':
        case 'ArrowUp':
          // Navigate through lists and menus
          if (target.getAttribute('role') === 'menuitem' || target.closest('[role="menu"]')) {
            event.preventDefault();
            const items = Array.from(target.closest('[role="menu"]')?.querySelectorAll('[role="menuitem"]') || []);
            const currentIndex = items.indexOf(target);
            const nextIndex = event.key === 'ArrowDown' 
              ? Math.min(currentIndex + 1, items.length - 1)
              : Math.max(currentIndex - 1, 0);
            
            (items[nextIndex] as HTMLElement)?.focus();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation, announceToScreenReader]);

  return (
    <AccessibilityContext.Provider value={{
      settings,
      updateSettings,
      announceToScreenReader,
      focusElement
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// CSS classes for accessibility features
export const accessibilityStyles = `
  .high-contrast {
    filter: contrast(150%) brightness(110%);
  }
  
  .high-contrast button,
  .high-contrast .btn {
    border: 2px solid currentColor !important;
  }
  
  .large-text {
    font-size: 1.2em !important;
  }
  
  .large-text h1 { font-size: 2.4em !important; }
  .large-text h2 { font-size: 2em !important; }
  .large-text h3 { font-size: 1.6em !important; }
  .large-text p, .large-text span { font-size: 1.2em !important; }
  
  .reduced-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .screen-reader-mode .sr-only {
    position: static !important;
    width: auto !important;
    height: auto !important;
    padding: 0.5rem !important;
    margin: 0 !important;
    overflow: visible !important;
    clip: auto !important;
    white-space: normal !important;
    border: 1px solid #ccc !important;
    background: #f9f9f9 !important;
  }
  
  /* Focus indicators */
  *:focus {
    outline: 3px solid #4A90E2 !important;
    outline-offset: 2px !important;
  }
  
  /* Skip links */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 9999;
  }
  
  .skip-link:focus {
    top: 6px;
  }
`;

// Inject accessibility styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = accessibilityStyles;
  document.head.appendChild(styleElement);
}
