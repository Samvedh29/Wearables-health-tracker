import { useState, useCallback, useEffect } from 'react';

const GEMINI_KEY_STORAGE_KEY = 'ow_gemini_api_key';

export function useGeminiKey() {
  const [apiKey, setApiKeyState] = useState<string>('');
  
  // Read from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(GEMINI_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKeyState(storedKey);
    }
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    localStorage.setItem(GEMINI_KEY_STORAGE_KEY, key);
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState('');
    localStorage.removeItem(GEMINI_KEY_STORAGE_KEY);
  }, []);

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    hasApiKey: Boolean(apiKey),
  };
}
