"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export interface Message {
  id: string;
  sender: 'user' | 'butler';
  content: React.ReactNode;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b">
         <div className="flex items-center gap-3">
            <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">DB</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-lg font-bold font-headline">Drive Butler</h2>
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-sm text-muted-foreground">Online</p>
                </div>
            </div>
         </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-6 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'butler' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-3 shadow-sm ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  <div className="text-sm">{message.content}</div>
                </div>
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                        <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && !deleteConfirmation && (
              <div className="flex items-end gap-2 justify-start">
                 <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                 <div className="max-w-xs md:max-w-md lg:max-w-lg rounded-xl px-4 py-3 bg-card flex items-center gap-2 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    <span className="text-sm">Thinking...</span>
                 </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4 bg-muted/50">
        <div className="flex w-full items-center space-x-2">
          <Input type="text" placeholder="Type a command... e.g. LIST /ProjectX" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={isLoading} className="bg-card" />
          <Button type="submit" onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
