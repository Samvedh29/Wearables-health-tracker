import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { TypingIndicator } from './TypingIndicator';
import { useGeminiKey } from '@/hooks/use-gemini-key';
import { fetchHealthContext, buildSystemPrompt, streamGeminiResponse } from '@/lib/ai/gemini';
import type { ChatMessage } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { useUsers } from '@/hooks/api/use-users';

// Simple markdown renderer for AI responses
const renderMarkdown = (text: string) => {
  if (!text) return null;
  
  // Basic rendering for bold text and line breaks
  const paragraphs = text.split('\n');
  return (
    <div className="space-y-2">
      {paragraphs.map((p, i) => {
        if (!p.trim()) return <br key={i} />;
        
        // Render lists
        if (p.startsWith('- ') || p.startsWith('* ')) {
          return (
            <div key={i} className="flex pl-4">
              <span className="mr-2 text-primary">•</span>
              <span dangerouslySetInnerHTML={{ __html: p.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          );
        }
        
        // Render bold
        const html = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </div>
  );
};

export function ChatWidget() {
  const { apiKey, hasApiKey } = useGeminiKey();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // For simplicity, we fetch the first user to use as context
  // In a real app, this might be a selected user from a dropdown
  const { data: usersData } = useUsers({ limit: 1 });
  const selectedUserId = usersData?.items?.[0]?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !hasApiKey || isLoading || !selectedUserId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    const botMessageId = (Date.now() + 1).toString();
    
    // Add empty bot message for streaming
    setMessages((prev) => [
      ...prev,
      {
        id: botMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      },
    ]);

    try {
      // 1. Fetch Health Context
      const healthData = await fetchHealthContext(selectedUserId);
      
      // 2. Build Prompt
      const systemPrompt = buildSystemPrompt(healthData);
      
      // 3. Call Gemini API & Stream
      // We pass the full message history up to the user message
      const historyForApi = [...messages, userMessage];
      
      await streamGeminiResponse(
        apiKey, 
        systemPrompt, 
        historyForApi, 
        (chunk) => {
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === botMessageId 
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to generate response');
      // Remove the empty bot message if it failed completely before streaming started
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.role === 'assistant' && !lastMsg.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedPrompts = [
    "How is my recovery looking this week?",
    "Based on my sleep, should I train hard today?",
    "Analyze my recent workouts and suggest improvements."
  ];

  return (
    <Card className="flex flex-col h-[600px] max-h-[70vh] border-border/60 bg-card/40 backdrop-blur-xl overflow-hidden shadow-xl">
      {/* Chat History */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-80">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center glow-ambient">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-medium text-foreground">AI Health Coach</h3>
              <p className="text-sm text-muted-foreground">
                I have full access to your recent sleep and workout data. Ask me anything about your recovery or training!
              </p>
            </div>
            
            <div className="flex flex-col w-full max-w-sm gap-2">
              {suggestedPrompts.map((prompt, i) => (
                <button 
                  key={i}
                  onClick={() => setInputValue(prompt)}
                  className="px-4 py-2 text-sm text-left border border-border/50 rounded-lg hover:bg-white/5 hover:border-primary/30 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex w-full",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div 
                className={cn(
                  "flex max-w-[85%] gap-3",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === 'user' ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={cn(
                  "p-4 rounded-2xl",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : "bg-card border border-border/50 rounded-tl-sm"
                )}>
                  <div className={cn(
                    "text-sm", 
                    msg.role === 'user' ? "text-primary-foreground font-medium" : "text-foreground"
                  )}>
                    {msg.content ? renderMarkdown(msg.content) : (
                      isLoading && msg.role === 'assistant' ? null : "..."
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <TypingIndicator />
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input Area */}
      <div className="p-4 bg-background/50 border-t border-border/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={!hasApiKey ? "Configure API Key above to start..." : "Ask your AI coach..."}
            disabled={!hasApiKey || isLoading}
            className="flex-1 bg-background"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || !hasApiKey || isLoading}
            size="icon"
            className={cn(
              "shrink-0",
              inputValue.trim() && hasApiKey && !isLoading ? "glow-primary bg-primary hover:bg-primary-hover text-primary-foreground" : ""
            )}
          >
            <Send className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
