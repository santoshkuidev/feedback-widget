/**
 * Generates a unique session ID for the current browser session
 */
export const generateSessionId = (): string => {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
};

/**
 * Generates a persistent client ID that will be stored in localStorage
 */
export const generateClientId = (): string => {
  return 'client_' + Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15) + 
    Date.now().toString(36);
};
