import React from 'react';
import { createRoot } from 'react-dom/client';
import FeedbackWidget from './components/FeedbackWidget';
import { WidgetConfig } from './types';

// Default configuration
const defaultConfig: WidgetConfig = {
  apiUrl: 'https://api.example.com', // Will be replaced with actual API URL
  triggerProbability: 0.1, // 10% of users
  triggerDelay: 30000, // 30 seconds
  theme: {
    primaryColor: '#4a6cf7',
    textColor: '#333333',
    backgroundColor: '#ffffff',
    starColor: '#ffc107',
    darkMode: false,
  },
  companyName: 'Your Company',
  companyLogo: '',
  position: 'bottom-right',
};

// Main initialization function
const init = (userConfig: Partial<WidgetConfig> = {}) => {
  // Merge user config with default config
  const config = { ...defaultConfig, ...userConfig };
  
  // Create container element if it doesn't exist
  let container = document.getElementById('feedback-widget-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'feedback-widget-root';
    document.body.appendChild(container);
  }
  
  // Render the widget
  const root = createRoot(container);
  root.render(<FeedbackWidget config={config} />);
  
  return {
    // Public API
    open: () => {
      const event = new CustomEvent('feedback-widget:open');
      document.dispatchEvent(event);
    },
    close: () => {
      const event = new CustomEvent('feedback-widget:close');
      document.dispatchEvent(event);
    },
    setConfig: (newConfig: Partial<WidgetConfig>) => {
      const event = new CustomEvent('feedback-widget:config', { 
        detail: newConfig 
      });
      document.dispatchEvent(event);
    }
  };
};

// Auto-initialize if script has data-auto-init attribute
const script = document.currentScript as HTMLScriptElement;
if (script && script.dataset.autoInit !== undefined) {
  // Parse configuration from data attributes
  const config: Partial<WidgetConfig> = {};
  
  if (script.dataset.apiUrl) config.apiUrl = script.dataset.apiUrl;
  if (script.dataset.probability) config.triggerProbability = parseFloat(script.dataset.probability);
  if (script.dataset.delay) config.triggerDelay = parseInt(script.dataset.delay, 10);
  if (script.dataset.companyName) config.companyName = script.dataset.companyName;
  if (script.dataset.companyLogo) config.companyLogo = script.dataset.companyLogo;
  if (script.dataset.position) config.position = script.dataset.position as any;
  
  // Theme configuration
  if (script.dataset.primaryColor || script.dataset.darkMode) {
    config.theme = { ...defaultConfig.theme };
    if (script.dataset.primaryColor) config.theme.primaryColor = script.dataset.primaryColor;
    if (script.dataset.darkMode) config.theme.darkMode = script.dataset.darkMode === 'true';
  }
  
  // Initialize with parsed config
  init(config);
}

// Export for manual initialization
export default init;

// For UMD build
if (typeof window !== 'undefined') {
  (window as any).FeedbackWidget = { init };
}
