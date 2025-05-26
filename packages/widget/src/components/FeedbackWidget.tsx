import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { WidgetConfig, FeedbackData } from '../types';
import FeedbackButton from './FeedbackButton';
import FeedbackForm from './FeedbackForm';
import FeedbackSuccess from './FeedbackSuccess';
import { generateSessionId, generateClientId } from '../utils/identity';

interface FeedbackWidgetProps {
  config: WidgetConfig;
}

type WidgetState = 'hidden' | 'button' | 'form' | 'success';

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ config }) => {
  const [state, setState] = useState<WidgetState>('hidden');
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(config);
  const [sessionId] = useState<string>(generateSessionId());
  const [clientId] = useState<string>(() => {
    const existingId = localStorage.getItem('feedback_client_id');
    if (existingId) return existingId;
    
    const newId = generateClientId();
    localStorage.setItem('feedback_client_id', newId);
    return newId;
  });
  
  // Handle configuration updates
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      setWidgetConfig(prevConfig => ({ ...prevConfig, ...event.detail }));
    };
    
    document.addEventListener('feedback-widget:config', 
      handleConfigUpdate as EventListener);
    
    return () => {
      document.removeEventListener('feedback-widget:config', 
        handleConfigUpdate as EventListener);
    };
  }, []);
  
  // Handle open/close events
  useEffect(() => {
    const handleOpen = () => {
      setState('form');
    };
    
    const handleClose = () => {
      setState('button');
    };
    
    document.addEventListener('feedback-widget:open', handleOpen);
    document.addEventListener('feedback-widget:close', handleClose);
    
    return () => {
      document.removeEventListener('feedback-widget:open', handleOpen);
      document.removeEventListener('feedback-widget:close', handleClose);
    };
  }, []);
  
  // Random trigger based on probability and delay
  useEffect(() => {
    // Check if user has already submitted feedback in this session
    const hasSubmitted = sessionStorage.getItem('feedback_submitted');
    if (hasSubmitted) return;
    
    // Random probability check
    const shouldTrigger = Math.random() < widgetConfig.triggerProbability;
    if (!shouldTrigger) return;
    
    // Delay before showing
    const timer = setTimeout(() => {
      setState('button');
    }, widgetConfig.triggerDelay);
    
    return () => clearTimeout(timer);
  }, [widgetConfig.triggerProbability, widgetConfig.triggerDelay]);
  
  const handleButtonClick = () => {
    setState('form');
  };
  
  const handleClose = () => {
    setState('button');
  };
  
  const handleSubmit = async (data: Omit<FeedbackData, 'metadata'>) => {
    try {
      // Add metadata
      const feedbackData: FeedbackData = {
        ...data,
        metadata: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          referrer: document.referrer,
          sessionId,
          clientId,
        }
      };
      
      // Submit to API
      const response = await fetch(`${widgetConfig.apiUrl}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      // Mark as submitted for this session
      sessionStorage.setItem('feedback_submitted', 'true');
      
      // Show success state
      setState('success');
      
      // Hide after 5 seconds
      setTimeout(() => {
        setState('button');
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };
  
  // Create theme object for styled-components
  const theme = {
    ...widgetConfig.theme,
    position: widgetConfig.position,
  };
  
  if (state === 'hidden') {
    return null;
  }
  
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <WidgetContainer position={widgetConfig.position}>
        {state === 'button' && (
          <FeedbackButton 
            onClick={handleButtonClick} 
            companyName={widgetConfig.companyName}
          />
        )}
        
        {state === 'form' && (
          <FeedbackForm 
            onSubmit={handleSubmit} 
            onClose={handleClose} 
            companyName={widgetConfig.companyName}
            companyLogo={widgetConfig.companyLogo}
          />
        )}
        
        {state === 'success' && (
          <FeedbackSuccess 
            companyName={widgetConfig.companyName}
          />
        )}
      </WidgetContainer>
    </ThemeProvider>
  );
};

const GlobalStyles = createGlobalStyle`
  #feedback-widget-root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: ${(props) => props.theme.textColor};
  }
`;

const WidgetContainer = styled.div<{ position: string }>`
  position: fixed;
  z-index: 9999;
  
  ${(props) => {
    switch (props.position) {
      case 'bottom-right':
        return 'bottom: 20px; right: 20px;';
      case 'bottom-left':
        return 'bottom: 20px; left: 20px;';
      case 'top-right':
        return 'top: 20px; right: 20px;';
      case 'top-left':
        return 'top: 20px; left: 20px;';
      default:
        return 'bottom: 20px; right: 20px;';
    }
  }}
`;

export default FeedbackWidget;
