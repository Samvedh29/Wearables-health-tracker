import { useState } from 'react';
import { Key, Save, Trash2, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGeminiKey } from '@/hooks/use-gemini-key';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ApiKeySettings() {
  const { apiKey, setApiKey, clearApiKey, hasApiKey } = useGeminiKey();
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(!hasApiKey);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (inputValue.trim()) {
      setApiKey(inputValue.trim());
      setInputValue('');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    clearApiKey();
    setIsExpanded(true);
  };

  const maskedKey = hasApiKey
    ? `AIza...${apiKey.slice(-4)}`
    : '';

  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur-xl mb-6 transition-all duration-300">
      <CardHeader className="pb-3 pt-4 px-5 cursor-pointer flex flex-row items-center justify-between" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            Gemini API Key
          </CardTitle>
          {!isExpanded && (
            <CardDescription>
              {hasApiKey ? (
                <span className="flex items-center gap-1.5 text-success">
                  <Check className="w-3.5 h-3.5" /> Key securely configured
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-warning">
                  <AlertCircle className="w-3.5 h-3.5" /> API key required for AI chat
                </span>
              )}
            </CardDescription>
          )}
        </div>
        <div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="px-5 pb-5 pt-0 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your API key is stored securely in your browser's local storage and is never sent to our servers. It's only used to communicate directly with the Google Gemini API.
            </p>
            
            {hasApiKey ? (
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Current Key</span>
                  <span className="text-xs text-muted-foreground font-mono mt-1">{maskedKey}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClear}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Remove Key
                </Button>
              </div>
            ) : (
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Input 
                    type="password" 
                    placeholder="AIzaSy..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="font-mono text-sm"
                  />
                </div>
                <Button 
                  onClick={handleSave} 
                  disabled={!inputValue.trim()}
                  className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50"
                >
                  {isSaved ? <Check className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                  {isSaved ? 'Saved' : 'Save Key'}
                </Button>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground flex justify-between items-center pt-2">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-primary hover:underline hover:text-primary-glow flex items-center gap-1"
              >
                Get a Gemini API key ↗
              </a>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
