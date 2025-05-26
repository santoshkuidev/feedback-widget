export interface WidgetTheme {
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  starColor: string;
  darkMode: boolean;
}

export type WidgetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface WidgetConfig {
  apiUrl: string;
  triggerProbability: number;
  triggerDelay: number;
  theme: WidgetTheme;
  companyName: string;
  companyLogo: string;
  position: WidgetPosition;
}

export interface FeedbackData {
  rating: number;
  comment: string;
  email?: string;
  metadata: {
    url: string;
    userAgent: string;
    timestamp: number;
    referrer: string;
    sessionId: string;
    clientId: string;
  };
}
