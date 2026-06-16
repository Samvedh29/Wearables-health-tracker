import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/ui/page-header';
import { ApiKeySettings } from '@/components/ai-chat/ApiKeySettings';
import { ChatWidget } from '@/components/ai-chat/ChatWidget';
import { useGeminiKey } from '@/hooks/use-gemini-key';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export const Route = createFileRoute('/_authenticated/ai-chat')({
  component: AiChatPage,
});

function AiChatPage() {
  const { hasApiKey, setApiKey } = useGeminiKey();
  const [inputValue, setInputValue] = useState('');

  const handleSave = () => {
    if (inputValue.trim()) {
      setApiKey(inputValue.trim());
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="AI Health Coach"
        description="Chat with your personal AI coach powered by your wearable data"
      />
      
      <div className="grid gap-6">
        <ApiKeySettings />
        <ChatWidget />
      </div>

      <Dialog open={!hasApiKey}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to AI Health Coach</DialogTitle>
            <DialogDescription>
              To get started, please enter your Google Gemini API key. This key is stored locally in your browser and never sent to our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 pt-4">
            <Input
              type="password"
              placeholder="AIzaSy..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button onClick={handleSave} disabled={!inputValue.trim()}>
              Save
            </Button>
          </div>
          <div className="text-xs text-muted-foreground pt-2">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Get a Gemini API key here
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
